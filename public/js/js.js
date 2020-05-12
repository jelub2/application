//var sock =new WebSocket("ws://localhost:5001");
var sock =new WebSocket("ws://192.168.2.25:3001");  //replace this address with the one the node.js server prints out. keep port 3000
var display=document.getElementById("display")

sock.onopen=function(event){
//alert("Socket connected succesfully!!!")
setTimeout(function(){sock.send('connection succeeded');},1000);
display.innerHTML+="connection succeeded <br />";

};
sock.onmessage=function(event){
console.log(event);//show received from server data in console of browser
display.innerHTML+=event.data+"<br />"; //add incoming message from server to the log screen previous string + new string(message)

}

function myFunction(event) {
  //sock.send("Hello");
if(event.keyCode==13){	   //when enter is pressed...
var text=document.getElementById('eingabe').value;    //assign value of the entered string to te text variable
if(text!=""){     //if text is not an empty string
//display.innerHTML+="From Client: "+text+"<br />"; //show the message from client in div
sock.send(text);    //send string to server
display.innerHTML+="<strong>Me: </strong>" + text+"<br />";       //display input text in div (client side)
document.getElementById('eingabe').value="";     //and clear the input field
}
else{
console.log("empty string not sent")
}
}}

function clearlog(){
display.innerHTML="";
}
