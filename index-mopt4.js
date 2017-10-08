var transport = require('./method/transport');

// var as = [3, 3, 9],
// 	bs = [6, 8, 1];

// var as = [50, 50],
// 	bs = [20, 30, 50],
// 	cs = [
// 		[3, 4, 1],
// 		[2, 1, 7]
// 	];

// var as = [20, 30, 50],
// 	bs = [50, 50],
// 	cs = [
// 		[3, 2],
// 		[4, 1],
// 		[1, 7]
// 	];

// var as = [10, 20, 50],
// 	bs = [40, 30, 10],
// 	cs = [
// 		[5, 7, 1],
// 		[2, 1, 4],
// 		[6, 3, 2]
// 	];

// var as = [4, 6, 10, 10],
// 	bs = [7, 7, 7, 7, 2],
// 	cs = [
// 		[16, 30, 17, 10, 16],
// 		[30, 27, 26,  9, 23],
// 		[13,  4, 22,  3,  1],
// 		[ 3,  1,  5,  4, 24]
// 	];

var as = [24, 21, 21, 24],
	bs = [19, 25, 20, 13, 13],
	cs = [
		[14, 27,  5, 18, 19],
		[17, 20,  1, 24,  3],
		[11,  7, 28, 23,  9],
		[ 8, 26, 19,  2, 24]
	];


// var v1 = transport.solveTransportTask(as, bs, cs, transport.northWest, transport.distributive);
var v2 = transport.solveTransportTask(as, bs, cs, transport.leastCost, transport.potentials);
// var v3 = transport.solveTransportTask(as, bs, cs, transport.northWest, transport.distributive);
// var v4 = transport.solveTransportTask(as, bs, cs, transport.leastCost, transport.potentials);


// if(
// 	v1.value !== v2.value ||
// 	v2.value !== v3.value ||
// 	v3.value !== v4.value
// )
// 	throw new Error('Results are different');
// else
// 	console.log(`Results are identical: ${v1.value}`);

// if(
// 	JSON.stringify(v1) !== JSON.stringify(v2) ||
// 	JSON.stringify(v2) !== JSON.stringify(v3) ||
// 	JSON.stringify(v3) !== JSON.stringify(v4)
// )
// 	throw new Error('Solutions are different');
// else
// 	console.log('Solutions are identical');
