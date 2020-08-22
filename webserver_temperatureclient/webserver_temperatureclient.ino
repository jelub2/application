#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <dht11.h>
#include <Adafruit_NeoPixel.h>

dht11 DHT11;

#define ctsPin 5 // Pin for capactitive touch sensor
#define dht11Pin 4 // Pin for DHT-sensor
#define PIN       2 // 
#define NUMPIXELS 10 // 

#ifndef STASSID
#define STASSID "*****"
#define STAPSK  "*****"
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

ESP8266WebServer server(80);
Adafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);

const int led = 2;
int chk;
int temperature;
int humidity;
String temp;
String humi;
String myString = String(led);
unsigned long previousMillis = 0;

void setup(void) {
  pinMode(2, OUTPUT);     // Initialize the LED_BUILTIN pin as an output
  pinMode(ctsPin, INPUT); // Initialize dht sensors
  pixels.begin(); // INITIALIZE NeoPixel strip object

  Serial.begin(115200);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection over Wi-Fi
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);
  server.onNotFound(handleNotFound);
  server.begin();
}

void loop(void) {
  unsigned long currentMillis = millis();
  int ctsValue = digitalRead(ctsPin);
  
  chk = DHT11.read(dht11Pin);
  temperature = DHT11.temperature;
  humidity = DHT11.humidity;

  if (currentMillis - previousMillis >= 5000){
    pixels.clear();
    pixels.show();
  }

  if (ctsValue == 1) {
    if (checkWeather() == 1) {
      for (int i = 0; i < NUMPIXELS; i++) { // For each pixel...
        pixels.setPixelColor(i, pixels.Color(255, 0, 0));
      }} else {
      for (int i = 0; i < NUMPIXELS; i++) { // For each pixel...
        pixels.setPixelColor(i, pixels.Color(0, 255, 0));
    }}
    pixels.show();
    previousMillis = currentMillis;
  }

  temp = String(temperature);
  humi = String(humidity);
  server.handleClient(); //handle client requests. In this case requests from server.
  MDNS.update();

  delay(200); //
}

/*------ function decleration -------*/
/*users at root*/

int checkWeather() {
  if ( temperature < 15 || humidity > 75) {
    return 1;
  } else {
    return 0;
  }
}

void handleRoot() {
  digitalWrite(2, LOW);
  server.send(200, "application/json", "{\"values\": {\"temp\":" + temp + ",\"humi\":" + humi + "}}"); // send values to server
  digitalWrite(2, HIGH);
}

/* for routes that are not included in the system*/
void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}
