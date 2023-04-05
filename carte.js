// Carte Leaflet comprenant :
// + un fond a choisir, possiblement depuis un serveur local (localhost:3000)
// + des traces linestrings des chemins heberges sur le meme site que ce script
// + le feed InReach (points)
//
// Refs :
//  https://geojson.org/geojson-spec.html
//
//
// Autres que LeafLet :
// + mapbox             meme filiation,   support 3D
// + cesiumjs           vise la 3D
// + openlayers
// + maplibre-gl-js     open-source fork of mapbox-gl-js



// function addslashes(str) {
//     return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
// }


// Static map features (tracks, etc)
// + without assert, strict MIME type checking forbids load of a JSON file
//   + Edge 110.0.1587.56  : OK
//   + Firefox 97          : KO "import assertions are not currently supported"
//   https://caniuse.com/mdn-javascript_statements_import_import_assertions
//      "This feature is non-standard and should not be used without careful consideration."
//   https://marian-caikovski.medium.com/how-to-import-json-into-javascript-module-json-modules-e6721e19a314
//import geoCDG_CrazyCook  from './tracks/CDG_CrazyCook.json';       //assert {type: 'json'};
//import geoCDT_HalfMile   from './tracks/CDT_HalfMile_2020.json';   //assert {type: 'json'};
//import geoCDT_Plan       from './tracks/CDT2023_Plan.json';        //assert {type: 'json'};
// Cf build.sh


// Source de tuiles/cartes 
//
// Cf https://leaflet-extras.github.io/leaflet-providers/preview/
//
// Cf https://wiki.openstreetmap.org/wiki/Zoom_levels
//    Z    m/pixel    km/tile   (256pixels/tile, m pour lat=0)
//    9                 80.0
//   10    152.0        39.0
//   11     76.0        19.0            1 degre     = 111km
//   12     38.0        10.0            0.001 deg   = 111m
//   13     19.0         4.9            4 decimales = 11m
//   14      9.5         2.440          5 decimales = 1m
//   15      4.8         1.220
//   16      2.4         0.610
//   17      1.2         0.306
//   18      0.6         0.153
//
// Autres :
// + https://www.tracestrack.com/
//   Est en fait OSM et OTM
//

const Zoom2Mile = [
    // 0     1     2     3     4    5    6
    0, 0, 0, 0, 1000, 500, 200,
    // 7    8    9  10  11  12 13 14 15 16 17 18 19 20 21 22 23 24 25
    100, 50, 20, 10, 5, 5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];


const tilesWatercolor = new L.TileLayer(
    'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {      // NOT https
    maxZoom: 17,
    attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0'
});

const tilesToner = new L.TileLayer(
    'http://tile.stamen.com/toner/{z}/{x}/{y}.png', {          // NOT https
    maxZoom: 15,
    attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0'
});

const tilesTerrain = L.tileLayer(
    'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
    maxZoom: 18,
    attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    ext: 'png'
});

const tilesOSM = new L.TileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    subdomains: 'abc',
    attribution: 'OpenStreetMap. CC-BY 3.0'
});

const tilesOTM = new L.TileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', /* https pour le site OTM uniquement ?*/ {
    maxZoom: 17,
    subdomains: 'abc',
    attribution: '&copy; <a href="https://opentopomap.org/credits">OpenTopoMap</a> CC-BY-SA'
});

const tilesUSGS = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,    // said 20, but seems 16
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

const tilesUSGSimageryTopo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,    // said 20 but seems 16
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

const tilesOutdoors = new L.TileLayer(
    'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=d2842e9679314b55a9c0a84e94961f0e', {
    maxZoom: 17,
    subdomains: 'ab',
    attribution: '<a href="https://www.thunderforest.com">Thunderforest, CC-BY 3.0</a>'
});

const tilesHikeBike = new L.TileLayer(
    'https://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
    maxZoom: 17,
    subdomains: 'abc',
    attribution: '<a href="https://www.thunderforest.com">Thunderforest, CC-BY 3.0</a>'
});

const tilesDelorme = new L.TileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 1,
    maxZoom: 11,
    attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme'
});

const tilesWorldStreets = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

const tilesImagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const tilesKorona = new L.TileLayer(
    'https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
    minZoom: 1,
    maxZoom: 18,
    attribution: 'Tiles &copy; Korona Uni-Heidelberg'
});

const tilesLocal = new L.TileLayer( // Special : server HTTP local pour mix
    'https://localhost:3000/tiles/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'OSM, LINZ, et al., CC-BY-SA'
});

const basemaps = {
    'OSM': tilesOSM,
    'OTM (m)': tilesOTM,
    //  'Hike,Bike': tilesHikeBike,
    'USGS (ft)': tilesUSGS,
    'USGS imagery': tilesUSGSimageryTopo,
    'Outdoors (m)': tilesOutdoors,
    'DeLorme': tilesDelorme,
    'WorldStreets': tilesWorldStreets,
    //  'Korona': tilesKorona,
    'watercolor': tilesWatercolor,
    'toner': tilesToner,
    'terrain': tilesTerrain,
    'imagery': tilesImagery
};

// Overlays
const tilesWayMarkedTrails = new L.TileLayer(
    'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '<a href="hiking.waymarkedtrails.org">waymarkedtrails.org</a>. CC-SA 3.0'
});


const overlays = {
    'Waymarkedtrails': tilesWayMarkedTrails
};


const iconPoint = L.icon({
    iconUrl: 'icon-walk.png',
    iconAnchor: [5, 5]
});
const iconCamp = L.icon({
    iconUrl: 'icon-camp.png',
    iconAnchor: [5, 5]
});
const iconTarget = L.icon({
    iconUrl: 'icon-target.png',
    iconAnchor: [15, 15]
});
const iconCross = L.icon({
    iconUrl: 'icon-cross.png',
    iconAnchor: [7, 7]
});


var firstfly = true;
var flownTo = new Set();
var ttMilestone = [];            // Tootip array : miles mark

// Approx bounds of the CDT, geoJSON format  [ lng lat ]
const cdtBounds = [
    [-114.0, 49.0],
    [-105.0, 49.0],
    [-105.0, 31.0],
    [-114.0, 31.0]
];
// less approx
const cdtPolygon = [
    [-113.326252, 46.375386],
    [-114.775113, 48.992727],
    [-114.695734, 45.700459],
    [-113.460733, 44.118182],
    [-107.028708, 39.752045],
    [-108.408835, 37.928690],
    [-107.100957, 36.536929],
    [-108.790538, 35.000747],
    [-108.965692, 31.299239],
    [-107.743995, 31.297717],
    [-107.198116, 34.979334],
    [-105.709069, 36.582693],
    [-105.207683, 40.708463],
    [-111.465271, 45.531042],
    [-112.300283, 49.037458],
    [-114.775113, 48.992727]
];

const map = new L.Map('eltmap', {
    crs: L.CRS.EPSG3857,
    layers: [tilesOutdoors],
    continuousWorld: true,
    worldCopyJump: false,
    zoomControl: false,
    //zoomSnap: 0.5,
    //zoomDelta: 0.5,
    attributionControl: true
});

const mapCtrlLayers = L.control.layers(basemaps, overlays, {
    collapsed: true
}).addTo(map);

var lgPlaces = null;
//mapCtrlLayers.addOverlay(lgPlaces, 'Places');

// Control : zoom
L.control.scale({
    metric: true,
    imperial: true
}).addTo(map);

// Control : search an address
//      https://github.com/perliedman/leaflet-control-geocoder
L.Control.geocoder().addTo(map);


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
//  textinfo.setContent(content);
//}
const msgelt = document.getElementById('msgmap');

function setInfo(content) {
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

map.on('zoomend', function onZoomChanged(e) {
    //setInfo('zoom ' + map.getZoom());
});


map.on('keypress', function onKeyPressed(e) {
    console.log(e);
    console.log(e.originalEvent.charCode);
    if (e.originalEvent.code == 'KeyC') {
        setInfo('Lat Lon: ' + latlonImage(e.latlng));
    }
});

map.on('click', e => {
    setInfo(`${latlonImage(e.latlng)}  z${map.getZoom()}`);
});


// Emploi du plugin FileLayer pour charger du KML local sur la carte
// + Cas ou l'utilisateur voudrait ajouter ses propres GPX/KML
var control = L.Control.fileLayerLoad({
    //Allows you to use a customized version of L.geoJson.
    //For example if you are using the Proj4Leaflet leaflet plugin,
    //you can pass L.Proj.geoJson and load the files into the
    //L.Proj.GeoJson instead of the L.geoJson.
    layer: L.geoJson,
    //See https://leafletjs.com/reference.html#geojson-options
    layerOptions: {
        style: {
            color: 'black'
        },
        filter: function (feature) {
            return (feature.geometry.type == "LineString");
        }
    },
    //Add to map after loading (default: true) ?
    addToMap: true,
    //File size limit in kb (default: 1024) ?
    fileSizeLimit: 4096,
    //Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
    formats: ['.geojson', '.kml', '.gpx']
}).addTo(map);

control.loader.on('data:loaded', function (e) {
    //Add to map layer switcher
    layerswitcher.addOverlay(e.layer, e.filename);
});

var zanim = null; //setInterval(zAnim,1000);


// Commencer avec :
// + une vue globale trajet     [31.803, -42.367]   z3
map.setView([31.803, -42.367], (zanim) ? 1 : 3);


// GPX layer from a JSON
function layerGpx(geojson, style) {
    return L.geoJson(geojson, {
        //      filter: function (f) { return (f.geometry.type == 'LineString'); },
        style: function (f) { return style; },
        onEachFeature: function (f, layer) {
            var tt = '';
            if (f.properties && f.properties.name) {
                tt = '<strong><center>' + f.properties.name + '</center></strong>';
            }
            if (tt != '') layer.bindTooltip(tt, { sticky: true });       // For polylines !
            if (f.geometry.type == 'Point') layer.setIcon(iconCross);
        }
    });
}

// GPX layer from a file
function addGpx(f, s = { color: 'red' }) {
    return omnivore.gpx('tracks/' + f, null, layerGpx(null, s));
}


// KML layer from a JSON   (KML is more style'able than GPX)
// ! GpsBabel de transcode pas les styles (il s'occupe de geometrie)
function layerKml(geojson, style = { color: '', weight: 3, opacity: 1 }) {
    return L.geoJson(geojson, {
        style: function (f) {   // https://leafletjs.com/reference.html#path-option
            return {            // Transcode the styling found in KML  !Placemarks not caught here
                color: (f.properties.stroke) ? f.properties.stroke : style.color,
                opacity: (f.properties['stroke-opacity']) ? f.properties['stroke-opacity'] : style.opacity,
                weight: (f.properties['stroke-width']) ? f.properties['stroke-width'] : style.weight
            };
        },
        onEachFeature: function (f, layer) {
            var tt = '';
            if (f.properties && f.properties.name) {
                tt = '<strong><center>' + f.properties.name + '</center></strong>';
            }
            if (f.properties && f.properties.description) {
                tt = tt + '<p>' + f.properties.description + '</p>';
            }
            if (tt != '') layer.bindTooltip(tt, { sticky: true });
            if (f.geometry.type == 'Point') layer.setIcon(iconTarget);
        }
    });
}

// KML layer from a file
function addKml(f, style) {
    return omnivore.kml('tracks/' + f, null, layerKml(null, style.color));
}



function inreachBubble(prop) {
    return "<table>"
        + "<tr><td><h6>Time</h6></td><td><h6>"
        + (new Date(prop.timestamp)).toLocaleString() + "</h6></td></tr>"
        + "</table>"
        + ((prop.Text) ? ("<h5>" + prop.Text + "</h5>") : "");
}


// Convertir le texte XML en layer Leaflet dans la map / overlay
// ! toGeoJson.kml() de mapbox 0.3.1 perd les <TimeStamp>
//   La spec KML dit juste que TimeStamp est au format std de date XML,
//   qui demande que le suffixe indique le type de temps, ex: Z = UTC
//   Cf https://developers.google.com/kml/documentation/kmlreference#timestamp
//      https://www.w3.org/TR/xmlschema-2/#isoformats
// TODO : si on peut filter-out YQL de ExtendedData pour permettre plus de Placemark,
//        alors suivre le TimeStamp pour trouver les "Je dors ici".
// Cf https://github.com/mapbox/leaflet-omnivore/blob/master/index.js
//  pour les param de kml.Parse, qui est kmlParse, qui appelle toGEOJSON mais sans lui passer
//  d'options : fait a la main en incluant ici le code d'appel de toGeoJSON

function inreachKmlParse(xmldoc, title, cmt) {
    var line = [];          // Pour reconstruire une L.Polyline des kml <Placemark>
    var prev = null;
    var wasz = false;
    var timl = new Date();
    var mgrp = L.markerClusterGroup({
        animate: true,
        disableClusteringAtZoom: 12
    });
    var inreachLayer = L.geoJson(null, {
        filter: function (f) {
            // L'objet LineString du XML n'est pas inclus il est redondant avec l'ensemble de Point
            // f.properties contient tous les champs du KML :
            //       "Course": "0.00 ° True"
            //       "Device Identifier": ""
            //       "Device Type": "inReach 2.5"
            //       "Elevation": "1259.72 m from MSL"
            //       "Event": "Le suivi a été activé depuis l'appareil."
            //       "IMEI": "30...60"
            //       "Id": "40..50"
            //       "In Emergency": "False"
            //       "Incident Id": ""
            //       "Latitude": "46.080083"
            //       "Longitude": "6.618876"
            //       "Map Display Name": "T...r"
            //       "Name": "T...r"
            //       "SpatialRefSystem": "WGS84"
            //       "Text": ""
            //       "Time": "6/19/2020 11:59:15 AM"
            //       "Time UTC": "6/19/2020 9:59:15 AM"
            //       "Valid GPS Fix": "True"
            //       "Velocity": "0.0 km/h"
            //       "styleHash": "347c351a"
            //       "styleUrl": "#style_118255"
            return f.geometry.type == 'Point';
        },
        pointToLayer: function (p, latlng) {
            // Vu filter ci-dessus, p est un Point et p.properties contient la meme chose que f.properties ci-dessus
            // On peut donc reconstruire une polyline unique (ce Feed est suppose etre une seule sortie) en detectant
            // les bivouacs via le temps entre deux points :
            // NB: Date() compte du temps UTC ... mais ses methodes affichent par defaut du temps Zulu/local
            line.push([latlng.lat, latlng.lng]);
            // Choix de l'icone (du point precedent)
            const ts = new Date(p.properties['Time UTC']);
            wasz = (ts > timl); //(p.properties.Text == 'OK, je dors ici.');
            timl.setTime(ts.getTime() + 5 * 3600 * 1000); // Arret de plus de 5h = Zzzz
            if (prev && (wasz /*|| (p.properties.Text != '')*/)) {
                prev.setIcon(iconCamp);
                prev.setZIndexOffset(100);  // Les campements "au dessus" des points de marche
            }
            // Icone horaire (en UTC) et message
            var t = null;
            if (p.properties.timestamp)
                t = new Date(p.properties.timestamp).toLocaleString();
            else
                t = "UTC: " + new Date(p.properties['Time UTC']).toLocaleString();
            if (p.properties.Text != '') t += '\n' + p.properties.Text;
            prev = L.marker(latlng, options = {
                title: t, // no HTML
                icon: (p.properties.Text == '') ? iconPoint : iconCamp,  // Camp or something
                zIndexOffset: 0
            });
            return prev;
        }
    });
    var lgeo = omnivore.kml.parse(xmldoc, null, inreachLayer);
    if (line.length > 0) {
        mlin = L.polyline(line, {
            color: 'olive',
            weight: 2,
            smoothFactor: 2
        }).bindPopup(title).addTo(mgrp);
        lgeo.bindPopup(function (layer) {
            return inreachBubble(layer.feature.properties);
        }).addTo(mgrp);
        mapCtrlLayers.addOverlay(mgrp, cmt);
        map.addLayer(mgrp);
    }
}

async function fetchInreach(url, cmt) {
    console.log('fetchInreach ' + cmt);
    try {
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.google-earth.kml+xml,text/html,application/xhtml+xml,application/xml,*/*;'
            }
        });
        if ((resp.status < 200) || (resp.status > 299)) {
            console.log(`fetchInreach ${cmt} FAILED ${resp.status}`);
            return false;
        }
        console.log(`fetchInreach ${cmt} GOT`);
        const xmlstr = await resp.text();
        console.log(`fetchInreach ${cmt}: XML ${xmlstr.substring(1, 30)}...`);
        // Le KML du feed InReach est particulier, on utilise un parser particulier
        // plutot que :
        //   const lInreach = omnivore.kml.parse(xml, null, layerKml(null, 'darkgreen'));
        //   mapCtrlLayers.addOverlay(lInreach, `Actual ${d2}`);
        //   lInreach.addTo(map);
        inreachKmlParse(xmldoc = xmlstr, title = 'InReach', cmt = cmt);
        return true;
    } catch (e) {
        console.log(`fetchInreach ${cmt} caught ${e}`);
        return false;
    }
}


async function loadInfos() {
    if (zanim) {
        clearInterval(zanim);
        zanim = null;
    }

    const s = {
        radius: 100000.0,
        color: '#A8A8A8',
        weight: 1
    };

    //------ Layer : Going there from home
    // Ref: https://github.com/henrythasler/Leaflet.Geodesic
    var lgStart = L.featureGroup();
    const CDG = { lng: 2.5509443, lat: 49.0080713 };
    const YYC = { lng: -114.0101401, lat: 51.131069 };
    const PHX = { lng: -112.010124, lat: 33.435249 };
    const g1 = new L.Geodesic([[CDG, YYC], [YYC, PHX]], {
        steps: 6, weight: 5, opacity: 0.5
    }).bindTooltip('CDG to PHX via YYC', { sticky: true });
    lgStart.addLayer(g1);
    const k1 = layerKml(geoCDG_CrazyCook);
    lgStart.addLayer(k1);
    mapCtrlLayers.addOverlay(lgStart, 'Going to Crazy Cook');
    lgStart.addTo(map);

    //------ Layer : The Plan
    const lgPlan = L.featureGroup();
    lgPlan.addLayer(layerGpx(geoCDT2023_plan, { color: 'DarkOrchid', weight: 3, opacity: 1.0 }));
    const lgPOI = L.markerClusterGroup({ showCoverageOnHover: false });
    lgPOI.addLayer(layerKml(geoPlaces));
    lgPlan.addLayer(lgPOI);
    mapCtrlLayers.addOverlay(lgPlan, 'The Plan (hopefully)');
    lgPlan.addTo(map);

    //------ Layer : Offical trail
    // ! Le GPX lu est "en dur" avec un point par 0.5mi, donc on peut reconstruire les 3000 tooltip
    //   de chaque mile
    //   Les milestone doivent etre filtrees : faire des openTooltip ne suffit pas, du moment qu'il y
    //   a 3000 Tooltip dans map, ca rame. Il ne faut en inclure qu'un nombre limite (qq 10),
    //   seulement ceux qui sont visible au zoom/position actuelle
    //   Comme il n'y a pas de plugin adequat, on controle le pseudo groupe de milestone de facon
    //   liee a la polyline Red Line
    //
    // Alternatives :
    // + https://github.com/adoroszlai/leaflet-distance-markers
    //   <script src="leaflet-distance-marker.js"></script>
    //   => KO, le calcul de distance ne convient pas car le GPX est trop grossier
    //      utiliser les noms du GPX
    // + var lgMI = L.markerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false });
    //   var lgMI = L.featureGroup();
    //  mapCtrlLayers.addOverlay(lgMI, 'Official CDT Miles');
    //  map.addLayer(lgMI);
    //
    // lgRL.getBounds() ... il faut attendre hm.once('ready') => C'est aussi simple d'avoir en dur ce Bounds
    var lgRL = L.featureGroup(null, { attribution: 'CDTC' });
    const rlStyle = { color: 'red', weight: 8, opacity: 0.7 };
    const layerRL = layerGpx(geoCDT_HalfMile_2020, rlStyle);
    lgRL.addLayer(layerRL);
    ttMilestone = [];
    {                                                                         // ? Qui a inverse lng,lat ?
        const coords = geoCDT_HalfMile_2020.features[0].geometry.coordinates; //.map(x => { return [x[1], x[0]]; });
        for (let i = 0; i < coords.length; i += 2) {
            const mile = i / 2;
            ttMilestone[mile] = L.tooltip([coords[i][1], coords[i][0]], { content: mile.toString(), className: 'milestone' });
        }
    }
    mapCtrlLayers.addOverlay(lgRL, 'Official CDT Milestones');
    //
    // Les ttMilestone[] sont ajoutes ou non a la carte selon le zoom
    function toggleMilestone(data) {
        if (data.layer && (data.layer != lgRL)) return;
        const m = Zoom2Mile[map.getZoom()];
        if ((m != 0) && map.hasLayer(lgRL)) {
            ttMilestone.forEach((tt, i) => {
                if (((i % m) == 0) && map.getBounds().contains(tt.getLatLng()))
                    tt.addTo(map);
                else
                    tt.remove();
            });
            if (ttMilestone.length > 0) ttMilestone[ttMilestone.length - 1].addTo(map);
        } else
            ttMilestone.forEach((tt) => tt.remove());
    }
    map.on('zoomend', toggleMilestone);
    map.on('moveend', toggleMilestone);
    map.on('overlayadd', toggleMilestone);
    map.on('overlayremove', toggleMilestone);


    //------ Layer : Native Land
    // Ref:     https://native-land.ca/resources/api-docs/
    //          geoJsonFeature.properties: 
    //​             ID: 12345,
    //​             Name: "Newe Sogobia (Eastern Shoshone)"
    //​             Slug: "eastern-shoshone"
    //​             color: "#386ECB"
    //​             description: "https://native-land.ca/maps/territories/eastern-shoshone/"
    var lgNative = L.featureGroup(null, { attribution: '<a href="https://native-land.ca">native-land.ca</a>' });
    fetch('https://native-land.ca/wp-json/nativeland/v1/api/index.php', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'maps': 'territories',
            'polygon_geojson': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [cdtPolygon]
                    }
                }]
            }
        })
    }).then(resp => resp.json()
    ).then(json => {
        //      console.log("got native land json");
        const layerNative = L.geoJson({ 'type': 'FeatureCollection', 'features': json }, {
            style: f => { return { color: f.properties.color }; }
        }).bindPopup(layer => layer.feature.properties.Name);
        lgNative.addLayer(layerNative).addTo(map);
        mapCtrlLayers.addOverlay(lgNative, 'Native Land');
        setTimeout(function () { lgNative.remove(); }, 2500);
        setTimeout(function () {
            map.flyTo(L.latLng(42.3, -106.8), 5, { animate: true, duration: 3.0, easeLinearity: 0.2 });
        }, 500);
    });



    //------ Layer : Inreach feed
    //
    // Si un fichier tracks/feed.kml est present (uploade depuis le terrain ...)
    // Alors on l'ajoute
    // Sinon on tente de charger l'URL InReach
    //
    // Permet de garder du controle sur les utilisateur de cette page. Si le fichier est present,
    // Alors le feed online est inhibe (mais visible sur le MapShare direct "prive")
    const r = await fetchInreach('tracks/feed.kml', 'Actual track');
    if (! r) {
        // Recherche du feed KML sur le domaine InReach delorme (devenu garmin)
        // Cf https://files.delorme.com/support/inreachwebdocs/KML%20Feeds.pdf
        // 
        // NB: HTTP-301 https://inreach.garmin.com/Feed/Share/...
        //              https://explore.garmin.com/Feed/Share/ThierryBernier
        //   .../ShareLoader/...    : rend un petit KML contenant juste un <href>...
        //   .../Share/...          : rend un KML brut autoportant
        //     ?d1=<date format JSON du point le plus ancien>   mais YYYY-MM-DD suffit
        //     ?d2=<date format JSON du point le plus recent>
        //   Sans d1, seul le point le plus recent est rendu
        //   Le KML contient des placemark par date croissante
        //
        // + Expansion XML du feed InReach = 47 eltXML par Placemark
        //
        // + Option ?days :
        //      ?days=0 : NZ
        //      ?days>0 : now - days
        //      default : depuis 20230401 
        const days = Math.min(200,parseInt(getParameterByName('days'), 10));  // To reduce code injection, NaN if nothing
        const date1 = new Date((days > 0) ? (Date.now() - days * 1000 * 86400) : '2023-04-10');
        const date2 = new Date(Date.now() - 3 * 1000 * 86400);      // Cacher les 3 derniers jours
        const d1 = (days == 0) ? '2017-10-24' : date1.toJSON().substring(0, 10);
        const d2 = (days == 0) ? '2018-02-23' : date2.toJSON().substring(0, 10);
        const inreachfeed = `https://share.garmin.com/Feed/Share/ThierryB?d1=${d1}&d2=${d2}`;
//      console.log(inreachfeed);
        //
        // => CORS problem : le site de garmin n'allume pas "Access-Control-Allow-Origin"
        //    On ne peut donc pas lire le feed InReach depuis ce JS qui provient d'un domaine
        //    (meme localhost) different de inreachfeed.
        // Quelques contournement possibles :
        // 1) Utiliser un proxy
        //  1a) Cf https://geographika.co.uk/archive/accessing-cross-domain-data-with-yql.html
        //      Mais le proxy YQL est limite en taille par requete. Il faudrait en concatener
        //      plusieurs, en trouvant la taille limite
        //  1b) query.yahooapis.com ... Supprimee en 2019
        //      limite en taille  25 Placemark = 1194 XMLelt : 48 eltXML / Placemark
        //      const url ='https://query.yahooapis.com/v1/public/' + encodeURI('yql?q=select * from xml where url=')
        //                    + '%22' + inreachfeed + '%22';
        //      fetch(yql_query, { method: 'GET', mode: 'cors', headers: {
        //              'Accept': 'application/xml',
        //              'Content-Type': 'application/xml' }}).then(resp => ...
        //  1c) google 'CORS proxy' :
        //      https://nordicapis.com/10-free-to-use-cors-proxies/
        //      https://corsproxy.io/
        //      Possiblement pas compatible avec des firewalls "stricts". Alternatives :
        //          https://nordicapis.com/10-free-to-use-cors-proxies/
        //          https://github.com/Freeboard/thingproxy  a installer sur free ou neocities, ...
        // 2) Amener le InReachFeed par un autre moyen sur le serveur de ce JS :
        //  2a) si ce JS est execute sur un PC local et non pas en provenance du Web,
        //      alors il suffit de precharger le inreachfeed (curl, node.js, ...)
        //  2b) si ce JS provient du Web, alors il faut qu'un PC/Smartphone y uploade le InReachFeed
        // 3) Cf https://github.com/rndme/download : hors-sujet
        // 4) Faire que le browser accepte un GET cross domain.
        //    C'est possible pour firefox avec ce plugin :
        //      https://addons.mozilla.org/fr/firefox/addon/cross-domain-cors/
        // 5) Ajouter une iframe cachee dans la page, y inclure un script de fetch(inreachfeed)
        //    et communiquer avec via window.postMessage()
        //
        // => 1c + 2b : Utiliser un proxy CORS
        const url = 'https://corsproxy.io/?' + encodeURIComponent(inreachfeed);
        const s = await fetchInreach(url, 'Actual online');
        console.log('online');  // bidon pour echapper a "optimiseur" minify (bug ?!)
    }

} // loadInfos()


function zAnim() {
    map.zoomIn(1);
    if (map.getZoom() >= 5) loadInfos();
}
if (!zanim) loadInfos();


//------ Layer : Inreach feed
//
// External call (from divphoto / drive.js)

function mapFlyTo(lat, lon, ref) {
    const s = `${lat} ${lon}`;
    if (!flownTo.has(s)) {
        flownTo.add(s);
        if (lgPlaces == null) {
            lgPlaces = L.markerClusterGroup();
            mapCtrlLayers.addOverlay(lgPlaces, 'Photos');
        }
        const m = L.circleMarker([lat, lon], {
            interactive: true, radius: 8
        }).bindPopup(ref, { interactive: true, closeButton: true });
        lgPlaces.addLayer(m).addTo(map);
        //      let tid = -1;
        m.on('mouseover', function () {
            m.openPopup();
            //          if (tid >= 0) { clearTimeout(tid); tid = -1; }
            // m.openPopup().getPopup().on('mouseout', function () {
            //     /*tid =*/ setTimeout(function () { m.closePopup(); }, 1000);  // TODO: unset si mouseover again
            // });
        });
    }
    const z = (firstfly) ? 8 : map.getZoom();
    firstfly = false;
    map.setView(L.latLng(lat, lon), z, { animate: true, duration: 1.5 });
}
