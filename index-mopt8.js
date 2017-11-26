let [,, f1, f2, a, b, n] = process.argv;

f1 = new Function('x', `return ${f1}`);
f2 = new Function('x', `return ${f2}`);

let epsilon = 0;

for(var i = 0; i <= n; i++)
{
	const x = a + i * (b - a) / n;
	const e = Math.abs(f1(x) - f2(x));

	if(e > epsilon)
		epsilon = e;
}

console.log(epsilon);
