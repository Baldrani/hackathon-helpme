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

/* Useless as for what I'm seing
function hndlr(response) {
    var reg = /youtube/
    response.items.forEach((item) => {
        if (item.displayLink.match(reg)){
            //HERE Logic of selection if multiple resuts
            console.log(item)
            console.log(
            item.htmlSnippet.replace(/<(?:.|\n)*?>/gm, '')
                .replace(/&.+;/gm,'')
            )
            console.log(item.link)
            //return item.link
        }
    })
}
*/

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

app.post('/webhook', (req, res) => {
    //Working with Dialog Flow
    let verb = req.body.result.parameters.HelpingWords;
    let object = req.body.result.parameters.ObjectToRepare;
    //For test pourpose
    //let verb = "Reparer";
    //let object = "Ordinateur";
    //GOOD
    //https://www.googleapis.com/customsearch/v1?key=AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o&cx=002153875831383056448:refccz5vls0&q=Reparer+du+Ordinateur&amp;callback=hndlr
    // Working url : https://www.googleapis.com/customsearch/v1?key=AIzaSyBxAQPLyybYD6XOXde0J3WdEBOObCf8t8o&cx=002153875831383056448:refccz5vls0&q=manger+du+fromage&amp;callback=hndlr
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
