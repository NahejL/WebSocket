
import Net from "node:net"
import HTTPS from "node:https"
import FS from "node:fs/promises"
import Process from "node:process"
import Assert from "node:assert"
import Events from "node:events"
import Crypto from "node:crypto"



export default class WebSocket extends Net.Socket {

	constructor ( options ) { super( options ) 

		this.on("data", data => {

			const b0 = data.readUInt8(0),
						b1 = data.readUInt8(1),
						length = b1 & 0x7F,
						is_masked = b1 >>> 7 & 0x1,
						offset = length === 126 ? 4 : length === 127 ? 10 : 2 

			const header = {
				is_final: Boolean( b0 >>> 7 & 0x1 ),
				reserved_flags: [
					Boolean( b0 >>> 6 & 0x1 ),
					Boolean( b0 >>> 5 & 0x1 ),
					Boolean( b0 >>> 4 & 0x1 ),
					],
				opcode: ({
					0x0: "continuation frame",
					0x1: "text frame",
					0x2: "binary frame",
					0x8: "connection close",
					0x9: "ping",
					0xA: "pong",
					})[ b0 & 0xF ] || "reserved",
				is_masked,
				mask: is_masked ? data.readUInt32BE( offset ) : undefined,
				length: 
					length === 126 ? data.readUInt16BE( 2 ) :
					length === 127 ? data.readUInt64BE( 2 ) :
					length,
				}

			const body = data.subarray( offset + (is_masked ? 4 : 0) )

			if( header.opcode == "connection close" ) {

				this.destroy()

				}

			else if( header.is_masked != undefined ) {
			
				let offset = 0 

				while ( offset < body.length - 4 ) {

					let chunk = body.readUInt32BE( offset )
					offset = body.writeUInt32BE( header.mask ^ chunk, offset )
				
					}

				const mask = Buffer.alloc(4)
				mask.writeUInt32BE( header.mask, 0 )

				for( let i = 0; offset + i < body.length; i++ ) {

					let chunk	= body.readUInt8( offset + i )
					let submask = mask.readUInt8( i )

					body.writeUInt8( submask ^ chunk, offset + i )

					}

				}

			// function listener ( frame ) {}
			this.emit("frame", {
				data: body
				} )
			
			} )

		this.on("frame", frame => {

			if( false ) {

				this.emit("message", message )
				}

			} )

		}

	static from ( socket, {
		allowHalfOpen, signal,
		} ) {
		return new WebSocket({
			fd: socket._handle,
			allowHalfOpen,
			readable: true,
			writable: true,
			signal,
			}) }

	static upgrade ( request, socket ) {

		if ( request.headers["connection"] != "Upgrade" 
		  || request.headers["upgrade"] != "websocket" ) {
			
			throw `Invalid upgrade request for WebSocket`
			}
		
		const key = request.headers["sec-websocket-key"]
		const accept = Crypto.createHash('sha1')
			.update( key, "binary" ) 
			.update( "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary" )
			.digest( "base64" )

		const headers = new Map([
			[ "upgrade", "websocket" ],
			[ "connection", "Upgrade" ],
			[ "sec-websocket-accept", accept ],
			[ "sec-websocket-version", "13" ],
			])

		const statusCode = 101
		const statusMessage = "Sweaty Palms"

		socket.write(
			`HTTP/1.1 ${statusCode} ${statusMessage}\r\n` 
		 +Array.from( headers )
				.map( ([ key, value ]) => `${key}: ${value}` )
				.join("\r\n")
		 +"\r\n\r\n"
			)

		return WebSocket.from( socket )
		}

	send ( data ) {

		for( const peer_socket of State.sockets ) {
					if( peer_socket != socket ) {

						const data = header.data
						const _header = [
							0b10000001,
							0x00 | data.length < 126 ? data.length : 126,
							]

						if( data.length >= 126 ) {
							let buffer =	new Buffer.alloc(2)
							buffer.writeUInt16BE( data.length )
							_header.concat([ ...buffer ])
							}

						peer_socket.write( Buffer.concat([  
							Buffer.from( _header ),
							data,
							]) )

						}
					}

		}

	binaryType = "arraybuffer"

	get bufferedAmount () { return 0 }

	get extensions () { return [] }

	get protocole () { return "" }

	get readyState () { return "" }

	get url () { return "ws?s://" }


	}




