// Download "JPG feed" from the shared read-only Google Drive folder
//
// Refefences :
//   https://developers.google.com/drive/api/v3/reference/files/list?apix=true#try-it
//   https://medium.com/google-cloud/gapi-the-google-apis-client-library-for-browser-javascript-5896b12dbbd5
//
// + iframe is not supported byt gapi.drive (can't insert a drive UI with a simple iframe)

// Script is loaded after these DOM elements, cf index.html
var domtof = document.getElementById("photo:feed");
var domdbg = document.getElementById('photo:debug');



//-------------------------------------------------------
// GAPI connexion stuff, auth mode is API key (restricted, no upload/modify permitted) 
//
// ! Does not work if loaded with file://url protocol (gapi.client.init won't return)
//   so this page needs a HTTP server

// https://console.cloud.google.com/apis/credentials
const API_KEY = 'AIzaSyA1IFKmTOXEHiA5w9QHRNOR64pLTk2ZCSw';

function gapiLoaded() {
    console.log('gapi.load');
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    console.log('gapi.client.init');
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    });
    console.log('gapi.client.init-ed');
    domdbg.innerHTML = 'initClient feeds';
    feedDrive();
}

//------------------------------------------------------

let nextPage = "";

async function feedDrive() {
    const who = 'feedDrive';
    console.log(`${who}: start`);

    const fileSelection =
    {
        q: "'1O_tzaI6HPBCR9AlqRbQqzw4JqzZoqfOv' in parents",
        corpora: "user",
        trashed: false,
        pageSize: 2,
        pageToken: nextPage,
        fields: 'nextPageToken,files(name,thumbnailLink,webViewLink,imageMediaMetadata)',
        orderBy: 'createdTime desc'
    };

    let response;
    console.log('calling gapi.client.drive');
    try {
        response = await gapi.client.drive.files.list(fileSelection);
    } catch (err) {
        console.log('caught ' + err.message);
        domdbg.innerText = err.message;
        return;
    }
    // Token for the next page
    nextPage = response.result.nextPageToken;
    // Gotten
    const files = response.result.files;
    if (!files || files.length == 0) {
        domdbg.innerText = 'No files found.';
        return;
    }
    // // Flatten to string to debug ... or use CTRL-SHIFT-K (firefox) and/or breakpoint
    // console.log(files.reduce(
    //     (str, file) => `${str}\n${JSON.stringify(file)}\n`,
    //     'Files:\n'));
    // HTML list
    //  TODO: on hover post(document.map, file.imageMediaMetadata.location) ...
    domtof.innerHTML = files.reduce(
        (str, file) => `${str}<br><a href="${file.webViewLink}" target="_blank"><img src="${file.thumbnailLink}" alt="${file.name}"></a>`,
        '<p>Files</p>');
    
    // files.map((file) => {
    //     console.log(`${who}: file kind=${file.kind} name=${file.name} ${file.imageMediaMetadata.time}`);
    //     img = `<p>${file.name}</p>`;
    //     //       try {
    //     //         const lat = file.imageMediaMetadata.location.latitude;
    //     //         const lon = file.imageMediaMetadata.location.longitude;
    //     //         console.log(`${who}: file lat=${lat.toFixed(3)}`);
    //     //       } catch { };
    //     domtof.innerHTML = tof.innerHTML + img;
    // });

}

function bphoto() {
    console.log("bphoto");

    // domtof.innerHTML = "<p>" + "hello" + "</p>"
    //     + '<iframe src="https://drive.google.com/drive/folders/1O_tzaI6HPBCR9AlqRbQqzw4JqzZoqfOv?usp=share_link"></iframe>'
    //     + '<iframe src="https://drive.google.com/drive/folders/1O_tzaI6HPBCR9AlqRbQqzw4JqzZoqfOv"></iframe>';

    feedDrive(); //.catch(function handle(e) { console.error(`catch1=${e}`); });
}

