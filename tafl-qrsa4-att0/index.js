const _ = require('lodash');

const c = {
	eax: undefined,
	ebx,
	ecx,
	edx,
	esi,
	edi,
	esp,
	ebp,
	eip,
	zf,
	sf
};

let stack = new Array[1024];


function executeProgram(asm)
{
	esp = 0;
	eip = 0;

	_(asm).split('\n').compact().each(line => executeCommand(_.compact(line.split(/[ ,]/))));
}

function executeCommand([mnemonics, ...args])
{
	switch (mnemonics)
	{

	}
}


function setFlags(value)
{
	zf = value === 0;
	sf = value < 0;
}

// function reg(reg)
// {
// 	return {
// 		get: () => reg,
// 		set: (value) => R(value) && 
// 	}
// }


function R(value)
{
	if (!Number.isFinite(value))
		throw new Error(`Not a number: ${value}`);
}
