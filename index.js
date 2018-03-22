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


const fs = require('fs')
fs.writeFile('db.json', '')


//D
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
// Set some defaults (required if your JSON file is empty)
db.defaults({ users: [{id: 'init'}], count: 0 })
  .write()
  let dbUsers = db.get('users');


let app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

function selectOnlyYoutube(data){
    let res;
    let reg = /youtube/
    data.items.forEach((item) => {
        if (item.displayLink.match(reg)){
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

async function getFacebookInfo(user_id)
{
    //Get user information from facebook
    const response = await axios.get('https://graph.facebook.com/v2.6/'+user_id+'?fields=first_name,last_name,profile_pic&access_token='+provisionalFbToken);
    let json = {id: response.data.id, last_name: response.data.last_name, first_name: response.data.first_name, interventions: []}
    return json
}

async function addAction(user_id, session_id, action)
{
    if(dbUsers.find({id: 'init'}).value() === undefined){
        if(dbUsers.find({ id:  user_id }).value().id ===  user_id){
            //Check session
            if(dbUsers.find({id: user_id}).get('interventions').find({id: session_id}).value() === undefined){
                console.log('create session')
                dbUsers.find({ id:  user_id }).get('interventions')
                  .push({ id: session_id, actions: [] })
                  .write()
                  addAction(user_id, session_id, action)
            } else {
                console.log('add action')
                console.log(dbUsers.find({ id:  user_id }).get('interventions').find({id: session_id}).get('actions').value())
                dbUsers.find({ id:  user_id }).get('interventions').find({id: session_id}).get('actions')
                    .push(action)
                    .write()
            }
        } else {
            const user = await getFacebookInfo(user_id);
            console.log('create user')
            dbUsers.push(user)
                .write()
            addAction(user_id, session_id, action)
        }
    } else {
        const user = await getFacebookInfo(user_id)
        console.log('initialisation users')
        dbUsers.push(user)
            .write()
        console.log('remove init')
        dbUsers.remove({ id: 'init' })
          .write();
        addAction(user_id, session_id, action)
    }
    // Increment count
    db.update('count', n => n + 1)
      .write()
}

app.post('/', (req, res) => {
    let user_id = req.body.originalRequest.data.sender.id;
    let session_id = req.body.sessionId;

    //console.log(req.body.originalRequest.data.sender.id)
    addAction(user_id, session_id, {test: "test"})
    //getFacebookInfo(user_id)

    //addAction(user_id, session_id, {test: 'test'})
    //addAction(user_id, session_id, getFacebookInfo(user_id))
    switch (req.body.result.metadata.intentName) {
        case 'test':
            //Working with Dialog Flow
            /*
            let verb = req.body.result.parameters.HelpingWords;
            let object = req.body.result.parameters.ObjectToRepare;
            /*
            axios.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o&cx=002153875831383056448:refccz5vls0&q='+verb+'+du+'+object+'&amp;callback=hndlr')
                .then(response => {
                    console.log(response)
                    let data = response.data
                    let urlYt = selectOnlyYoutube(data)
                    res.setHeader('Content-Type', 'application/json')
                    res.send(JSON.stringify({
                            "speech": "Voici une vidéo youtube pour vous aider " + urlYt,
                        "displayText": "Voici une vidéo youtube pour vous aider " + urlYt,
                    }))
                })
                .catch(error => {
                    console.log(error);
            })
            */
            //Check req.body.parameters.name ???
            /*
            let routeName = req.body.parameters.name
            switch(routeName):
                case repare-video-yes :
                    break;
                case repare-video-no :
                    res.send'(JSON.stringify({
                    "speech": "A REMPLIR",
                    "meessages": [
                        {
                          "type": 4,
                          "platform": "facebook",
                          "payload": {
                            "facebook": {
                                "attachment":{
                                  "type":"template",
                                  "payload":{
                                    "template_type":"button",
                                    "text":"Need further assistance? Talk to a representative",
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
                */
                /*
            if(req.body.result.parameters.Test === "pommes"){
                res.send(JSON.stringify({
                    "speech": "",
                    "messages": [
                            {
                              "type": 2,
                              "platform": "facebook",
                              "title": "Oui",
                              "replies": [
                                "Yes",
                                "No"
                              ]
                          },
                          {
                          "text": "Here is a quick reply!",
                              "quick_replies":[
                                {
                                  "content_type":"text",
                                  "title":"Search",
                                  "payload":"<POSTBACK_PAYLOAD>",
                                  "image_url":"http://example.com/img/red.png"
                                },
                                {
                                  "content_type":"location"
                                }
                              ]
                          }
                        ]
                }))
            }*/
            res.send(JSON.stringify({
                "speech": "",
                "messages": [
                    /*
                    {
                      "buttons": [
                        {
                          "postback": "Card Link URL or text",
                          "text": "Card Link Title"
                        }
                      ],
                      "imageUrl": "http://urltoimage.com",
                      "platform": "facebook",
                      "subtitle": "Card Subtitle",
                      "title": "Card Title",
                      "type": 1
                    },
                    {
                      "platform": "facebook",
                      "replies": [
                        "Quick reply 1",
                        "Quick reply 2",
                        "Quick reply 3"
                      ],
                      "title": "Quick Reply Title",
                      "type": 2
                    },
                    */
                    //Working but since it is MP4
                    /*
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
                    */
                    //Working but as a link
                    /*
                    {
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
                                  "url":"https://www.youtube.com/watch?v=y9A1MEbgLyA"
                                }
                              ]
                            }
                          }
                        }
                      }
                    },
                    */
                    /*
                    //Not working over 30MO
                    {
                      "type": 4,
                      "platform": "facebook",
                      "payload": {
                        "facebook": {
                            "attachment":{
                              "type":"video",
                              "payload":{
                                "url":"https://www.youtube.com/watch?v=kMhneiuJ2Xs",
                                "is_reusable":true
                              }
                            }
                          }
                        }
                      }
                      */
                    //Working funny exemple
                    /*
                    {
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
                                    "url":"https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb",
                                    "buttons":[
                                      {
                                        "type":"web_url",
                                        "url":"https://en.wikipedia.org/wiki/Rickrolling",
                                        "title":"View More"
                                      }
                                    ]
                                  }
                                ]
                              }
                            }
                          }
                        }
                    },
                    */
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
            }
            ))
            break;
        default:

    }
})
/*
app.get('/', (req, res) => {
    axios.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o&cx=002153875831383056448:refccz5vls0&q=manger+du+fromage&amp;callback=hndlr')
        .then(response => {
            let data = response.data
            let variable = selectOnlyYoutube(data)
            res.render('pages/index', {
                //'data': JSON.stringify(eval(response))
                'data' : variable
            })
        })
        .catch(error => {
            console.log(error);
        })
})
*/
.listen(PORT, () => console.log(`Listening on ${ PORT }`))
