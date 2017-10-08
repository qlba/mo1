var {tprintf} = require('../../utils/tprintf');

function solveTransportTask(as, bs, cs, basePlanMethod, cellPickMethod)
{
	console.log(`\nSolving transport task with ${basePlanMethod.name} base plan, ` +
		`${cellPickMethod.name} cell pick method`);

	var xs = basePlanMethod(as, bs, cs);

	console.log('Base plan:\n');
	printSolution(xs, cs);
	
	var cellPicked;

	while((cellPicked = cellPickMethod(xs, cs)) !== null)
	{
		console.log(`\nSelected cell: ${cellPicked.i + 1}:${cellPicked.j + 1}`);

		var cycle = getViciousCycle(xs, cellPicked);

		process.stdout.write(`Cycle: ${cellPicked.i + 1}:${cellPicked.j + 1}(+)`);

		for(var k = 0; k < cycle.length; k++)
			process.stdout.write(` - ${cycle[k].i + 1}:${cycle[k].j + 1}(${k % 2 ? '+' : '-'})`);

		console.log();
		
		viciousShift(xs, cellPicked);

		console.log(`After:\n`);
		printSolution(xs, cs);
	}

	console.log('\nOptimal solution acquired.\n');
	printSolution(xs, cs);

	return {xs, value: getValue(xs, cs)};
}


var R = Number.isFinite;


function northWest(as, bs)
{
	var was = as.slice();
	var wbs = bs.slice();

	var n = was.length,
		m = wbs.length,
		i, j;

	var xs = new Array(n);

	for(i = 0; i < n; i++)
		xs[i] = new Array(m).fill(null);

	i = 0;
	j = 0;

	while(i < n && j < m)
	{
		var removal;
		
		if(was[i] < wbs[j])
			removal = 'was';
		else if(was[i] > wbs[j])
			removal = 'wbs';
		else
		{
			if(n - i < m - j)
				removal = 'wbs';
			else
				removal = 'was';
		}

		if(removal === 'was')
		{
			xs[i][j] = was[i];
			wbs[j] = wbs[j] - was[i];
			was[i] = 0;
			i++;
		}
		else
		{
			xs[i][j] = wbs[j];
			was[i] = was[i] - wbs[j];
			wbs[j] = 0;
			j++;
		}
	}

	validate(as, bs, xs);
	
	return xs;
}

function leastCost(as, bs, cs)
{
	var was = as.slice();
	var wbs = bs.slice();

	var n = was.length,
		m = wbs.length,
		i, j;

	var xs = new Array(n);

	for(i = 0; i < n; i++)
		xs[i] = new Array(m).fill(null);

	while(was.some(x => x !== null) && wbs.some(x => x !== null))
	{
		var min = null;

		for(i = 0; i < n; i++)
			for(j = 0; j < m; j++)
				if(was[i] !== null && wbs[j] !== null && (
					!min || min.val > cs[i][j]
				))
					min = {i, j, val: cs[i][j]};

		i = min.i;
		j = min.j;

		var removal;

		if(was[i] < wbs[j])
			removal = 'was';
		else if(was[i] > wbs[j])
			removal = 'wbs';
		else
		{
			var wasLeft = was.filter(a => a !== null).length,
				wbsLeft = wbs.filter(b => b !== null).length;

			if(wasLeft < wbsLeft)
				removal = 'wbs';
			else
				removal = 'was';
		}

		if(removal === 'was')
		{
			xs[i][j] = was[i];
			wbs[j] = wbs[j] - was[i];
			was[i] = null;
		}
		else
		{
			xs[i][j] = wbs[j];
			was[i] = was[i] - wbs[j];
			wbs[j] = null;
		}
	}

	validate(as, bs, xs);
	
	return xs;
}


function distributive(xs, cs)
{
	var n = xs.length,
		m = xs[0].length,
		i, j;

	var min;
	
	for(i = 0; i < n; i++)
		for(j = 0; j < m; j++)
			if(!R(xs[i][j]))
			{
				var cycle = getViciousCycle(xs, {i, j}),
					sum = 0;

				process.stdout.write(`γ[${i + 1}][${j + 1}] = 0`);

				for(var k = 0; k < cycle.length; k++)
				{
					if(k % 2 === 0)
						sum -= cs[cycle[k].i][cycle[k].j];
					else
						sum += cs[cycle[k].i][cycle[k].j];

					process.stdout.write(` ${k % 2 ? '+' : '-'} ` +
						`c[${cycle[k].i + 1}][${cycle[k].j + 1}]`
					);
				}

				process.stdout.write(' = 0');

				for(var k = 0; k < cycle.length; k++)
					process.stdout.write(` ${k % 2 ? '+' : '-'} ` +
						`${cs[cycle[k].i][cycle[k].j]}`
					);

				console.log(` = ${sum}`);
				
				if(!min || sum < min.val)
					min = {i, j, val: sum};
			}

	if(min.val >= 0)
		return null;

	return {i: min.i, j: min.j};
}

function potentials(xs, cs)
{
	var n = xs.length,
		m = xs[0].length,
		i, j;

	var u = new Array(n).fill(null),
		v = new Array(m).fill(null);

	var countU = new Array(n).fill(0),
		countV = new Array(m).fill(0);

	for(i = 0; i < n; i++)
		for(j = 0; j < m; j++)
			if(R(xs[i][j]))
			{
				countU[i]++;
				countV[j]++;
			}

	var maxCount = {type: 'u', off: 0, val: 0};

	for(i = 0; i < n; i++)
		if(countU[i] > maxCount.val)
			maxCount = {type: 'u', off: i, val: countU[i]};

	for(j = 0; j < m; j++)
		if(countV[j] > maxCount.val)
			maxCount = {type: 'v', off: j, val: countV[j]};

	if(maxCount.type === 'u')
		u[maxCount.off] = 0;
	else
		v[maxCount.off] = 0;

	console.log(`${maxCount.type}[${maxCount.off + 1}] = 0 (invoked ${maxCount.val} times)`);

	while(u.concat(v).some(x => x === null))
		for(i = 0; i < n; i++)
			for(j = 0; j < m; j++)
				if(R(xs[i][j]))
				{
					if(R(u[i]) && R(v[j]) && (u[i] + v[j] !== cs[i][j])) // debugging check
						throw new Error('Inconsistency');

					if(R(u[i]) && !R(v[j]))
					{
						v[j] = cs[i][j] - u[i];

						console.log(`v[${j + 1}] = ` +
							`c[${i + 1}][${j + 1}] - u[${i + 1}] = ` +
							`${cs[i][j]} - ${u[i]} = ` +
							`${v[j]}`
						);
					}

					if(R(v[j]) && !R(u[i]))
					{
						u[i] = cs[i][j] - v[j];

						console.log(`u[${i + 1}] = ` +
							`c[${i + 1}][${j + 1}] - v[${j + 1}] = ` +
							`${cs[i][j]} - ${v[j]} = ` +
							`${u[i]}`
						);
					}
				}

	var min;

	for(i = 0; i < n; i++)
		for(j = 0; j < m; j++)
			if(!R(xs[i][j]))
			{
				console.log(`γ[${i + 1}][${j + 1}] = ` +
					`c[${i + 1}][${j + 1}] - u[${i + 1}] - v[${j + 1}] = ` +
					`${cs[i][j]} - ${u[i]} - ${v[j]} = ` +
					`${cs[i][j] - u[i] - v[j]}`
				);

				if(!R(xs[i][j]) && (
					!min || cs[i][j] - u[i] - v[j] < min.val
				))
					min = {i, j, val: cs[i][j] - u[i] - v[j]};
			}

	if(!min || min.val >= 0)
		return null;

	return {i: min.i, j: min.j};
}


function viciousShift(xs, cell)
{
	if(R(xs[cell.i][cell.j]))
		throw new Error(`xs[${cell.i}][${cell.j}] is not free`);

	var cycle = getViciousCycle(xs, cell),
		l = cycle.length,
		k, min;

	for(k = 0; k < l; k += 2)
		if(!min || min.val > xs[cycle[k].i][cycle[k].j])
			min = {k, val: xs[cycle[k].i][cycle[k].j]};

	xs[cycle[l - 1].i][cycle[l - 1].j] = 0;

	for(k = 0; k < l; k++)
		if(k % 2 === 0)
			xs[cycle[k].i][cycle[k].j] -= min.val;
		else
			xs[cycle[k].i][cycle[k].j] += min.val;

	xs[cycle[min.k].i][cycle[min.k].j] = null;
}

function getViciousCycle(xs, start)
{
	var cycles = traverse(xs, start, start, [], 'horizontal');

	if(cycles.length !== 1)
		throw new Error(`xs[${start.i}][${start.j}] has ${cycles.length} vicious cycles`);

	if(cycles[0].length === 0)
		throw new Error(`xs[${start.i}][${start.j}] has empty vicious cycle`);

	if(cycles[0].length % 2 !== 0)
		throw new Error(`xs[${start.i}][${start.j}] has odd vicious cycle`);
	
	return cycles[0];
}

function traverse(xs, current, end, passed, direction)
{
	var n = xs.length,
		m = xs[0].length,
		i, j;

	var result = [];

	if(direction === 'vertical')
	{
		for(i = 0; i < n; i++)
			if(!passed.some(p => p.i === i && p.j === current.j) && i !== current.i)
			{
				if(R(xs[i][current.j]))
					result = result.concat(
						traverse(xs, {i, j: current.j}, end, passed.concat({i, j: current.j}), 'horizontal')
					);
				else if(i === end.i && current.j === end.j)
					result.push(passed.concat([end]));
			}
	}
	else
	{
		for(j = 0; j < m; j++)
			if(!passed.some(p => p.i === current.i && p.j === j) && j !== current.j)
			{
				if(R(xs[current.i][j]))
					result = result.concat(
						traverse(xs, {i: current.i, j}, end, passed.concat({i: current.i, j}), 'vertical')
					);
				else if(current.i === end.i && j === end.j)
					result.push(passed.concat([end]));
			}
	}

	return result;
}

function validate(as, bs, xs)
{
	var n = as.length,
		m = bs.length,
		i, j;

	var fas = new Array(n).fill(0),
		fbs = new Array(m).fill(0);

	for(i = 0; i < n; i++)
		for(j = 0; j < m; j++)
		{
			fas[i] += xs[i][j] || 0;
			fbs[j] += xs[i][j] || 0;
		}

	for(i = 0; i < n; i++)
		if(fas[i] !== as[i])
			throw new Error(`fas[${i}]: ${fas[i]} !== as[${i}]: ${as[i]}`);
	
	for(j = 0; j < m; j++)
		if(fbs[j] !== bs[j])
			throw new Error(`fbs[${j}]: ${fbs[j]} !== bs[${j}]: ${bs[j]}`);

	var basics = 0;

	for(i = 0; i < n; i++)
		for(j = 0; j < m; j++)
			if(xs[i][j] !== null)
				basics++;
			else
				getViciousCycle(xs, {i, j});

	if(basics !== m + n - 1)
		throw new Error(`Expected ${m + n - 1} basics, got ${basics}`);
}


function printTransportTaskXs(xs)
{
	console.log(tprintf(
		xs.map(r => 
			r.map(x => 
				x === null ? '.' : x.toString()
			)
		),
		2
	));
}

function getValue(xs, cs)
{
	var sum = 0;

	for(var i = 0; i < xs.length; i++)
		for(var j = 0; j < xs[i].length; j++)
			if(Number.isFinite(xs[i][j]))
				sum += xs[i][j] * cs[i][j];

	return sum;
}

function printSolution(xs, cs)
{
	printTransportTaskXs(xs);

	var sum = 0;

	process.stdout.write('Zmin = 0');
	
	for(var i = 0; i < xs.length; i++)
		for(var j = 0; j < xs[i].length; j++)
			if(Number.isFinite(xs[i][j]))
			{
				process.stdout.write(` + ${xs[i][j]} * ${cs[i][j]}`);

				sum += xs[i][j] * cs[i][j];
			}

	console.log(` = ${sum}\n`);
}


module.exports = {
	solveTransportTask,
	northWest,
	leastCost,
	distributive,
	potentials,
	viciousShift,
	getViciousCycle,
	validate
};
