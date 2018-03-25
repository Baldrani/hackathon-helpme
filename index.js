//Google API KEY
//AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o
//Cx 002153875831383056448:refccz5vls0

//PSID 1750745394945827
const PORT = process.env.PORT || 5000
const provisionalFbToken = "EAAIpmZC2uBGwBABWApwgGTxBJfmYipPUEg9gR9yjCXf0vqgAsRG2LF8R8vr071M6nXdMFrOJkowA6ERNFtxZC1IMZCrV8nJsNf9q2byRQ9bOz5I8XB3PWT4P4cNFUv0pwv3WHGAzXnKM9UxZBNTjNvLCAbqTpxRCZByu1OjJnRBrcU3kxCmxBHJNZBup3WbMwZD"
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const axios = require('axios')
//Writing file
const fs = require('fs')
fs.writeFile('db.json', '') //Clean db.json on server launch
//DB
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
// Set some defaults (required if your JSON file is empty)
db.defaults({users: [{id: 'init'}],count: 0}).write()
const dbUsers = db.get('users');
//Mail
const sendmail = require('sendmail')();

let app = express();
app.use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))

function selectOnlyYoutube(data) {
    let res;
    let reg = /youtube/
    data.items.forEach((item) => {
        if (item.displayLink.match(reg)) {
            //HERE Logic of selection if multiple resuts
            /* console.log(item.htmlSnippet.replace(/<(?:.|\n)*?>/gm, '')
            .replace(/&.+;/gm,'')
            ) */
            res = item.link
        }
    })
    return res != null ? res : null;
}

async function getFacebookInfo(user_id) {
    //Get user information from facebook
    const response = await axios.get('https://graph.facebook.com/v2.6/' + user_id + '?fields=first_name,last_name,profile_pic&access_token=' + provisionalFbToken);
    let json = {
        id: response.data.id,
        last_name: response.data.last_name,
        first_name: response.data.first_name,
        interventions: []
    }
    return json
}

async function addAction(user_id, session_id, action) {
    if (dbUsers.find({id: 'init'}).value() === undefined) {
        if (dbUsers.find({id: user_id}).value().id === user_id) {
            //Check session
            if (dbUsers.find({id: user_id}).get('interventions').find({id: session_id}).value() === undefined) {
                //console.log('create session')
                dbUsers.find({id: user_id}).get('interventions')
                    .push({id: session_id,actions: []})
                    .write()
                addAction(user_id, session_id, action)
            } else {
                //console.log('add action')
                dbUsers.find({id: user_id}).get('interventions').find({id: session_id}).get('actions')
                    .push(action)
                    .write()
            }
        } else {
            const user = await getFacebookInfo(user_id);
            //console.log('create user')
            dbUsers.push(user)
                .write()
            addAction(user_id, session_id, action)
        }
    } else {
        const user = await getFacebookInfo(user_id)
        //console.log('initialisation users')
        dbUsers.push(user)
            .write()
        //console.log('remove init')
        dbUsers.remove({id: 'init'})
            .write();
        addAction(user_id, session_id, action)
    }
    // Increment count
    db.update('count', n => n + 1)
        .write()
}

function closeDiscussion(user) {
    sendmail({
        from: 'Handy@orange.fr',
        to: 'mael.mayon@free.fr',
        subject: 'Assistance required',
        html: 'Le client '+user.first_name+' '+user.last_name+' souhaite votre aide.',
        attachments: [{
            filename: 'client.json',
            path: 'db.json'
        }]
    }, function(err, reply) {
        //console.log(err && err.stack);
        //console.dir(reply);
    });
}

app.post('/', (req, res) => {

        let user_id = req.body.originalRequest.data.sender.id;
        let session_id = req.body.sessionId;
        let dbUsers = db.get('users');

        switch (req.body.result.metadata.intentName) {

            case 'close':
                addAction(user_id, session_id, {Action: "A fermé la discussion"})
                .then(() => {
                    closeDiscussion(dbUsers.find({id: user_id}).value())
                })
                break;
            case 'test':
                addAction(user_id, session_id, {Action: "Test"})
                res.send(JSON.stringify(fs.readFileSync('intents/close.json')));
                break;
            case 'DefaultWelcomeIntent':
                addAction(user_id, session_id, {Bienvenue: "Coucou"})
                res.send(JSON.stringify(fs.readFileSync('intents/DefaultWelcomeIntent.json')))
                break;
            case 'call-assistance':
                addAction(user_id, session_id, {Action: "A appellé un assistant"})
                res.send(JSON.stringify(fs.readFileSync('intents/call-assistance.json')))
                closeDiscussion(dbUsers.find({id: user_id}).value())
                break;
            case 'show-youtube-solution':
                addAction(user_id, session_id, {Action: "Peut regarder vidéo youtube"})
                res.send(JSON.stringify(fs.readFileSync('intents/show-youtube-solution.json')))
                break;
            case 'turn-in-off-no':
                addAction(user_id, session_id, {Action: "A débranché et rebranché son appareil"})
                res.send(JSON.stringify(fs.readFileSync('intents/turn-in-off-no.json')))
                break;
            case 'turn-in-off' :
                addAction(user_id, session_id, {Action: "Enteindre et rallumer"})
                res.send(JSON.stringify(fs.readFileSync('intents/turn-in-off.json')))
                break;
            case 'turn-in-off-yes':
                addAction(user_id, session_id, {Action: "Le client a déjà débranché et rebranché sa box"})
                res.send(JSON.stringify(fs.readFileSync('intents/turn-in-off-yes.json')))
                break;
            //CUSTOME USE CASE 2
            case 'iphone':
                addAction(user_id, session_id, {TypeDAppareil: "iPhone 6"})
                res.send(JSON.stringify(fs.readFileSync('intents/iphone.json')))
                break;
            case 'iphone-haut-parleur':
                addAction(user_id, session_id, {TypeDeProbleme: "Haut Parleur"})
                res.send(JSON.stringify(fs.readFileSync('intents/iphone-haut-parleur.json')))
                break;
            case 'iphone-haut-parleur-yes':
                addAction(user_id, session_id, {Action: "Yes"})
                res.send(JSON.stringify(fs.readFileSync('intents/iphone-haut-parleur-yes.json')))
                break;
            case 'iphone-haut-parleur-yes-no':
                addAction(user_id, session_id, {Action: "Le lien n'a servi à rien"})
                res.send(JSON.stringify(fs.readFileSync('intents/iphone-haut-parleur-yes-no.json')))
                closeDiscussion(dbUsers.find({id: user_id}).value())
                break;
            //Bonus
            case 'youtube-repare-basic':
                console.log('test')
                addAction(user_id, session_id, {Action: "Lui a été proposé de regarder une vidéo youtube"})
                let verb = req.body.result.parameters.HelpingWords;
                let object = req.body.result.parameters.ObjectToRepare;
                axios.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o&cx=002153875831383056448:refccz5vls0&q='+verb+'+du+'+object+'&amp;callback=hndlr')
                    .then(response => {
                        let data = response.data
                        let urlYt = selectOnlyYoutube(data)
                        res.setHeader('Content-Type', 'application/json')
                        if (typeof urlYt != 'undefined' && urlYt != null) {
                            res.send(JSON.stringify({
                                "speech": "Voici une vidéo youtube pour vous aider " + urlYt,
                                "displayText": "Voici une vidéo youtube pour vous aider " + urlYt,
                                "messages" : [{
                                      "type": 4,
                                      "platform": "facebook",
                                      "payload": {
                                        "facebook": {
                                            "attachment":{
                                            "type":"template",
                                            "payload":{
                                              "template_type":"open_graph",
                                              "elements":[
                                                 {
                                                  "url":urlYt
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                  },]
                              }
                        ))
                        } else {
                            res.send(JSON.stringify({
                                "speech": "Désolé, nous n'avons pas trouvé de vidéo Youtube",
                                "displayText": "Désolé, nous n'avons pas trouvé de vidéo Youtube",
                            }))
                        }
                    })
                    .catch(error => {
                        console.log(error);
                })
                break;
            case 'menu-principal':
                addAction(user_id, session_id, {Action: "Menu"})
                res.send(JSON.stringify(fs.readFileSync('intents/menu-principal.json')));
                break;
            default:
                console.log(req.body)
        }
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
