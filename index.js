//Google API KEY
//AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o
//Cx 002153875831383056448:refccz5vls0

//PSID 1750745394945827
//FBaccess token EAAIpmZC2uBGwBAFARxZCGgcNqaCz1hcbohy6iY9BENtwu2T7VdhwnaW8Y7R8uPWIakrJxqZCuWWnDlQiR2PSywmA8i0ayhvtu7XZB4kjsHTWESROYo8BHIq8ZCyZAe5Ee79Pz80uzlPR6DMDLFLl8c5r1xkPpWQRKj8E796GS9Ur0LvZA3u58VU9l34s4mAGf2aJZC26kubBgAZDZD

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const axios = require('axios')
const PORT = process.env.PORT || 5000

const fs = require('fs')
fs.writeFile('db.json', '')


//DB
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
// Set some defaults (required if your JSON file is empty)
db.defaults({ users: [{id: 'init'}], count: 0 })
  .write()
const dbUsers = db.get('users');


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

function addAction(user_id, session_id, action)
{
    if(dbUsers.find({id: 'init'}).value() === undefined){
        if(dbUsers.find({ id:  user_id }).value().id ===  user_id){
            console.log('edit user')
            //Check session
            if(dbUsers.find({id: user_id}).get('interventions').find({id: session_id}).value() === undefined){
                console.log('create session')
                dbUsers.find({ id:  user_id }).get('interventions')
                  .push({ id: session_id, actions: [] })
                  .write()
            } else {
                console.log('add action')
                console.log(dbUsers.find({ id:  user_id }).get('interventions').find({id: session_id}).get('actions').value())
                dbUsers.find({ id:  user_id }).get('interventions').find({id: session_id}).get('actions').push(action).write()
            }
        } else {
            console.log('create user')
            dbUsers.push({id: user_id, interventions: []})
                .write()
        }
    } else {
        console.log('initialisation users')
        dbUsers.push({id: user_id, interventions: []})
            .write()
        console.log('remove init')
        dbUsers.remove({ id: 'init' })
          .write()
    }

    // Increment count
    db.update('count', n => n + 1)
      .write()
}

app.post('/', (req, res) => {
    let user_id = req.body.originalRequest.data.sender.id;
    let session_id = req.body.sessionId;
    //BUG WTF WITH THE .id
    let action = {test: "test"}
    addAction(user_id, session_id, action)

    switch (req.body.result.metadata.intentName) {
        case 'test':
            /*
            //Get user information from facebook
            axios.get('https://graph.facebook.com/v2.6/'+user_id+'?fields=first_name,last_name,profile_pic&access_token=EAAIpmZC2uBGwBAFARxZCGgcNqaCz1hcbohy6iY9BENtwu2T7VdhwnaW8Y7R8uPWIakrJxqZCuWWnDlQiR2PSywmA8i0ayhvtu7XZB4kjsHTWESROYo8BHIq8ZCyZAe5Ee79Pz80uzlPR6DMDLFLl8c5r1xkPpWQRKj8E796GS9Ur0LvZA3u58VU9l34s4mAGf2aJZC26kubBgAZDZD')
                .then(response => {
                    console.log(response)
                }).catch(error => {
                    console.log(error)
                })
            */
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
