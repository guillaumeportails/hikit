// nztopomaps:
//      Sur Z=5..9, c'est une photo d'assemblage de cartes => l�gende illisible (trop petit)
//      Les Z=10,11,12 ont le meme detail, le 10 est illisible (l�gende minuscule)
//      Les Z=13,14,15 ont le meme detail, le 13 est illisible (l�gende minuscule)
//      Il vaut mieux alors utiliser OTM a ces Z.
//
// LINZ Data Service    https://data.linz.govt.nz/layer/767-nz-topo50-maps/webservices/
//      http://tiles-{s}.data-cdn.linz.govt.nz/services;key='   // s='abcd'
//		+ 'b0542c447ceb4901a8363b54f2441727'
//		+ '/tiles/v4/layer=xxx/EPSG:3857/{z}/{x}/{y}.png';
//    layer 2343 : NZ Topo50  gridless   details constants 1cm=500m
//                 valable pour Z=13..14 l�gendes et routes illisibles a Z<=12
//    layer 2324 : NZ Topo250 gridless   details constant 1cm=2500m
//                 valable pour Z=10..12 l�gendes et routes illisibles a Z<=9, limite pour 10
//
// Meilleure carte de Nouvelle-Zelande selon Z :
//  <=8   OTM
//    9
//   10   OSM ou outdoors
//   11   nztopomaps  (un peu petit)
//   12   nztopomaps
//   13   nztopomaps (plus de nom), ou OTM (camp mieux visibles)
//   14   nztopomaps  (mais camp pas tous marques)
//   15   nztopomaps
//   16   OSM         (ou outdoors mais le TA y est en dur)
//   17   OSM
// On peut construire cet empilement avec MOBAC et ses customMapSource/minZoom/maxZoom, ou bien avec
// un server HTTP local dedie
//
// Cf http://wiki.openstreetmap.org/wiki/Zoom_levels
//    Z    m/pixel    km/tile   (256pixels/tile, m pour lat=0)
//   10    152        39
//   11     76        19
//   12     38        10
//   13     19         4.9
//   14      9.5       2.440
//   15      4.8       1.220
//   16      2.4       0.610
//   17      1.2       0.306
//   18      0.6       0.153

var tilesNztopomaps = new L.TileLayer(
	'http://nz1.nztopomaps.com/{z}/{x}/{y}.png',
	{	maxZoom: 15,		// Offre du z=15 mais 15 n'a pas plus de detail que 14 et 13.
		continuousWorld: true,
		tms: true, //true pour nztopomaps
		attribution: 'nztopomaps.com, Sourced from LINZ. CC-BY 3.0' });

var tilesLDS50 = new L.TileLayer(
    'https://tiles-{s}.data-cdn.linz.govt.nz/services;key='
        + 'b0542c447ceb4901a8363b54f2441727'
        + '/tiles/v4/layer=2343,style=auto/{z}/{x}/{y}.png',
	{	maxZoom: 18,
		subdomains: 'ab',
		continuousWorld: true,
		tms: true,
		attribution: 'LINZ Data Service, CC-BY 3.0' });

var tilesLDS250 = new L.TileLayer(
    'http://tiles-{s}.data-cdn.linz.govt.nz/services;key='
					+ 'b0542c447ceb4901a8363b54f2441727'
					+ '/tiles/v4/layer=2324/EPSG:3857/{z}/{x}/{y}.png',
	{	maxZoom: 18,
		subdomains: 'ab',
		continuousWorld: true,
		tms: true,
		attribution: 'LINZ Data Service, CC-BY 3.0' });

var tilesWatercolor = new L.TileLayer(
	'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
	{   maxZoom: 17,
		attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0' });

var tilesToner = new L.TileLayer(
	'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
	{   maxZoom: 15,
		attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0' });

var tilesTerrain = L.tileLayer(
    'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}',
	{	maxZoom: 18,
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		ext: 'png' });

var tilesOSM = new L.TileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	{   maxZoom: 19,
		subdomains: 'abc',
		attribution: 'OpenStreetMap. CC-BY 3.0' });

var tilesOCM = new L.TileLayer(
	'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
	{   maxZoom: 19,
		subdomains: 'ab',
		attribution: 'OpenCycleMap. CC-BY 3.0' });

var tilesOTM = new L.TileLayer(
	'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',  /* https pour le site OTM uniquement */
	{   maxZoom: 17,
		subdomains: 'abc',
		attribution: '&copy; <a href="http://opentopomap.org/credits">OpenTopoMap</a> CC-BY-SA' });

var tilesOutdoors = new L.TileLayer(
	'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=d2842e9679314b55a9c0a84e94961f0e',
	{   maxZoom: 17,
		subdomains: 'ab',
		attribution: 'Thunderforest.com. CC-BY 3.0' });

var tilesHikeBike = new L.TileLayer(
	'http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
	{   maxZoom: 17,
		subdomains: 'abc',
		attribution: 'Thunderforest.com. CC-BY 3.0' });

var tilesDelorme = new L.TileLayer(
	'http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}',
	{   minZoom: 1, maxZoom: 11,
		attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme' });

var tilesWorldStreets = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
	{	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012' });

var tilesImagery = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
	{	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' });
	
var tilesKorona = new L.TileLayer(
	'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
	{   minZoom: 1, maxZoom: 18,
		attribution: 'Tiles &copy; Korona Uni-Heidelberg' });
		
var tilesLocal = new L.TileLayer(                   // Special : server HTTP local pour mix
	'http://localhost:3000/tiles/{z}/{x}/{y}.png',
	{   maxZoom: 19,
		attribution: 'OSM, LINZ, et al., CC-BY-SA' });

var basemaps = {
	'<i>local</i>': tilesLocal,
	'nztopomaps': tilesNztopomaps,
	'NZ Topo50': tilesLDS50,
	'NZ Topo250': tilesLDS250,
	'nztopomaps': tilesNztopomaps,
	'OCM': tilesOCM,
	'OSM': tilesOSM,
	'OTM': tilesOTM,
	'Hike,Bike': tilesHikeBike,
	'Outdoors': tilesOutdoors,
    'DeLorme': tilesDelorme,
	'WorldStreets': tilesWorldStreets,
    'Korona': tilesKorona,
	'watercolor': tilesWatercolor,
	'toner': tilesToner,
	'terrain': tilesTerrain,
	'imagery': tilesImagery
};

// Overlays
var tilesLonvia = new L.TileLayer(
	'http://tile.lonvia.de/hiking/{z}/{x}/{y}.png',
	{   maxZoom: 17,
		attribution: '<a hrf="http://lonvia.de/">Lonvia</a>, et al. CC-BY 3.0' });

var overlays = {
	'Lonvia': tilesLonvia
};


const CDG = [ 49.023433, 2.565565];
const AKL = [-37.011840, 174.786966];
const INV = [-46.418097, 168.30338];
const CEN = [-41.228249, 174.484863];


var map = new L.Map('eltmap', {
  crs: L.CRS.EPSG3857,
  layers: [tilesOutdoors],
  continuousWorld: true,
  worldCopyJump: false,
  zoomControl: false,
//zoomSnap: 0.5,
//zoomDelta: 0.5,
  attributionControl: true
});

L.control.layers(basemaps, overlays, { collapsed: true }).addTo(map);
L.control.scale({metric: true, imperial: true }).addTo(map);


/*--------------------------------------------------------------------
 * custom Control pour juste afficher du texte
 *
 */
 
//var TextControl = L.Control.extend({
//    options: {
//        // Default control position
//        position: 'topleft'
//    },
//    onAdd: function (map) {
//        // Create a container with classname and return it
//        return L.DomUtil.create('div', 'text-control');
//    },
//    setContent: function (content) {
//        // Set the innerHTML of the container
//        this.getContainer().innerHTML = content;
//    }
//});
//var textinfo =  new TextControl().addTo(map);
//function setInfo (content) {
//	textinfo.setContent(content);
//}
const msgelt = document.getElementById('msgmap');
function setInfo (content) {
	msgelt.innerHTML = content;
}


function floatImage(value) {
    const power = 1000000.0;
    return String(Math.round(value * power) / power);
}
function latlonImage(latlng) {
    return floatImage(latlng.lat) + " " + floatImage(latlng.lng);
}


//map.on('mousemove', function onMouseMove(e) {
//  msgelt.innerHTML = 'Current Zoom ' + map.getZoom() + "   " + latlonImage(e.latlng); });

map.on('zoomend', function onZoomChanged (e) {
	setInfo('zoom ' + map.getZoom()); });


map.on('keypress', function onKeyPressed (e) {
	console.log(e);
	console.log(e.originalEvent.charCode);
	if (e.originalEvent.code == 'KeyC') {
		setInfo('Lat Lon: ' + latlonImage(e.latlng)); } });

map.on('click', function onMapClick(e) {
	setInfo(latlonImage(e.latlng)); });


/* Emploi du plugin FileLayer pour charger du KML sur la carte
 */
var control = L.Control.fileLayerLoad({
  //Allows you to use a customized version of L.geoJson.
  //For example if you are using the Proj4Leaflet leaflet plugin,
  //you can pass L.Proj.geoJson and load the files into the
  //L.Proj.GeoJson instead of the L.geoJson.
  layer: L.geoJson,
  //See http://leafletjs.com/reference.html#geojson-options
  layerOptions: {
    style: { color: 'black' },
    filter: function (feature) {
      return (feature.geometry.type == "LineString"); }	
    },
  //Add to map after loading (default: true) ?
  addToMap: true,
  //File size limit in kb (default: 1024) ?
  fileSizeLimit: 4096,
  //Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
  formats: ['.geojson', '.kml', '.gpx']
}).addTo(map);

control.loader.on('data:loaded', function(e) {
  //Add to map layer switcher
  layerswitcher.addOverlay(e.layer, e.filename);
});

var zanim = null; //setInterval(zAnim,1000);


map.setView(CEN, (zanim) ? 1 : 6);


function addGpx(f, n, c='red') {
  omnivore.gpx("tracks/" + f,
		null,
		L.geoJson(null, {
			filter: function(f) { return (f.geometry.type == "LineString"); },
			style:  function(f) { return { color: c}; }}))
	.bindPopup(n).addTo(map);
}

function addKml(f, n, c='blue') {
  omnivore.kml("tracks/" + f,
		null,
		L.geoJson(null, {
			filter: function(f) { return (f.geometry.type == "LineString"); },
			style:  function(f) { return { color: c}; }}))
	.bindPopup(n).addTo(map);
}


//function createCORSRequest(method, url) {
//  var xhr = new XMLHttpRequest();
//  if ("withCredentials" in xhr) {
//    // Check if the XMLHttpRequest object has a "withCredentials" property.
//    // "withCredentials" only exists on XMLHTTPRequest2 objects.
//    xhr.open(method, url, true);
//  } else if (typeof XDomainRequest != "undefined") {
//    // Otherwise, check if XDomainRequest.
//    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
//    xhr = new XDomainRequest();
//    xhr.open(method, url);
//  } else {
//    // Otherwise, CORS is not supported by the browser.
//    xhr = null;
//  }
//  return xhr;
//}

function inreachBubble(prop) {
  return "<table>" +
		"<tr><td><h6>Time</h6></td><td><h6>" + prop.Time + "</h6></td></tr>" +
		"<tr><td>Message</td><td>" + prop.Text + "</td></tr>" +
		 "</table></h6>";
}



const iconPoint = L.icon({ iconUrl: 'icon-walk.png', iconAnchor: [ 5,  5] });
const iconCamp  = L.icon({ iconUrl: 'icon-camp.png', iconAnchor: [15, 15] });

function myKmlParse(xmldoc) {
	line = [];	// Pour reconstruire une L.Polyline des kml <Placemark>
	// Convertir le XMLDocument data en texte geoJSON puis en layer geojson
	// ! toGeoJson.kml() de mapbox 0.3.1 perd les <TimeStamp>
	//   La spec KML dit juste que TimeStamp est au format std de date XML,
	//   qui demande que le suffixe indique le type de temps, ex: Z = UTC
	//   Cf https://developers.google.com/kml/documentation/kmlreference#timestamp
	//      https://www.w3.org/TR/xmlschema-2/#isoformats
	// TODO : si on peut filter-out YQL de ExtendedData pour permettre plus de Placemark,
	//        alors suivre le TimeStamp pour trouver les "Je dors ici".
	const spy = toGeoJSON.kml(xmldoc);
	var lgeo = L.geoJson(toGeoJSON.kml(xmldoc), options = {
		// L'objet LineString du XML n'est pas inclus il est redondant avec l'ensemble de Point
		filter: function(f) { return f.geometry.type == 'Point'; },
		pointToLayer: function(p,latlng) {		// p.geometry = <Point> (<TimeStamp> est perdu ?) p.properties = <ExtendedData>
			console.log("togeoJson.pointToLayer " + p);
			line.push([latlng.lat, latlng.lng]);
			const camp = (p.properties.Text == 'OK, je dors ici.');
			return L.marker(latlng, options = {
					title : "UTC: " + (p.properties.timestamp || p.properties['Time UTC']),	// no HTML
					icon: (camp) ? iconCamp : iconPoint,
					zIndexOffset: (camp) ? 100 : 0 
				}); } });
		L.polyline(line, {color: 'firebrick', weight: 2, smoothFactor: 2}).bindPopup("Actual journey").addTo(map);
		lgeo.bindPopup(function (layer) { return inreachBubble(layer.feature.properties); }).addTo(map);
}


function loadInfos() {
  if (zanim) { clearInterval(zanim); zanim = null; }
  
  const s = {radius: 100000.0, color:'#A8A8A8', weight:1};
  new L.circle([-CDG[0], CDG[1]+180], s).bindPopup("CDG Antipode").addTo(map);
  new L.circle([-INV[0], INV[1]-180], s).bindPopup("Invercargill Antipode").addTo(map);
  new L.polyline([CDG,AKL], {color:'#A8A8A8', weight:1}).addTo(map);
  new L.polyline([INV,CDG], {color:'#A8A8A8', weight:1}).addTo(map);

  addGpx("TeAraroaTrail.gpx", 		"<P>Official Te Araroa</p><p>2016/17 (v35)</p>");

  addKml("pyke-track.kml", 			"Pyke");
  addKml("hollyford-track.kml",		"Hollyford");
  addKml("caples-track.kml",		"Caples");
  addKml("greenstone-track.kml",	"Greenstone");
  addKml("routeburn-track-2.kml",	"Routeburn");

  addKml("FrenchRidge.kml",			"French Ridge");
  addKml("aspiring.kml",			"Aspiring");
//addKml("MatukitukiW.kml",			"West Matukituki");
//addKml("MatukitukiW2.kml",		"West Matukituki");
//addKml("MatukitukiE.kml",			"East Matukituki");

//addKml("feed-example-full.kml",		"Large feed test");
  addKml("2017-07-15-XSD-TBe-01.kml",	"GpsBipBip example<br>2017-07-15-XSD-TBe-01.kml");
  
  console.log("check all KML's");
  $.ajax({
	url: "tracks",
	success: function(data){
		$(data).find("a:contains(.kml)").each(function(){
			console.log("this " + data + " " + $(this)); });
		},
	error: function() { console.log("ajax ls tracks error"); }
  });
  console.log("done");

  const days = 100;
  var d1 = new Date();
  d1.setTime(Date.now() - days*86400*1000)

  // KML du tracking emis par la balise InReach :
  // Cf https://files.delorme.com/support/inreachwebdocs/KML%20Feeds.pdf
  const inreachfeed = 'https://inreach.garmin.com/Feed/Share/'
						+ 'ThierryBernier?d1=' + d1.toJSON();
//									+ '%26d2=' + d2.toJSON();
  
  // omnivore.kml(inreachfeed).bindPopup("Thierry's holidays").addTo(map);
  // => CORS problem : le site de garmin n'allume pas "Access-Control-Allow-Origin"
  //    On ne peut donc pas lire le feed InReach depuis ce JS qui provient d'un domaine
  //    (meme localhost) different de inreachfeed.
  // Quelques contournement possibles :
  // 1) Utiliser un proxy
  // 	Cf http://geographika.co.uk/archive/accessing-cross-domain-data-with-yql.html
  //    Mais le proxy YQL est limite en taille par requete. Il faudrait en concatener
  //    plusieurs, en trouvant la taille limite
  // 2) Amener par le InReachFeed par un autre moyen sur le serveur de ce JS :
  // 	2.1) si ce JS est execute sur un PC local et non pas en provenance du Web,
  //         alors il suffit de precharger le inreachfeed.
  //         Par exemple en profitant du code node.js qui permet de servir localement
  //         des tuiles de a Leaflet.
  //    2.2) si ce JS provient du Web, alors il faut qu'un PC y uploade le InReachFeed.
  // 3) ?
  //    Cf https://github.com/rndme/download : hors-sujet
  //    var xhr = createCORSRequest('GET', inreachfeed);
  //    if (!xhr) { console.log('CORS not supported'); } else {
  //      xhr.onload  = function() { console.log(xhr.responseText); };
  //      xhr.onerror = function() { console.log("error"); };
  //      xhr.withCredentials = true;
  //      xhr.send();
  //    }
  //
  
  if (true) {
    // Emploi du web service YQL pour resoudre CORS :
    // + feed depuis 201507 : 1634 elements ... mais retour vide (trop grand ?)
    // + feed depuis 201707 :  525 elements ... ok.
    // Limiter via https://developer.yahoo.com/yql/guide/paging.html ne semble pas marcher
    // => Changer les dates d1 et d2 dans l'URL de feed inreach
    //    Ex: chartreuse 2017/07 3 jours = 658 items, 1608 Document.elements : ok 

    const yql_query = 'https://query.yahooapis.com/v1/public/'
					+ encodeURI('yql?q=select * from xml where url=')
					+ "%22" + inreachfeed + '%22';
    console.log("InReach  " + inreachfeed);
    console.log("ajax GET " + yql_query);
    $.ajax({
      type: 'GET',
      url: yql_query,
	  dataType: 'xml',
	  contentType: 'text/plain',
	  xhrFields: { withCredentials: true  },
	  headers: { },

	  // TODO:	Cf https://github.com/mapbox/leaflet-omnivore/blob/master/index.js
	  //		pour les param de kml.Parse, qui est kmlParse, qui appelle toGEOJSON mais sans lui passer
	  //		d'options : a faire a la main en incluant ici le code d'appel de toGeoJSON ?
	  success: function(data, textstatus, xhdr) {		// data : XMLDocument
		console.log("GOT " + data.getElementsByTagName('*').length + " elements (proxyed)");
		console.log(data);
		myKmlParse(xmldoc = data);	},
	  error: function() { console.log("ajax error"); }
    });
  } else {
    // Lecture du tracks/feed.kml qui est arrive ici par d'autres moyens ...
    $.ajax({
      type: 'GET',
      url: 'tracks/feed.kml',
	  dataType: 'xml',
	  contentType: 'text/plain',
	  xhrFields: { withCredentials: true  },
	  headers: { },
	  success: function(data, textstatus, xhdr) {		// data : XMLDocument
		console.log("GOT " + data.getElementsByTagName('*').length + " elements (direct)");
		console.log(data);
		myKmlParse(xmldoc = data);	},
	  error: function() { console.log("ajax error"); }
    });
	
  }
}


function zAnim() { map.zoomIn(1); if (map.getZoom() >= 5) loadInfos(); }
if (! zanim) loadInfos();
