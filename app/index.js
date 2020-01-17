import * as messaging from "messaging"
let document = require("document")
let lblTijd = document.getElementById("tijd")
let lblMessage = document.getElementById("ticker")
let lblStation = document.getElementById("station")
let lblSpoor = document.getElementById("spoor")
lblTijd.style.fill="cornflowerblue"  
lblTijd.text = "..."


messaging.peerSocket.onmessage = function(evt) {
 let Bericht =  evt.data.split("$|$")
 console.log("Bericht="+Bericht) 
 lblSpoor.text=Bericht[0]
 let Station = Bericht[1]
 lblTijd.text = Bericht[2]
 lblMessage.text = Bericht[3]
  
 // Kleuren zetten adhv sation (EHV=rood, Horst=geel)
 let Achtergrond = document.getElementById("achtergrond") 
 if(Station==="EHV") {  
  lblTijd.style.fill="#FF0000"
  lblStation.style.fill="#FF0000"
  lblStation.text="E'hoven"
 }
 else {
  lblTijd.style.fill="gold" 
  lblStation.style.fill="gold"
  lblStation.text="Horst"
 }
  
 setTimeout(function() {
  lblMessage.state = "enabled";
 }, 2000)
}

function Query() {
 if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {    
  messaging.peerSocket.send("Van w naar c")  
 } 
}

setTimeout(Query,5)
