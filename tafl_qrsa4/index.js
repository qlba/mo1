// class Tape {
// 	constructor(stream) {
// 		this.stream = stream;
// 		this.next = 
// 	}


// }

const EventEmitter = require('events');

function Faucet(stream)
{
	var faucet = new EventEmitter();

	stream.on('data', (chunk) => {
		for(const ch of chunk)
			ch && faucet.emit('data', ch);
	});

	stream.on('end', () => {
		faucet.emit('end');
	});

	stream.on('error', (e) => {
		faucet.emit('error', e);
	});

	return () => new Promise((resolve, reject) => {
		faucet.once('data', (ch) => resolve(ch));
		faucet.once('end', (ch) => resolve(ch));
		faucet.once('error', (e) => reject(e));
	});
}


function Tape(stream) {
	const buffer = [];

	return () => new Promise((resolve, reject) => {
		if (buffer.length) {

		}
	});
}




// const {stdin} = process;

// stdin.on('data', (chunk) => {

// });
