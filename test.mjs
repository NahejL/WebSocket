
import Net from "node:net"
import HTTPS from "node:https"
import FS from "node:fs/promises"
import Process from "node:process"
import Assert from "node:assert"
import Events from "node:events"
import Crypto from "node:crypto"

import WebSocket from "./main.mjs"

const [ cert, key ] = await Promise.all([
	FS.readFile("./localhost.crt"),
	FS.readFile("./localhost.key"),
	])

const server = new HTTPS.Server({ cert, key })

server.on("request", async ( request, response ) => {
	response.write( await FS.readFile('./index.html') )
	response.end()
	} )

server.on("upgrade", ( request, socket ) => {

	try { 
		
		const web_socket = WebSocket.upgrade( request, socket ) 

		}
	
	catch( error ) {}

	} )

server.listen(443)
