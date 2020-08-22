const bodyParser = require("body-parser")
const express    = require('express')
const ejs        = require('ejs')
const app        = express()
const http       = require('http')
const request    = require('request');
const fs         = require('fs')
const mongoose   = require('mongoose')
const path       = require("path")
const weather    = require('openweather-apis')
const server     = http.createServer(app)

// Play around with a local JSON file
let rawdata = fs.readFileSync('data/tweets.json')
let content = JSON.parse(rawdata)

//API key retrieved from OpenWeather
require('dotenv').config();
const api_key = process.env.KEY;
const mongo_url = process.env.MONGO_URI

app
.set('view engine', 'ejs')

app
.use(express.static(__dirname + '/public'))
.use('/data', express.static('data')) //JSON file
.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json())


//Connect with mongoDB database
mongoose.connect(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true })

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connection to db on")
});

//when browser sends get request, send html file to browser
// viewed at http://localhost:30000
app
.get('/', function(req, res) {
res.render('pages/index', {content})
});

//post request from client user

app.post('/', function(req, res){

  let values = []

  // get values from OpenWeather API
  weather.setLang('en');
  weather.setCoordinate(52.37, 4.89);
  weather.setUnits('metric');
  weather.setAPPID(api_key);

  // get all the JSON file returned from server (rich of info)
  weather.getAllWeather((err, JSONObj) => {
    tempApi = JSONObj.main.temp;
    humidityApi = JSONObj.main.humidity;
    values.push(tempApi)
    values.push(humidityApi)
  })

  //request with npm request package
  request('http://192.168.2.24', { json: true }, (err, res, body) => { // request data from ESP8266 module
    if (err) {
    return console.log(err)
    }
    let valueObj = body.values
    values.push(valueObj)
    sendVal()
  })

function sendVal(){
  console.log("send values to Front-end")
  res.send(values)
  saveData()
  }

// Save request to MongoDB database
function saveData(){
    var Collection = mongoose.model('Collection', collectionSchema)

    var collectionOne = new Collection({
      City: "Amsterdam",
      TemperatureClient: values[2].temp,
      RainClient: values[2].humi,
      TemperatureAPI:values[0],
      RainAPI: values[1]}
    )

     collectionOne.save()
    }
})

//Mongoose Schema for mongoDB
var collectionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  City: {
    type: String
  },
  TemperatureClient: {
    type: Number
  },
  RainClient: {
    type: Number
  },
  TemperatureAPI: {
    type: Number
  },
  RainAPI: {
    type: Number
  }
})


server.listen(3002, '192.168.2.44');
