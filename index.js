//Google API KEY
//AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o
//Cx 002153875831383056448:refccz5vls0

//PSID 1750745394945827
const provisionalFbToken = "EAAIpmZC2uBGwBAFlHd6pDCN11IIPegQP4CXHGzU8h4M6emjQvDwo13Il21D6CvcQr61ZCjzFRha8vZBy9OWNDQcaqillW2exLzb5wNWIqOGNoO7M48Qgq8UpooNbmjcmJPwhkTF2ouMVZCKU4fIXcmkg83SebZCFFqW230BidKW7NdXYRYRgSqYuatCiCiuAZD"

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const axios = require('axios')
const PORT = process.env.PORT || 5000

//Writing file
const fs = require('fs')
fs.writeFile('db.json', '')


//DB
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
// Set some defaults (required if your JSON file is empty)
db.defaults({
        users: [{
            id: 'init'
        }],
        count: 0
    })
    .write()
let dbUsers = db.get('users');

//Mail
const sendmail = require('sendmail')();

let app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

function selectOnlyYoutube(data) {
    let res;
    let reg = /youtube/
    data.items.forEach((item) => {
        if (item.displayLink.match(reg)) {
            //HERE Logic of selection if multiple resuts
            //console.log(item)
            /*
            console.log(item.htmlSnippet.replace(/<(?:.|\n)*?>/gm, '')
            .replace(/&.+;/gm,'')
            )
            */
            res = item.link
        }
    })
    return res != null ? res : "Nous n'avons pas trouvé de vidéo Youtube";
}

app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs');

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
                    .push({
                        id: session_id,
                        actions: []
                    })
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
        from: 'Djingo.HelpMe@orange.fr',
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
                addAction(user_id, session_id, {
                    chooseCategory: "A fermé la discussion"
                }).then( () => {
                    closeDiscussion(dbUsers.find({id: user_id}).value())
                })
                break;
            case 'test':
                addAction(user_id, session_id, {
                    chooseCategory: "Test"
                })
                res.send(JSON.stringify({
                    "speech": "",
                    "messages": [{
                            "type": 0,
                            "platform": "facebook",
                            "speech": "Choisissez votre categorie"
                        },
                        {
                            "type": 1,
                            "platform": "facebook",
                            "title": "Problème au niveau de votre téléphone",
                            "subtitle": "",
                            "imageUrl": "https://education.ti.com/-/media/ti/images/education/customer-support/phone.png?rev=&h=385&w=497&la=fr&hash=3060CBA0A19ECD41BD4C79A8CB14EA3BABFA0DC3",
                            "buttons": [{
                                "text": "Choisir",
                                "postback": "https://www.messenger.fr"
                            }]
                        },
                        {
                            "type": 1,
                            "platform": "facebook",
                            "title": "Problème au niveau de votre PC",
                            "imageUrl": "https://static.fnac-static.com/multimedia/fnacdirect/publi/Guides/high-tech/apple-boutique/gamme-mac/iMac-380x320-v2.jpg",
                            "buttons": [{
                                "text": "Choisir",
                                "postback": "https://www.messenger.fr"
                            }]
                        },
                        {
                            "type": 1,
                            "platform": "facebook",
                            "title": "Problème au niveau de votre Box",
                            "imageUrl": "https://www.journaldugeek.com/wp-content/blogs.dir/1/files/2017/04/Livebox-640x287.png",
                            "buttons": [{
                                "text": "Chosir",
                                "postback": "https://www.messenger.fr"
                            }]
                        },
                        {
                            "type": 1,
                            "platform": "facebook",
                            "title": "Autre",
                            "imageUrl": "http://www.climafroid-service.fr/wp-content/uploads/2016/06/logo_sav.png",
                            "buttons": [{
                                "text": "Choisir",
                                "postback": "https://www.messenger.fr"
                            }
                        ]
                    }
                ]
            }));
            break;
        case 'menu-principal':
            addAction(user_id, session_id, {chooseCategory: "Menu"})
            res.send(JSON.stringify({
                "speech": "",
                "messages": [
                    {
                      "type": 0,
                      "platform": "facebook",
                      "speech": "Choisissez votre categorie"
                    },
                    {
                      "type": 1,
                      "platform": "facebook",
                      "title": "Problème au niveau de votre téléphone",
                      "subtitle": "",
                      "imageUrl": "https://education.ti.com/-/media/ti/images/education/customer-support/phone.png?rev=&h=385&w=497&la=fr&hash=3060CBA0A19ECD41BD4C79A8CB14EA3BABFA0DC3",
                      "buttons": [
                        {
                          "text": "Choisir",
                          "postback": "https://www.messenger.fr"
                        }
                      ]
                    },
                    {
                      "type": 1,
                      "platform": "facebook",
                      "title": "Problème au niveau de votre PC",
                      "imageUrl": "https://static.fnac-static.com/multimedia/fnacdirect/publi/Guides/high-tech/apple-boutique/gamme-mac/iMac-380x320-v2.jpg",
                      "buttons": [
                        {
                          "text": "Choisir",
                          "postback": "https://www.messenger.fr"
                        }
                      ]
                    },
                    {
                      "type": 1,
                      "platform": "facebook",
                      "title": "Problème au niveau de votre Box",
                      "imageUrl": "https://www.journaldugeek.com/wp-content/blogs.dir/1/files/2017/04/Livebox-640x287.png",
                      "buttons": [
                        {
                          "text": "Chosir",
                          "postback": "https://www.messenger.fr"
                        }
                      ]
                    },
                    {
                      "type": 1,
                      "platform": "facebook",
                      "title": "Autre",
                      "imageUrl": "http://www.climafroid-service.fr/wp-content/uploads/2016/06/logo_sav.png",
                      "buttons": [
                        {
                          "text": "Choisir",
                          "postback": "https://www.messenger.fr"
                        }
                      ]
                    }
                    ]
                }));
                break;
            case 'DefaultWelcomeIntent':
                addAction(user_id, session_id, {Bienvenue: "Coucou"})
                res.send(JSON.stringify({
                    "speech": "",
                    "messages": [
                        {
                          "type": 0,
                          "platform": "facebook",
                          "speech": "Coucou toi !"
                        },
                        {
                          "type": 0,
                          "platform": "facebook",
                          "speech": "Que puis je faire pour vous aider ?"
                        },
                        {
                          "type": 0,
                          "platform": "facebook",
                          "speech": "Choisissez votre categorie"
                        },
                        {
                          "type": 1,
                          "platform": "facebook",
                          "title": "Problème au niveau de votre téléphone",
                          "subtitle": "",
                          "imageUrl": "https://education.ti.com/-/media/ti/images/education/customer-support/phone.png?rev=&h=385&w=497&la=fr&hash=3060CBA0A19ECD41BD4C79A8CB14EA3BABFA0DC3",
                          "buttons": [
                            {
                              "text": "Choisir",
                              "postback": "https://www.messenger.fr"
                            }
                          ]
                        },
                        {
                          "type": 1,
                          "platform": "facebook",
                          "title": "Problème au niveau de votre PC",
                          "imageUrl": "https://static.fnac-static.com/multimedia/fnacdirect/publi/Guides/high-tech/apple-boutique/gamme-mac/iMac-380x320-v2.jpg",
                          "buttons": [
                            {
                              "text": "Choisir",
                              "postback": "https://www.messenger.fr"
                            }
                          ]
                        },
                        {
                          "type": 1,
                          "platform": "facebook",
                          "title": "Problème au niveau de votre Box",
                          "imageUrl": "https://www.journaldugeek.com/wp-content/blogs.dir/1/files/2017/04/Livebox-640x287.png",
                          "buttons": [
                            {
                              "text": "Chosir",
                              "postback": "https://www.messenger.fr"
                            }
                          ]
                        },
                        {
                          "type": 1,
                          "platform": "facebook",
                          "title": "Autre",
                          "imageUrl": "http://www.climafroid-service.fr/wp-content/uploads/2016/06/logo_sav.png",
                          "buttons": [
                            {
                              "text": "Choisir",
                              "postback": "https://www.messenger.fr"
                            }
                          ]
                        }
                    ]
                }))
                break;
            case 'call-assistance':
                addAction(user_id, session_id, {Action: "A appellé un assistant"})
                res.send(JSON.stringify({"speech": "",
                "messages": [
                    //Good Assistance return
                    {
                      "type": 4,
                      "platform": "facebook",
                      "payload": {
                        "facebook": {
                            "attachment":{
                              "type":"template",
                              "payload":{
                                "template_type":"button",
                                "text":"Vous avez besoin d'aide, contactez nos assistants ?",
                                "buttons":[
                                  {
                                    "type":"phone_number",
                                    "title":"Call Representative",
                                    "payload":"+33613499190"
                                  }
                                ]
                              }
                          }
                        }
                      }
                  }
                ]
                }))
                break;
            case 'turn-in-off' :
                addAction(user_id, session_id, {Action: "Enteindre et rallumer"})
                res.send(JSON.stringify({
                    "speech": "",
                    "messages": [
                        /*
                        {
                        "type": 2,
                        "platform": "facebook",
                        "title": "Avez-vous essayé de débrancher et rebrancher votre appareil ?",
                        "replies": [
                            "Oui",
                            "Non"
                            ]
                        },*/
                        {
                          "type": 4,
                          "platform": "facebook",
                          "payload": {
                              "template_type":"generic",
                              "elements":[
                                 {
                                  "title":"Welcome to Peter'\''s Hats",
                                  "image_url":"https://petersfancybrownhats.com/company_image.png",
                                  "subtitle":"We'\''ve got the right hat for everyone.",
                                  "default_action": {
                                    "type": "web_url",
                                    "url": "https://peterssendreceiveapp.ngrok.io/view?item=103",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                  },
                                  "buttons":[
                                    {
                                      "type":"web_url",
                                      "url":"https://petersfancybrownhats.com",
                                      "title":"View Website"
                                    },{
                                      "type":"postback",
                                      "title":"Start Chatting",
                                      "payload":"DEVELOPER_DEFINED_PAYLOAD"
                                    }
                                  ]
                                }
                              ]
                          }
                        },
                    ]
                }))
                break;
            case 'turn-in-off - yes':
                addAction(user_id, session_id, {Action: "Je veux contacter un conseiller"})
                res.send(JSON.stringify({
                    "speech": "",
                    "messages": [
                        {
                        "type": 2,
                        "platform": "facebook",
                        "title": "Voullez vous contacter un de nos conseiller ?",
                        "replies": [
                            "Oui",
                            "Non"
                            ]
                        },
                        {
                          "type": 4,
                          "platform": "facebook",
                          "payload": {
                              "template_type":"generic",
                              "elements":[
                                 {
                                  "title":"Welcome to Peter'\''s Hats",
                                  "image_url":"https://petersfancybrownhats.com/company_image.png",
                                  "subtitle":"We'\''ve got the right hat for everyone.",
                                  "default_action": {
                                    "type": "web_url",
                                    "url": "https://peterssendreceiveapp.ngrok.io/view?item=103",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                  },
                                  "buttons":[
                                    {
                                      "type":"web_url",
                                      "url":"https://petersfancybrownhats.com",
                                      "title":"View Website"
                                    },{
                                      "type":"postback",
                                      "title":"Start Chatting",
                                      "payload":"DEVELOPER_DEFINED_PAYLOAD"
                                    }
                                  ]
                                }
                              ]
                          }
                        },
                    ]
                }))
                break;
            case 'turn-in-off - no':
                addAction(user_id, session_id, {Action: "A débranché et rebranché son appareil"})
                res.send(JSON.stringify({
                    "speech": "",
                    "messages": [
                        {
                          "type": 0,
                          "platform": "facebook",
                          "speech": "Faite le puis revenez me dire ce qu'il en est."
                        },
                        {
                          "type": 0,
                          "platform": "facebook",
                          "speech": "Est-ce que cela a marché ?"
                        },
                        {
                        "type": 2,
                        "platform": "facebook",
                        "title": "",
                        "replies": [
                            "Oui",
                            "Non"
                            ]
                        },
                        {
                          "type": 4,
                          "platform": "facebook",
                          "payload": {
                            "facebook": {
                              "attachment": {
                                "type": "video",
                                "payload": {
                                  "url": "https://fpdl.vimeocdn.com/vimeo-prod-skyfire-std-us/01/1512/8/207561527/708213662.mp4?token=1521676371-0xc32b465ad712789534229346b914a525fbc46dff"
                                }
                              }
                            }
                          }
                        },
                    ]
                }))
                break;
            default:
        }
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
