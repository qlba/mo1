const Table = require('./table');

const tape = [].slice.call(process.argv[2] + '┤');
const shop = [].slice.call('∇');


const P = 'P', O = 'O', table = Table(
{
	col: [';', '[', ']', 'a', '=', '|', '&', '(', ')', '!', '┤'],
	'S': [ P ,    ,  P ,    ,    ,    ,    ,    ,    ,    ,  O ],
	'O': [ O ,    ,  O ,    ,    ,    ,    ,    ,    ,    ,  O ],
	'Y': [ O ,  P ,  O ,    ,    ,  P ,    ,    ,  P ,    ,  O ],
	'T': [ O ,  O ,  O ,    ,    ,  O ,  P ,    ,  O ,    ,  O ],
	'P': [ O ,  O ,  O ,    ,    ,  O ,  O ,    ,  O ,    ,  O ],
	';': [   ,    ,    ,  P ,    ,    ,    ,  P ,    ,  P ,    ],
	'[': [   ,    ,    ,  P ,    ,    ,    ,  P ,    ,  P ,    ],
	']': [ O ,  P ,  O ,    ,    ,    ,    ,    ,    ,    ,  O ],
	'a': [ O ,  O ,  O ,    ,  P ,  O ,  O ,    ,  O ,    ,  O ],
	'=': [   ,    ,    ,  P ,    ,    ,    ,  P ,    ,  P ,    ],
	'|': [   ,    ,    ,  P ,    ,    ,    ,  P ,    ,  P ,    ],
	'&': [   ,    ,    ,  P ,    ,    ,    ,  P ,    ,  P ,    ],
	'(': [   ,    ,    ,  P ,    ,    ,    ,  P ,    ,  P ,    ],
	')': [ O ,  O ,  O ,    ,    ,  O ,  O ,    ,  O ,    ,  O ],
	'!': [   ,    ,    ,    ,    ,    ,    ,  P ,    ,    ,    ],
	'∇': [   ,    ,    ,  P ,    ,    ,    ,  P ,    ,  P ,    ]
});

const rules = [
	'START',
	' 1. S -> S;O',
	' 2. S -> O',
	' 3. O -> Y[S][S]',
	' 4. O -> Y[S]',
	' 5. O -> a = Y',
	' 6. Y -> Y|T',
	' 7. Y -> T',
	' 8. T -> T&P',
	' 9. T -> P',
	'10. P -> (Y)',
	'11. P -> !(Y)',
	'12. P -> a',
];

function recognize()
{
	var state = 0;

	for(;;) {
		switch(state) {
			case  0: switch(shop[0]) {
				case 'Y': state =  1; break;
				case 'O': state =  4; break;
				case ']': state =  6; break;
				case 'P': state = 13; break;
				case 'a': state = 15; break;
				case ')': state = 16; break;
				case 'T': state = 20; break;
				case 'S': state = 22; break;
				default: return -1;
			}; break;
			case  1: shop.shift(); switch(shop[0]) {
				case '=': state =  2; break;
				default: return -1;
			}; break;
			case  2: shop.shift(); switch(shop[0]) {
				case 'a': state =  3; break;
				default: return -1;
			}; break;
			case  3: shop.shift(); shop.unshift('O'); return 5;
			case  4: shop.shift(); switch(shop[0]) {
				case ';': state =  5; break;
				default: shop.unshift('S'); return 2;
			}; break;
			case  5: shop.shift(); switch(shop[0]) {
				case 'S': return 1;
				default: return -1;
			}; break;
			case  6: shop.shift(); switch(shop[0]) {
				case 'S': state =  7; break;
				default: return -1;
			}; break;
			case  7: shop.shift(); switch(shop[0]) {
				case '[': state =  8; break;
				default: return -1;
			}; break;
			case  8: shop.shift(); switch(shop[0]) {
				case 'Y': state =  9; break;
				case ']': state = 10; break;
				default: return -1;
			}; break;
			case  9: shop.shift(); shop.unshift('O'); return 4;
			case 10: shop.shift(); switch(shop[0]) {
				case 'S': state = 11; break;
				default: return -1;
			}; break;
			case 11: shop.shift(); switch(shop[0]) {
				case '[': state = 12; break;
				default: return -1;
			}; break;
			case 12: shop.shift(); switch(shop[0]) {
				case 'Y': state = 23; break;
				default: return -1;
			}; break;
			case 13: shop.shift(); switch(shop[0]) {
				case '&': state = 14; break;
				default: shop.unshift('T'); return 9;
			}; break;
			case 14: shop.shift(); switch(shop[0]) {
				case 'T': return 8;
				default: return -1;
			}; break;
			case 15: shop.shift(); shop.unshift('P'); return 12;
			case 16: shop.shift(); switch(shop[0]) {
				case 'Y': state = 17; break;
				default: return -1;
			}; break;
			case 17: shop.shift(); switch(shop[0]) {
				case '(': state = 18; break;
				default: return -1;
			}; break;
			case 18: shop.shift(); switch(shop[0]) {
				case '!': state = 19; break;
				default: shop.unshift('P'); return 10;
			}; break;
			case 19: shop.shift(); shop.unshift('P'); return 11;
			case 20: shop.shift(); switch(shop[0]) {
				case '|': state = 21; break;
				default: shop.unshift('Y'); return 7;
			}; break;
			case 21: shop.shift(); switch(shop[0]) {
				case 'Y': return 6;
				default: return -1;
			}; break;
			case 22: shop.shift(); switch(shop[0]) {
				case '∇': return 0;
				default: return -1;
			}; break;
			case 23: shop.shift(); shop.unshift('O'); return 3;
			default:
				throw new Error('Invalid state');
		}
	}
}


const _ = require('lodash');

while(tape.length > 0)
{
	process.stdout.write(
		_(shop.slice().reverse().join('')).padStart(35) +
		_(tape.join('')).padStart(35) +
		_(shop.slice().reverse().join('') + tape.join('')).padStart(35)
	);

	const x = tape.shift();

	switch(table[shop[0]][x])
	{
		case P:
			shop.unshift(x);
			console.log(`  Push ${x}`);
			break;
		case O:
			var r = recognize();

			if(r < 0) {
				console.log('\nfalse');
				process.exit();
			} else if(r === 0) {
				console.log(`\n${x === '┤'}`);
				process.exit();
			} else
				console.log(`  Rule ${rules[r]}`);

			tape.unshift(x);
			break;
		default:
			console.log('\nfalse');
			process.exit();
	}
}

console.log('Tape ran out');
