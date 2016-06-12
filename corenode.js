/*var foo1 = require('./exports/foo1');
foo1.a();
foo1.b();
Globals
var foo2 = require('./exports/foo2');
foo2.a();
foo2.b();

var foo3 = require('./exports/foo3');
foo3.a();
foo3.b();
*/

var fs = require('fs');
try {
	fs.unlinkSync('./test.txt');
	console.log('test.txt successfully deleted');
}
catch (err) {
	console.log('Error:', err);
} 


fs.unlink('./test.txt', function (err) {
	if (err) {
		console.log('Error:', err);
	}
	else {
		console.log('test.txt successfully deleted');
	}
});