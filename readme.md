# Application

This application is meant for cyclists to check whether they should go out for a ride or stay in. Based on weather procrastinations from the OpenWeather API and locally collected data from a temperature sensor.

# Summary

The network exists of 5 parts. A NodeJS server, a client side front-end, a nodeMCU with sensors, the weatherAPI and a mongoDB database system. When a user clicks the button on the client side front-end he receives information about the current temperature and humidity. It's also possible to click the button that's connected to the NodeMCU to receive the same information.  

With this information the user can decide to go out for a spin or to stay in waiting for better times.

# Schematic of the network

![schematic of the network]("https://github.com/jelub2/application/blob/version-AJAX/docs_assets/Tekengebied%201.png")

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

## Front-end
+ Vanilla javascript
+ css
+ html

# Code
## NodeJS

### to set up a webserver  

To handle request from the browsers client side a NodeJS webserver is set up. If a event is triggered on the front-end side, the server-side is going to collect some data. First it asks the NodeMCU in the network for it's temperature and humidity values. Then it asks the weatherAPI for the temperature and humidity numbers they have collected.

## Client side

### Front-end

To check whether it's a good plan to go out for a ride the front-end side makes a XMLHttpRequest to the back-end server. In this case a NodeJS server.

#### How it works
When the button with Id btnStart is clicked the function that makes a request to the back-end is fired.
The response of the object is parsed to a JSON structure and saved in the valueObject variable.
Then the HTML is changed to the received values by using innerHTML.

Based on the received numbers the front-end side gives feedback whether to go out or not.

The front-end javascript code can be found here.

## NodeMCU Arduino code

### to collect and share temperature data  

The built up the arduino code the HelloServer example is used as a basis to start with. The DHT11 package is added to collect temperature and humidity data. To handle requests from the node a capacitive touch sensor is added to the network. This way it's also possible to receive feedback from the system without using a screen, but just by using the button.

## Connection to WeatherAPI

### get the weather procrastination of the location.  

The WeatherAPI is used to collect data from an external resource. With the documentation of the API it's very easy to connect this API to your product.
