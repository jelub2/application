console.log("js.js at your service")

const button = document.getElementById('btnStart')
var res

button.addEventListener("click", function(){
  var http = new XMLHttpRequest()

  var handleRequestStateChange = function(){
    if(http.readyState == 4 && http.status == 200){
      var valueObject = JSON.parse(http.responseText)
      var values = http.responseText
       console.log(valueObject)
       document.getElementById('temperature').innerHTML = valueObject[2].temp
       document.getElementById('hummidity').innerHTML = valueObject[2].humi
       document.getElementById('temperatureAPI').innerHTML = valueObject[0]
       document.getElementById('rain').innerHTML = valueObject[1]
    }
  }

  http.open('POST', '/')
  http.onreadystatechange = handleRequestStateChange;
  http.send()
})
