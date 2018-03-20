const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get(['/','/test'], (req, res) => {
      console.log('test')
      res.setHeader('Content-Type', 'application/json');
      //res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
      res.send(JSON.stringify({ 'speech': "coucou", 'displayText': "coucou" }));
      //res.render('pages/index')
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

/*
  callWeatherApi(city, date).then((output) => {
     // Return the results of the weather API to Dialogflow

   }).catch((error) => {
     // If there is an error let the user know
     res.setHeader('Content-Type', 'application/json');
     res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
   });
 };
 function callWeatherApi (city, date) {
   return new Promise((resolve, reject) => {
     // Create the path for the HTTP request to get the weather
     let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
       '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
     console.log('API Request: ' + host + path);
     // Make the HTTP request to get the weather
     http.get({host: host, path: path}, (res) => {
       let body = ''; // var to store the response chunks
       res.on('data', (d) => { body += d; }); // store each response chunk
       res.on('end', () => {
         // After all the data has been received parse the JSON for desired data
         let response = JSON.parse(body);
         let forecast = response['data']['weather'][0];
         let location = response['data']['request'][0];
         let conditions = response['data']['current_condition'][0];
         let currentConditions = conditions['weatherDesc'][0]['value'];
         // Create response
         let output = `Current conditions in the ${location['type']}
         ${location['query']} are ${currentConditions} with a projected high of
         ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of
         ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on
         ${forecast['date']}.`;
         // Resolve the promise with the output text
         console.log(output);
         resolve(output);
       });
       res.on('error', (error) => {
         reject(error);
       });
     });
   });
 }
 */
