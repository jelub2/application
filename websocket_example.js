/**************************websocket_example.js*************************************************/

const bodyParser = require("body-parser");
const express    = require('express'); //express framework to have a higher level of methods
const ejs = require('ejs');
const app        = express(); //assign app variable the express class/method
const WebSocket  = require('ws');
const http       = require('http');
const mongoose      = require('mongoose')
const path       = require("path");
const weather    = require('openweather-apis');

let doCheck = false;

//API key retrieved from OpenWeather
require('dotenv').config();
const api_key = process.env.KEY;
const mongo_url = process.env.MONGO_URI

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Connect to mongoDB database
mongoose.connect(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true })

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connection to db on")
});

const server = http.createServer(app);//create a server

//***************this snippet gets the local ip of the node.js server. copy this ip to the client side code and add ':3000'
// ****************exmpl. 192.168.56.1---> const sock =new WebSocket("ws://192.168.56.1:3000");

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
})

/**********************websocket setup**************************************************************************************/
//var expressWs = require('express-ws')(app,server);
const s = new WebSocket.Server({ server });

//when browser sends get request, send html file to browser
// viewed at http://localhost:30000
app.get('/', function(req, res) {
res.render('pages/index');
});


//*************************************************************************************************************************
//***************************ws chat server********************************************************************************

//app.ws('/echo', function(ws, req) {
s.on('connection',function(ws,req){

/******* when server receives messsage from client trigger function with argument message *****/
ws.on('message',function(message){

// variables used in this myFunction
var tempApi;
var rainApi;
var tempClient;

//CollectAPI values

// get values from OpenWeather API
weather.setLang('en');
weather.setCoordinate(52.37, 4.89);
weather.setUnits('metric');
weather.setAPPID(api_key);

// get all the JSON file returned from server (rich of info)
weather.getAllWeather((err, JSONObj) => {
  tempApi = JSONObj.main.temp;
  rainApi = JSONObj.rain;
  consoleLogs();
})

if(!isNaN(message)){
  message = parseInt(message)
}

switch(typeof message) {
  case  "number":
  console.log("isNaN")
  break;
  case "string":
  console.log("check")
  break;
  default:
  console.log("default")
}


// console.log("Received: "+message);
s.clients.forEach(function(client){ //broadcast incoming message to all clients (s.clients)
if(client!=ws && client.readyState ){ //except to the same client (ws) that sent this message
client.send(message);
}
});
// ws.send("From Server only to sender: "+ message); //send to client where message is from

// check Values and log them in the console for check
function consoleLogs(){
  // console.log("API temperature is " + tempApi);
  // console.log("expected Rain is " + rainApi);
  // console.log(tempClient + " is temperature of Client")
  // console.log("type is " + typeof tempClient)
  toClients(tempApi, rainApi, tempClient);
}
});

function toClients(tempApi, rainApi, tempClient){
  s.clients.forEach(function(client){ //broadcast incoming message to all clients
      // client.send("TA is " + tempApi + " rainApi is " + rainApi + " tempCli is " + tempClient)  ! Now it's in a loop, because the Arduino always responds to incoming messages
  });

}

ws.on('close', function(){
console.log("lost one client");
});

//ws.send("new client connected");
console.log("new client connected");
});

// Save request to MongoDB database
function saveData(){
console.log("I ran")
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
  TemperatureAPI: {
    type: Number
  },
  RainAPI: {
    type: Number
  }
})

var Collection = mongoose.model('Collection', collectionSchema)

var collectionOne = new Collection({
  City: "Amsterdam",
  TemperatureClient: 15,
  TemperatureAPI: 15,
  RainAPI: 0.5})

 collectionOne.save()
}

saveData()

server.listen(3001, '192.168.2.25');
