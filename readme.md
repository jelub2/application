# Application

This application is meant for cyclists to check whether they should go out for a ride or stay in. Based on weather procrastinations from the OpenWeather API and locally collected data from a temperature sensor.

# Summary

The network exists of 5 parts. A NodeJS server, a client side front-end, a nodeMCU with sensors, the weatherAPI and a mongoDB database system. When a user clicks the button on the client side front-end he receives information about the current temperature and humidity. It's also possible to click the button that's connected to the NodeMCU to receive the same information.  

With this information the user can decide to go out for a spin or to stay in waiting for better times.

# Schematic of the network

<img src="https://raw.githubusercontent.com/jelub2/application/version-AJAX/docs_assets/Tekengebied%201.png"
     alt="Schematic" />

# Packages used
## Arduino
+ ESP8266WiFi
+ ESP8266mDNS
+ WiFiClient
+ ESP8266WebServer
+ dht11

## NodeJS
+ body-parser
+ dotenv
+ ejs
+ express
+ openweather-apis
+ mongoose
+ request

## Front-end
+ Vanilla javascript
+ css
+ html

# Code
## NodeJS

### to set up a webserver  

To handle request from the browsers client side a NodeJS webserver is set up. If a event is triggered on the front-end side, the server-side is going to collect some data. First it asks the NodeMCU in the network for it's temperature and humidity values. Then it asks the weatherAPI for the temperature and humidity numbers they have collected.

## Client side

In the description of the weather API down below you can read how the information is retrieved from the weather API.

In the code below a request is made by using the request npm-package. When a post request from the browser is made to the server. The server makes a Get request to the NodeMCU. The NodeMCU is connected to the wi-fi and accessible by its own IP-adress.


### Front-end

To check whether it's a good plan to go out for a ride the front-end side makes a XMLHttpRequest to the back-end server. In this case a NodeJS server.

#### How it works
When the button with Id 'btnStart' is clicked the function that makes a request to the back-end is fired.
The response of the object is parsed to a JSON structure and saved in the valueObject variable.
Then the HTML is changed to the received values by using innerHTML.

Based on the received numbers the front-end side gives feedback whether to go out or not.

First we have to get access to the button on the front-end. With getElementById a addEventListener can be made to check if the user has clicked the button.


```javascript
const button = document.getElementById('btnStart')
var res
```

When the button is clicked the addEventListener is triggered. Then a new XMLHttpRequest is made.
Now the system knows it has to make a POST request to the server to retrieve information.

When the request is done the function in the handelRequestStateChange is fired. First it checks the statuscode is allright and the readyState is 4, which means the request has been completed.

Then the information is placed in the values variable. A JSON object is used to easy access the information. With innerHTML the HTML is changed to the received values.

```javascript
button.addEventListener("click", function(){
  var http = new XMLHttpRequest()

  http.open('POST', '/')
  http.onreadystatechange = handleRequestStateChange;
  http.send()

  var handleRequestStateChange = function(){
    if(http.readyState == 4 && http.status == 200){
      var valueObject = JSON.parse(http.responseText)
      var values = http.responseText
       console.log(valueObject)
       document.getElementById('temperature').innerHTML = valueObject[2].temp
       document.getElementById('hummidity').innerHTML = valueObject[2].temp
       document.getElementById('temperatureAPI').innerHTML = valueObject[0]
       document.getElementById('rain').innerHTML = valueObject[1]
    }
  }
})
```

See full code [here](www.github.com)

## NodeMCU Arduino code

### Collect and share temperature data  

The built up the arduino code the HelloServer example is used as a basis to start with. The DHT11 package is added to collect temperature and humidity data. To handle requests from the node a capacitive touch sensor is added to the network. This way it's also possible to receive feedback from the system without using a screen, but only by using the button.

### Step 1

First we have to include the used packages.

```
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <dht11.h>

```

### Step 2

Then we define some variables. Make sure to change the SSID and the Password to the network you would like to use.

```
dht11 DHT11;

#define ctsPin 5 // Pin for capactitive touch sensor
#define dht11Pin 4 // Pin for DHT-sensor

#ifndef STASSID
#define STASSID "***"
#define STAPSK  "***"
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

ESP8266WebServer server(80);

const int led = 2;
int chk;
int temperature;
String temp;
String myString = String(led);
```

### Step 3

Next we write down some function to handle requests. For example a request to the root:

```
/*users at root*/
void handleRoot() {
  digitalWrite(led, 1);
  server.send(200, "text/plain", "hello from esp8266!");
  digitalWrite(2, HIGH);
}
```

### Step 4

The setup function is already filled in when using the HelloServer example. When needed see the full code below this [link](www.github.com).

To use the touch sensor and the built-in led the next code is added to the setup function:

```
pinMode(2, OUTPUT);     // Initialize the LED_BUILTIN pin as an output
pinMode(ctsPin, INPUT); // Initialize dht sensors
```

### Step 5

Next the response to the server is changed to. This application works with JSON data. The server.send is changed to:

```
server.send(200, "application/json", "{\"values\": {\"temp\":" + temp + "}}");
```

### Step 6

In the code above there is the temp value. This integer is declared in the top section of the code. In the loop function we are going to read the sensor values and put them in the temp integer by using the next code:

```
void loop(void) {

  chk = DHT11.read(dht11Pin);
  temperature = DHT11.temperature;
  temp = String(temperature);   
  Serial.println(temperature);
  server.handleClient();
  MDNS.update();

  delay(2000);
}
```

To see the full code click on this [link](www.github.com)

## Connect to OpenWeatherAPI

### Get the weather procrastination  

The WeatherAPI is used to collect data from an external resource. With the documentation of the API it's very easy to connect this API to your product.

To connect the API and retreive data the code below is used.

The api_key is for security reasons placed in the dot env file.

### Step 1
First we have to install and require the package.  
Install > type in your terminal the following text:
```javascript
npm install --save openweather-apis
```

require:
```javascript
const weather    = require('openweather-apis')
```  

### Step 2
Second the values are set to the preferences we use for the application.

```javascript
weather.setLang('en');
weather.setCoordinate(52.37, 4.89);
weather.setUnits('metric');
weather.setAPPID(api_key);  
```  

### Step 3
Then we use the values from above to do a request to the API

```javascript
weather.getAllWeather((err, JSONObj) => {
  tempApi     = JSONObj.main.temp;
  humidityApi = JSONObj.main.humidity;
  values.push(tempApi)
  values.push(humidityApi)
  console.log(tempApi + humidityApi)
})
```

The values are pushed to array. In this array the values of the API and the values of the sensor are placed.

The Weather API documentation can be found [here](https://openweathermap.org/current)
