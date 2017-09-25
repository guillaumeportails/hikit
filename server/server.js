// C:\Source\MUL\server.js
// Serveur HTTP local avec node.js (qui est installe dans C:\Progs\node.js) :
// Cf http://ericsowell.com/blog/2014/6/17/enough-node-for-building-a-simple-website
//
// Sert :
// + L'arbo de fichiers statiques ./map
// + Le contenu d'un MBTiles local, ou de OSM tuile si absent du MBTiles
//
// Usage :
//    cmd.exe
//        cd where_it_is_copied
//        npm install
//        node server.js
//    firefox
//        http://localhost:3000/tiles/13/7985/5181.png
//
// Cf:
// + http://expressjs.com/en/starter/static-files.html
// + On peut aussi utiliser python3 a la place de node.js :
//   python -m SimpleHTTPServer
// + Plus sophistique dans mapbox, cf tilestream
//   https://jeromegagnonvoyer.wordpress.com/2015/08/06/merging-multiple-mbtiles-together/
//
// * ----------------------------------------------------------------------------
// *  "THE BEER-WARE LICENSE" (Revision 42):
// *  http://about.me/thierrybernier wrote this file. As long as you retain this
// *  notice you can do whatever you want with this stuff, but complain.
// *  If we meet some day, and you think this stuff is worth it, you can buy me
// *  a beer in return (cool, pale or lager preferred).
// * ----------------------------------------------------------------------------
// *
// * Based on node.js, cf https://github.com/nodejs/node/blob/master/LICENSE


var express = require('express');
var MBTiles = require('mbtiles');
var http    = require('http');
var https   = require('https');
var fs      = require('fs');

const dbg = false;

var srvTile = express();


//-------------------------------------------------------------------------------------------------
// Inreach Feed download (via HTTP GET)
//
// Garmin web site does not allow CORS ?
// gotten headers : 'x-frame-options': 'SAMEORIGIN'
// => Local pre-download of the feed, as it cannot be read client-side

function downloadInreach(query) {

	console.log('downloading ' + query);
	
	var file = fs.createWriteStream('../tracks/feed.kml');	// File to read locally
	var s = 0;

	https.get('https://inreach.garmin.com/Feed/Share/' + query, function(res) {
		//console.log('statusCode: ', res.statusCode);
		//console.log('headers: ', res.headers);
		res.on('data', function(data) {
			s += data.length;
            file.write(data);
		});
	    res.on('end', function() {
			console.log ("feed.kml done, " + s + " bytes");
			file.end();
		});
	});
};

downloadInreach('ThierryBernier?d1=2017-07-14T00:00Z');


//-------------------------------------------------------------------------------------------------
// Tiles server

// Que faire des tuiles non trouvees localement dans la base MBTiles ?
//  true  : redirect HTTP 302 vers un serveur Web
//  false : chargement direct depuis un serveur web
const redirect = false;

// URL alternative sur le Web pour une tuile non trouvee localement
function altUrl(z,x,y) {
    return "http://a.tile.osm.org/7/49/53.png";             // Plain blue
    return "http://a.tile.opencyclemap.org/cycle"
            + "/" + z + "/" + x + "/" + y + ".png";
}

// download de la tuile OSM (Zoom=z,Col=x,Row=y), utilise si on ne la trouve pas en local
// => Ca marche pas, remplace par un redirect()
//    ?! Les headers ne transmettent pas content-length et content-type via callback
//    ?! Si on additionne des strings, la taille est plus grande que la normale
// => MOBAC ne traite pas le HTTP 302 redirection. TODO: le faire a sa place ...
// https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding
function webTile(url, callback) {
    if (dbg) console.log('webTile  ' + url);
    http.get(url, function gotChunk (incoming) {        // Use the proper http or https object !
        // incoming est de type http.IncomingMessage qui implemente Readable Stream
        // cf https://nodejs.org/api/http.html#http_http_get_options_callback
        //console.log('incoming ' + JSON.stringify(incoming));
        // cf https://nodejs.org/api/stream.html
        incoming.setEncoding('binary');        // null, 'utf-8', 'binary' = alias de 'latin1'
        var rawData = '';
        incoming.on('data',  function(chunk) {    // chunk est un string
            //console.log("chunk " + typeof(chunk) + " " + chunk.length);
            rawData += chunk; /*rawData.push(chunk);*/ });
        incoming.on('error', function(e) {
            console.log(e); });
        incoming.on('end',   function() {
            //console.log('gotOSM  ' + url); // + ' bytes=' + rawData.length);
            //console.log(incoming.headers);
            callback(new Buffer(rawData, 'binary'), incoming.headers); });
        });
}

//--------------------------------------------
// Servir les MBTiles aux URI /tiles/z/y/x.*
//
// TODO: chercher dans plusieurs bases MBTiles, puis dans le Web en dernier recours

function chainGetTile (cur, req, res) {
    if (dbg) console.log("chainGetTile " + cur.rank);
    cur.mbtiles.getTile(req.params.z, req.params.x, req.params.y, function(err, tile, headers) {
        if (err) {
            if (cur.next != null) {
                // Tuile absente de ce MBTile : tenter le suivant de la liste
                chainGetTile(cur.next, req, res);
            } else {
                // Tuile absente de tous les MBTile : essai de remplacement par une tuile du Web
                if (dbg) console.log("chainGetTile " + cur.rank + " web");
                var weburl = altUrl(req.params.z, req.params.x, req.params.y);
                webTile(weburl, function(img,hdr) {
                    res.header(hdr);
                    res.send(img);
                });
            }
        } else {
            // Tuile trouvee dans ce MBTile
            if (dbg) console.log("chainGetTile " + cur.rank + " found");
            res.header(headers);
            res.send(tile);
        }
    });
}

function chainServe (list) {
    if (dbg) console.log("chainServe (MBTiles opened)");
    srvTile.get('/tiles/:z/:x/:y.:e', function(req, res, next) {
        if (dbg) console.log("chainServe Z" + req.params.z + " X" + req.params.x + " Y" + req.params.y);
        chainGetTile(list, req, res);
        });
}

function chainOpen (list) {
    if (dbg) console.log("chainOpen " + list.rank);
    var ignored = new MBTiles (list.fpath, function(err, mbtiles) {
        if (err) {
            console.log(list.fpath + ":\n    " + err);
            if (list.next != null) chainOpen(list.next); else chainServe(list.first);
        } else {
            list.mbtiles = mbtiles;
            mbtiles.getInfo(function(err,info) {
                if (err) {
                    console.log(err);
                } else {
                    if (dbg) console.log(info);
                    list.info = info;
                }
                if (list.next != null) chainOpen(list.next); else chainServe(list.first);
                });
            }
        });
}

// Ouvrir toutes les bases SQLite de la liste
// + On peut les ouvrir toutes, concurremment. Par contre la recherche d'une tuile
//   donnee doit etre faite dans l'ordre de la liste mbtPaths, et s'arreter a la
//   1ere trouvee: MBTPaths est ordonnee.
//   
function chainTiles (mbtPaths) {
    // Preparer une liste chainee des fournisseurs locaux de tuiles
    // ! for (i in X) parcourt dans un ordre indefini
    var prev = null;
    for (i = mbtPaths.length-1; i >= 0; i--) {
        var cur = { rank: i, next: prev, fpath: mbtPaths[i], mbtiles: undefined, info: undefined };
        prev = cur;
    }
    const first = prev;
    for (cur = first; cur != null; cur = cur.next) {
        cur.first = first;
        if (dbg) console.log(cur.rank,cur.fpath);
    }
    
    // Enchainer les ouvertures des MBTiles
    chainOpen(first);
}

// Liste des DataBases de tuiles locales (cf MOBAC)
const mbtileDepots = [
    "C:/Progs/Maperitive/Tiles/map.mbtiles",
    "C:/GIS/NZ/NZTA_20161112.mbtiles",            // Z=5..14 LINZ, et 15..17 autour de TA
    "C:/GIS/NZ/NZ_South_Island.mbtiles",          // Z=8..14
    "C:/GIS/NZ/NZ_North_Island.mbtiles" ];       // Z=8..14

chainTiles(mbtileDepots);




//--------------------------------------------
// actually create the server(s)

const portTile = 3000;
srvTile.listen(portTile, function () {
    console.log(`Server running at http://localhost:${portTile}/`);
    console.log('Serving tiles from MBTiles files');
	console.log(mbtileDepots);
    });
