//Google API KEY
//AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o
//Cx 002153875831383056448:refccz5vls0

//PSID 1750745394945827
const provisionalFbToken = "EAAIpmZC2uBGwBAMNRFJZBGboVRcrGZA6PhxZCvdkTZA2QiuYiEIGs5GvsZBPMRZBVZBDluYUPb8JgwctzYjyNjWKWacEKVIlViPuS8zpo0qU0m3glWgZAZB1HOMEwGRrmLxkfJts5wyDc4l7B34bZAsZCIebDZCLfRUoFqdylneDOY8w18pS4UrulcW3ZBeSkCZBlDG4J0ZD"

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
    if (dbUsers.find({
            id: 'init'
        }).value() === undefined) {
        if (dbUsers.find({
                id: user_id
            }).value().id === user_id) {
            //Check session
            if (dbUsers.find({
                    id: user_id
                }).get('interventions').find({
                    id: session_id
                }).value() === undefined) {
                //console.log('create session')
                dbUsers.find({
                        id: user_id
                    }).get('interventions')
                    .push({
                        id: session_id,
                        actions: []
                    })
                    .write()
                addAction(user_id, session_id, action)
            } else {
                //console.log('add action')
                dbUsers.find({
                        id: user_id
                    }).get('interventions').find({
                        id: session_id
                    }).get('actions')
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
        dbUsers.remove({
                id: 'init'
            })
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
                    chooseCategory: "Close Discussion"
                }).then( () => {
                    closeDiscussion(dbUsers.find({id: user_id}).value())
                })
                break;
            case 'test':
                addAction(user_id, session_id, {
                    chooseCategory: "Choix catégorie"
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
                    },
                    {
                        "type": 0,
                        "speech": ""
                    }
                ]
            }));

            break;
        case 'menu-principal':
            addAction(user_id, session_id, {chooseCategory: "Choix catégorie"})
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
                            }]
                        },
                        {
                            "type": 0,
                            "speech": ""
                        }
                    ]
                }));
                break;
            default:
        }
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
