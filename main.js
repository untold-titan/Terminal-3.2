import { apiUrl } from "./data/vars.js"
import { handleEvent } from "./handler.js"

console.log("Initializing Kirbo, Connecting to WS Gateway")
// Get gateway URL
let res = await fetch(apiUrl + "gateway/bot",{
	headers:{
		"Authorization": "Bot " + Bun.env.TOKEN
	}
})
if(res.status != 200)
	throw new Error("Couldn't Authenticate")
// Add params to URL
let data = await res.json()
let gatewayURL = data["url"] + "?v=10&encoding=json"

// Actually connect
const socket = new WebSocket(gatewayURL)

let dVal = null;
let resumeURL = null;
let sessionID = null;

socket.addEventListener("message", event => {
	let data 
	try{
		data = JSON.parse(event.data)
	}
	catch(e){
		console.error("couldn't parse message data")
		return;
	}
	// Dispatch Event
	if(data["op"] == 0){
		// Set Sequence value
		if(data["t"] == "READY"){
			console.log("Ready!")
			dVal = data["s"]
			resumeURL = data["d"]["resume_gateway_url"]
			sessionID = data["d"]["session_id"]
			return;
		}
		if(data["t"] == "MESSAGE_CREATE"){
			console.log("Message sent by: " + data["d"]["author"]["username"])
			return;
		}
		if(data["t"] == "INTERACTION_CREATE"){
			handleEvent(data["d"])
			return;
		}
		console.log("New Event Received: " + data["t"])
	}
	// Hello event
	if(data["op"] == 10){
		// Start heartbeat timer
		setInterval(heartbeat,data["d"]["heartbeat_interval"])
		identify()
		return;
	}
	// Heartbeat Received
	if(data["op"] == 11){
		return;
	}
})

socket.addEventListener("close", event =>{
	console.error(event.code)
	throw new Error("Websocket Connection Closed")
})

// needs some sort of sequence value?
function heartbeat(){
	socket.send(JSON.stringify({"op":1,"d":dVal}))
}


// Identify the bot
function identify(){
	console.log("Identifying Bot")
	socket.send(JSON.stringify({
		"op":2,
		"d":{
			"token":Bun.env.TOKEN,
			"intents":1536,
			"properties":{
				"os":"windows",
				"browser":"custom",
				"library":"custom"
			}
		}
	}))
}

process.on("exit", async () => {
	// Update status to off
	let res = await fetch("https://discord.com/api/webhooks/1151252349214535831/Jw-DaDoDggxhhZPxFP9q0KbBciUCz1s0hW81xTksK00deSfCa09c_ruB8vmh7EJGygur",{
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:{
			"content":"Terminal-3.2 is currently OFF"
		}
	})
	console.log(res.status)
	throw new Error("Ctrl-C pressed. Stopping.")	
})