#!/usr/bin/env node

const shop = ['S', '$'];
const tape = Array.prototype.map.call(process.argv[2] + '$', x => x);
const dump = [];

const M = {
				S: {
								'{': 1,
								'a': 1
				},
				"S'": {
								'{': 2,
								'a': 2,
								']': 3,
								'$': 3
				},
				O: {
								'{': 4,
								'a': 5
				},
				"O'": {
								'a': 7,
								'[': 6,
								'!': 7
				},
				Y: {
								'a': 8,
								'!': 9
				},
				"Y'": {
								'=': 10,
								'<': 11
				},
				E: {
								'a': 14,
								'+': 12,
								'*': 13
				}
};

const G = {
				[ 1]: ["O", "S'"],
				[ 2]: ["O", "S'"],
				[ 3]: [],
				[ 4]: ["{", "O'"],
				[ 5]: ["a", "=", "E"],
				[ 6]: ["[", "S", "]", "Y", "}"],
				[ 7]: ["Y", "[", "S", "]", "}"],
				[ 8]: ["a", "Y'"],
				[ 9]: ["!", "(", "Y", ")"],
				[10]: ["=", "a"],
				[11]: ["<", "a"],
				[12]: ["+", "(", "E", ",", "E", ")"],
				[13]: ["*", "(", "E", ",", "E", ")"],
				[14]: ["a"]
};

function isNonTerminal(a) {
				return a >= 'A' && a <= 'Z';
}


process.stdout.write('SHOP'.padEnd(25));
process.stdout.write('TAPE'.padEnd(45));
process.stdout.write('INTERMEDIATE'.padEnd(45));
process.stdout.write('RULE\n');

while(shop.length > 0)
{
				const X = shop[0];
				const inSym = tape[0];

				process.stdout.write(`${shop.join('')}`.padEnd(25));
				process.stdout.write(`${tape.join('')}`.padEnd(45));
				process.stdout.write(`${dump.concat(shop).join('')}`.padEnd(45));

				if(shop.length > 100)
								throw new Error('Shop overshop');

				if(!isNonTerminal(X))
				{
								if(X === inSym)
								{
												console.log(`${inSym}`);
												shop.shift();
												dump.push(tape.shift());
								}
								else
												throw new Error(`Expected ${X}, got ${inSym}`);
				}
				else
				{
								if(M[X][inSym])
								{
												console.log(`${M[X][inSym]}. ${X} -> ${G[M[X][inSym]].join('')} against  ${inSym}`);
												shop.shift();
												shop.unshift.apply(shop, G[M[X][inSym]]);
								}
								else
												throw new Error(`Expected ${X}, got ${inSym}`);
				}
}

