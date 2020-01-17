import { me } from "companion";
import * as messaging from "messaging";
import { geolocation } from "geolocation";


function DoIt() {
 // Gebruikt de GPS van telefoon 
 geolocation.getCurrentPosition(function(position) {     
  let dHorst=getDistanceFromLatLonInKm(51.427210, 6.041295, 
   position.coords.latitude, position.coords.longitude)   
  let dEindhoven=getDistanceFromLatLonInKm(51.443455, 5.479245, 
   position.coords.latitude, position.coords.longitude)

  let Station=dHorst<dEindhoven? "HRT" : "EHV"  
  DoNSApi(Station)
 })
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Straal van de aarde in km
  var dLat = deg2rad(lat2-lat1)
  var dLon = deg2rad(lon2-lon1) 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
   Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
   Math.sin(dLon/2) * Math.sin(dLon/2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c // Afstand in km
  return d
}

function deg2rad(deg) { return deg * (Math.PI/180)}

messaging.peerSocket.onmessage = function(evt) {
 DoIt()
}

messaging.peerSocket.onopen = function() {
 DoIt() 
}

function DoNSApi(Station) {
 let url="https://gateway.apiportal.ns.nl/public-reisinformatie/api/v2/departures?maxJourneys=10&station="+Station;  
 fetch(url,{headers: new Headers({
   'Ocp-Apim-Subscription-Key': 'YourApiKey'
  })}).then(function(response) {
   return response.json()
  }).then(function(json) { 
   let ErIsEenTrein=false
   console.log(JSON.stringify(json))
   for(let i=0; i<json["payload"]["departures"].length; i++) {
    let V = json["payload"]["departures"][i]
    
    console.log("direc="+V["direction"]);
    console.log("cat="+V["product"]["categoryCode"]);
    console.log("type="+V["product"]["type"]);
    if(V["messages"] && V["messages"][0]) console.log("Mes:"+V["messages"][0]["message"]);
    
    var OK=false;
    if(Station==="HRT") {
     OK=V["direction"].startsWith("Leiden")
         || V["direction"].startsWith("Schiphol")
         || V["direction"].startsWith("Eindhoven");         
    }
    else {
     // EHV    
     OK=V["direction"]==="Venlo";
    }
     
     
    if(OK
      && V["product"]["categoryCode"]==="IC"
      && V["product"]["type"]==="TRAIN") {
     var dtXML=V["plannedDateTime"]
     var Spoor = V["plannedTrack"]
     console.log("Datum: "+dtXML+", spoor="+Spoor)
     var msec = Date.parse(dtXML)
     var d = new Date(msec)   
     var display = d.getHours()+":"+d.getMinutes()
     console.log(display)
     ErIsEenTrein=true
     messaging.peerSocket.send(Spoor+"$|$"+Station+"$|$"+display+"$|$"+V["messages"][0]["message"]);
     break; // Belangrijke break (zo neemt hij alleen de eerstkomende trein)
    }  
   }
   if(!ErIsEenTrein)
     messaging.peerSocket.send(" $|$"+Station+"$|$Geen$|$Geen trein!");
  })  
}

