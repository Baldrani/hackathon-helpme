const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get(['/','/test'], (req, res) => {
      console.log('test')
      res.send(JSON.stringify({ 'speech': "coucou", 'displayText': "coucou" }));
      //res.render('pages/index')
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
