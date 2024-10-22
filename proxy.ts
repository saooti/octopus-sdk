'use strict';

const fs = require('fs');
const BRANCH = fs.readFileSync('plateform.conf', 'utf8').trim();
console.log("Content of BRANCH is " + BRANCH);

const KEYCLOAK_TOKEN_URL = "https://keycloak." + BRANCH + "/realms/catalogue/protocol/openid-connect/token";
const KEYCLOAK_USER = "admin";
const KEYCLOAK_PASSWORD = "saooti-admin";
const CLIENT_ID = "catalogue-web";

const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const exec = require('child_process').exec;

const app = express();


const myArgs = process.argv.slice(2);

let authenticated = true;
if(myArgs.length){
    authenticated = !(myArgs[0] === "false");
} 
app.get('/api/init', async function (req, res) {
    console.log("Requesting initialization of user ...");
    console.log("Content of KEYCLOAK_TOKEN_URL : "+KEYCLOAK_TOKEN_URL);
    console.log("Content of KEYCLOAK_USER : "+KEYCLOAK_USER);
    console.log("Content of KEYCLOAK_PASSWORD : "+KEYCLOAK_PASSWORD);
    console.log("Content of CLIENT_ID : "+CLIENT_ID);
    try {
        let result = await axios.post(KEYCLOAK_TOKEN_URL, qs.stringify({
            "username": KEYCLOAK_USER,
            "password": KEYCLOAK_PASSWORD,
            "grant_type": "password",
            "client_id": CLIENT_ID,
            "scope":"openid"
        }),{headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});
        console.log("Content of result "+result);
        res.send({
            "authenticated": authenticated,
            "accessToken": result.data.access_token,
            "accessKeycloakUri":"https://keycloak." + BRANCH +"/realms/catalogue/protocol/openid-connect/",
            "refreshToken": result.data.refresh_token,
            "clientId": "catalogue-web",
            "expiration": new Date( Date.now() + result.data.expires_in * 1000 ),
            "name": "Fake Authentication",
            "apiUri": "https://api." + BRANCH +"/",
            "mediaUri": "https://media." + BRANCH +"/",
            "studioUri": "https://studio." + BRANCH +"/",
            "importerUri": "https://importer." + BRANCH +"/" ,
            "storageUri": "https://storage." + BRANCH +"/" ,
            "playerUri": "https://playerbeta." + BRANCH +"/" ,
            "processorUri": "https://processor." + BRANCH +"/" ,
            "keycloakApiUri": "https://keycloakApi." + BRANCH +"/" ,
            "frontendUri": "https://" + BRANCH +"" ,
            "hlsUri": "https://hls.live." + BRANCH +"/" ,
            "videomakerUri": "https://videomaker." + BRANCH +"/" ,
            "recoUri": "https://reco." + BRANCH +"/" ,
            "rtmpUri": "rtmp://rtmp.live." + BRANCH +"/",
            "commentsUri": "https://comments." + BRANCH +"/" ,
            "imageUri":"https://imageproxy." + BRANCH +"/",
            "speechToTextUri":"https://speech2text." + BRANCH +"/",
            "textToSpeechUri":"https://text2speech." + BRANCH +"/",
            "radioUri":"https://radio." + BRANCH +"/",
            "billingUri":"https://facturation." + BRANCH +"/",
            "openAiUri": "https://openai." + BRANCH +"/" ,
            "chapteringUri":"https://chaptering." + BRANCH +"/",
            "statRadioUri":"https://stats.radio." + BRANCH +"/",
            "isEducation": false,
            "captchaDevelopmentProfil": true,
            "goodNewsOrgaId": "bd1596f3-9653-4378-a9e6-6dd3bef5c873",
            "role": [
                "ADMIN",
                "ORGANISATION",
                "ANIMATION",
                "USERS", 
                "PODCAST_VALIDATION",
                "PRODUCTION",
                "PLAYLISTS",
                "COMMENTS_MODERATION",
                "EDITOR",
                "ANALYTICS",
                "ADVERTISING",
                "LIVE",
                "EDITION",
                "PODCAST_CRUD",
                "RADIO",
                "BILLING_ADMIN",
                "BILLING_VIEWER",
                "RESTRICTED_PRODUCTION"
            ]
        });
    } catch (error) {
        res.send({
            "authenticated": true,
            "accessToken": null,
            "refreshToken": null,
            "expiration": null,
            "name": null,
            "clientId": null,
            "apiUri": "https://api." + BRANCH + "/",
            "importerUri": "https://importer." + BRANCH +"/" ,
            "mediaUri": "https://media." + BRANCH + "/",
            "studioUri": "https://studio." + BRANCH + "/",
            "storageUri": "https://storage." + BRANCH + "/",
            "playerUri": "https://playerbeta." + BRANCH + "/",
            "processorUri": "https://processor." + BRANCH + "/",
            "keycloakApiUri": "https://keycloakApi." + BRANCH + "/" ,
            "hlsUri": "https://hls.live." + BRANCH +"/" ,
            "videomakerUri": "https://videomaker." + BRANCH +"/" ,
            "recoUri": "https://reco." + BRANCH +"/" ,
            "frontendUri": "https://" + BRANCH +"/" ,
            "commentsUri": "https://comments." + BRANCH +"/" ,
            "imageUri":"https://imageproxy." + BRANCH +"/",
            "speechToTextUri":"https://speech2text." + BRANCH +"/",
            "textToSpeechUri":"https://text2speech." + BRANCH +"/",
            "billingUri":"https://facturation." + BRANCH +"/",
            "radioUri":"https://radio." + BRANCH +"/",
            "openAiUri": "https://openai." + BRANCH +"/" ,
            "chapteringUri":"https://chaptering." + BRANCH +"/",
            "statRadioUri":"https://stats.radio." + BRANCH +"/",
            "isEducation": false,
            "captchaDevelopmentProfil": true,
            "goodNewsOrgaId": null,
        });
    }
});

app.listen(3000, function () { });
