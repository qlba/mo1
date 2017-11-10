#!/usr/bin/env node

var str = process.argv[2] + '$';

function peek()
{
	return str[0];
}

function read()
{
	var c = peek();
	str  = str.substr(1);

	return c;
}

function rule(no)
{
	console.log(no);
	return true;
}


function main()
{
	return parseS();
}

function parseS()
{
	switch(peek()) {
		case '{':
		case 'a':
			return rule(1) && parseO() && parseS1();
		default:
			return false;
	}
}

function parseS1()
{
	switch(peek()) {
		case '{':
		case 'a':
			return rule(2) && parseO() && parseS1();
		case '$':
		case ']':
			return rule(3) && true;
		default:
			return false;
	}
}

function parseO()
{
	switch(peek()) {
		case '{':
			return rule(4) && parseChar('{') && parseO1();
		case 'a':
			return rule(5) && parseChar('a') && parseChar('=') && parseE();
		default:
			return false;
	}
}

function parseO1()
{
	switch(peek()) {
		case '[':
			return rule(6) && parseChar('[') && parseS() && parseChar(']') && parseY() && parseChar('}');
		case 'a':
		case '!':
			return rule(7) && parseY() && parseChar('[') && parseS() && parseChar(']') && parseChar('}');
		default:
			return false;
	}
}

function parseY()
{
	switch(peek()) {
		case 'a':
			return rule(8) && parseChar('a') && parseY1();
		case '!':
			return rule(9) && parseChar('!') && parseChar('(') && parseY() && parseChar(')');
		default:
			return false;
	}
}

function parseY1()
{
	switch(peek()) {
		case '=':
			return rule(10) && parseChar('=') && parseChar('a');
		case '<':
			return rule(11) && parseChar('<') && parseChar('a');
		default:
			return false;
	}
}

function parseE()
{
	switch(peek()) {
		case '+':
			return rule(12) && parseChar('+') && parseChar('(') && parseE() && parseChar(',') && parseE() && parseChar(')')
		case '*':
			return rule(13) && parseChar('*') && parseChar('(') && parseE() && parseChar(',') && parseE() && parseChar(')')
		case 'a':
			return rule(14) && parseChar('a');
		default:
			return false;
	}
}


function parseChar(chr)
{
	return read() === chr;
}


console.log(main());

