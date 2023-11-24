// Download "JPG feed" from the shared read-only Google Drive folder
//
// Refefences :
//   https://developers.google.com/drive/api/v3/reference/files/list?apix=true#try-it
//   https://medium.com/google-cloud/gapi-the-google-apis-client-library-for-browser-javascript-5896b12dbbd5
//   https://bretcameron.medium.com/how-to-use-the-google-drive-api-with-javascript-57a6cc9e5262
//
// + iframe is not supported by gapi.drive (can't insert a drive UI with a simple iframe)

var activedrive = true;

const homediv = document.getElementById('divphoto');
if ((homediv.style.display == 'none') || (getParameterByName('tof') == 'off')) {
    homediv.style.display = 'none';
    activedrive = false;
}

// Script is loaded after these DOM elements, cf index.html
const domtof = document.getElementById('photofeed');
const domfly = document.getElementById('photo:autoFlyTo');

// The variable/object of the drive.js feature
let tof = {};
tof.nextPageToken = '';
tof.files = [];



//-------------------------------------------------------
// GAPI connexion stuff, auth mode is API key (restricted, no upload/modify permitted) 
//
// ! Does not work if loaded with file://url protocol (gapi.client.init won't return)
//   so this page needs a HTTP server
//
// TODO: switch to ServiceAccount to see if there is a better allowed bandwidth  

// https://console.cloud.google.com/apis/credentials
const API_KEY = 'AIzaSyA1IFKmTOXEHiA5w9QHRNOR64pLTk2ZCSw';

function gapiLoaded() {
    if (activedrive) {
        console.log('gapi.load');
        gapi.load('client', initializeGapiClient);
    } else {
        console.log('gapi.load  disabled');
    }
}

async function initializeGapiClient() {
    console.log('gapi.client.init');
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    });
    console.log('gapi.client.init-ed');
    feedDrive(8);   //  No auto load, to spare GAPI usage during dev
}

//------------------------------------------------------
// feed public JPG from google drive
// link them to the divmap via their geoloc


// GoogleDrive JPG file to HTML presentation in the divphoto
// HTML UL or DIV, which one is lighter ? UL needs to remove the bullet
// NB: Minify does not concat literals
// r = ...+ `<a href="${gf.webViewLink}" id="photo${n}" target="_blank" onmouseout="this.firstChild.firstChild.style.borderStyle='none';"${o}>`
var numPhoto = 0;
function fileAdd(gf) {
    let n = ++numPhoto;
    let o = '';
    let t = '';
    try {
        const lat = gf.imageMediaMetadata.location.latitude;
        const lon = gf.imageMediaMetadata.location.longitude;
        //      const tooltip = `'<img src="${gf.thumbnailLink}"><br><center>${gf.imageMediaMetadata.time}</center>'`;
        const tooltip = `'${gf.imageMediaMetadata.time}'`;
        o = ` onmouseover="flyToIf(this,${lat.toFixed(6)},${lon.toFixed(6)},${n})"`;
        t = `<center><button disabled="yes">${gf.imageMediaMetadata.time}</button></center>`;
    } catch { };
    return `<hr><div ${o}><a href="${gf.webViewLink}" id="photo${n}" target="_blank">`
        + `<figure><img src="${gf.thumbnailLink}" alt="${gf.name}"><figcaption>${t}</figcaption></figure></a></div>`;
}

// To sort tof.files "most recent first"
function fileSub(a, b) {
    try {
        const ta = a.imageMediaMetadata.time;
        const tb = b.imageMediaMetadata.time;
        if (ta == tb) return 0;
        if (ta < tb) return 1;
        return -1;
    } catch { };
    return 1;
}
function onlyUnique(file, index, filesarray) {
    // "The first element of filesarray with the id of file.id is file"
    return filesarray.findIndex((v) => v.id == file.id) === index;
}


// Center the map here
// ! Il semble etre un bug de passer un DOM Element a bindTooltip(), qui devient
//   alors partage et quand le tooltip est ferme, les deux Element sont clos
//   => Il faut le dupliquer
function flyToIf(img, lat, lon, ref) {
    console.log(`flyTo lat,lon=${lat},${lon} enabled=${domfly.checked} ref=${ref}`);
    if (domfly.checked) {
        if (typeof (ref) == 'number')
            ref = document.getElementById(`photo${ref}`).cloneNode(true);
        //      img.firstChild.firstChild.style.borderStyle = 'solid';  // 'ridge'
        mapFlyTo(lat, lon, ref);
    }
}

// Get next page of files
//
// TODO: if nextPageToken is '' and tof already filled then it's done and we shall not
//       load a copy
//       or else keep tof.files[], sort them, add map markers relations, link with IG feed 

async function feedDrive(cnt) {
    const who = 'feedDrive';
    console.log(`${who}: start ${cnt}`);

    done = (cnt != 0);
    do {

    //   https://developers.google.com/drive/api/v3/reference/files/list
    const fileSelection =
    {
        q: "'1O_tzaI6HPBCR9AlqRbQqzw4JqzZoqfOv' in parents",
        corpora: "user",
        trashed: false,
        pageSize: cnt ? cnt : 32,
        pageToken: tof.nextPageToken,
        fields: 'nextPageToken,files(id,name,thumbnailLink,webViewLink,imageMediaMetadata)',
        orderBy: 'createdTime desc'  // Most recent first
    };

    let response;
    console.log('calling gapi.client.drive');
    try {
        response = await gapi.client.drive.files.list(fileSelection);
    } catch (err) {
        console.log(`photo: Error: ${err}`);
        return;
    }
    // Token for the next page
    tof.nextPageToken = response.result.nextPageToken;
    console.log(`${who} nextToken ${tof.nextPageToken}`);
    if (tof.nextPageToken && tof.nextPageToken != '')
        document.getElementById('photomore').innerText = 'Show more';
    else {
        document.getElementById('photomore').innerText = 'Done';
        tof.nextPageToken = '';
        done = true;
    }

    // Gotten response.result.files[]
    if (!response.result.files || response.result.files.length == 0) {
        console.log('photo: No files found.');
        return;
    }
    tof.files.push(...response.result.files);
    console.log(`${who} got files[${response.result.files.length}], total=${tof.files.length}`);

    // Sort (and remove duplicates in case of reload)
    tof.files.sort((a, b) => fileSub(a, b));
    tof.files = tof.files.filter(onlyUnique);
    console.log(`${who} filtered to ${tof.files.length}`);

    // console.log(JSON.stringify(files[0]));  // ... or use browser debugger (firefox=CTRL-SHIFT-K, breakpoint, ...)
    // Populate the HTML list
    domtof.innerHTML = tof.files.reduce(
        (str, file) => `${str}${fileAdd(file)}`, '');

    } while (! done);
}


// User update request
function photoUpdate(cnt) {
    console.log(`photoUpdate ${cnt}`);
    feedDrive(cnt).catch(function handle(e) { console.log(`photo: catch1=${e}`); });
}
