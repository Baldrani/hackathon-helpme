//Google API KEY
//AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o
//Cx 002153875831383056448:refccz5vls0

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const axios = require('axios')
const PORT = process.env.PORT || 5000

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

app.post('/', (req, res) => {
    //Working with Dialog Flow
    let verb = req.body.result.parameters.HelpingWords;
    let object = req.body.result.parameters.ObjectToRepare;
    //For test pourpose
    //let verb = "Reparer";
    //let object = "Ordinateur";
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
            */
            {
              "platform": "facebook",
              "type": 4,
              "payload": {
                  "elements": [
                     {
                        "media_type": "image",
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Simon_sinek.jpg/260px-Simon_sinek.jpg",
                        "buttons": [
                           {
                              "type": "web_url",
                              "url": "http://google.com",
                              "title": "View Website",
                           }
                        ]
                     }
                  ]
              }
          }
        ]
    }
    ))
    /*
    res.send(JSON.stringify({
      'slack': {
        'text': 'This is a text response for Slack.',
        'attachments': [
          {
            'title': 'Title: this is a title',
            'title_link': 'https://assistant.google.com/',
            'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
            'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            'fallback': 'This is a fallback.'
          }
        ]
      },
      'facebook': {
        'attachment': {
          'type': 'template',
          'payload': {
            'template_type': 'generic',
            'elements': [
              {
                'title': 'Title: this is a title',
                'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                'subtitle': 'This is a subtitle',
                'default_action': {
                  'type': 'web_url',
                  'url': 'https://assistant.google.com/'
                },
                'buttons': [
                  {
                    'type': 'web_url',
                    'url': 'https://assistant.google.com/',
                    'title': 'This is a button'
                  }
                ]
              }
            ]
          }
        }
      }
    }))
    */
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
