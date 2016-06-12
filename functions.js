//Function
/*function foo() { return 123; }
console.log(foo()); // 123

function bar() { }
console.log(bar()); // undefined
*/
/*
function foo(){
	return 123;
}
console.log(foo());

function bar(){}
console.log(bar());
*/

//Immediately Executing Function
/*(function foo(){console.log('foo was executed.');})();*/

//Anonymous Function
/*var foo1 = function namedFunction(){
	console.log('foo1');
};
foo1();

var foo2 = function(){
	console.log('foo2');
}
foo2();*/

//Higher-Order Functions
/*setTimeout(function(){
	console.log('2000 milliseconds have passed since this demo started');
},2000);*/

//Closures
/*function outerFunction(arg){
	var variableInOuterFunction = arg;
	function bar(){
		console.log(variableInOuterFunction);
	}
	bar();
}
outerFunction('hello closure!');*/

/*
function longRunningOperatioin(callback){
	setTimeout(callback,3000);
}

function webRequest(request){
	console.log('starting a long operation for request:', request.id);
	longRunningOperatioin(function(){
		console.log('ending a long operation for request:', request.id);
	});
}

webRequest({id:1});
webRequest({id:2});
*/

/*
// utility funcion
function fibonacci(n) {
	if (n < 2)
		return 1;
	else
		return fibonacci(n - 2) + fibonacci(n - 1);
}
 
// setup the timer
console.time('timer');
setTimeout(function () {
	console.timeEnd('timer'); // Prints much more than 1000ms
}, 1000)
 
// Start the long
fibonacci(44);
*/

/*
// Are these all falsy?
if (!false) {
	console.log('falsy');
}
if (!null) {
	console.log('falsy');
}
if (!undefined) {
	console.log('falsy');
}
*/

//Module patteren
/*function printableMessage(){
	var message = 'hello';
	function setMessage(newMessage){
		if(!newMessage) throw new Error('cannot set empty property.');
		message = newMessage;
	}
	function getMessage(){
		return message;
	}
	function printMessage(){
		console.log(message);
	}

	return {
		setMessage:setMessage,
		getMessage:getMessage,
		printMessage:printMessage
	}
}

var awesome1 = printableMessage();
awesome1.printMessage();

var awesome2 = printableMessage();
awesome2.setMessage('Hi');
awesome2.printMessage();
*/

//this
/*var foo = {
	bar:123
};

function bas(){
	if(this === global)
		console.log('called from global');
	if(this === foo)
		console.log('called from foo');
}

bas();

foo.bas = bas;
foo.bas();
*/

//this with new
/*function foo(){
	this.foo = 123;
	console.log('Is this global : '+ this == global);
}

foo();
console.log(global.foo);

var newFoo = new foo();
console.log(newFoo.foo);*/

//prototype
/*function foo(){}
foo.prototype.bar = 123;

var bas = new foo();
var qax = new foo();

console.log(bas.bar);
console.log(qax.bar);

foo.prototype.bar = 456;

console.log(bas.bar);
console.log(qax.bar);

*/

//class
/*function someClass(){
	this.someProperty = 'some value';
}
someClass.prototype.someMemberFunction = function(){
	this.someProperty = 'modified value';
}

var instance = new someClass();

console.log(instance.someProperty);
instance.someMemberFunction();
console.log(instance.someProperty);
*/

//Error handleing
/*try{
	console.log('About to throw an error');
	throw new Error('Error thrown');
}
catch(e){
	console.log('i will be execute if an error thrown');
	console.log('error caught '+ e.message);
}
finally{
	console.log('I will be execute irrespective of an error thrown');
}*/
/*
function getConnection(callback){
	var connection;
	try{
		throw new Error('');
		callback(null,connection);
	}
	catch(error){
		callback(error,null);
	}
}

getConnection(function(err,connection){
	if(err){
		console.log('Error: ',err.message);
	}else{
		console.log('Connection succeeded: ',connection);
	}
});*/

/*function printableMessage(){
	var message = 'hello';
	function setMessage(newMessage){
		if(!newMessage) throw new Error('cannot set empty property.');
		message = newMessage;
	}
	function getMessage(){
		return message;
	}
	function printMessage(){
		console.log(message);
	}

	return {
		setMessage:setMessage,
		getMessage:getMessage,
		printMessage:printMessage
	}
}

var awesome1 = printableMessage();
awesome1.printMessage();
*/

//Prototype Inheritance (javascript)
/*function Animal(name){
	this.name = name;	
}

Animal.prototype.walk = function (destination) {
	console.log(this.name, 'is walking to', destination);
};

var animal = new Animal('Elephant');
animal.walk('melbourne');



function Bird(name){
	Animal.call(this,name);
}

Bird.prototype.__proto__ = Animal.prototype;
Bird.prototype.fly = function(destination){
	console.log(this.name, 'is flying to ', destination);
}

var bird = new Bird('Sparrow');
bird.walk('sydney');
bird.fly('melbourne');
*/

//Prototype Inheritance (node.js)
var inherits = require('util').inherits;
/*
function Animal(name){
	this.name = name;	
}

Animal.prototype.walk = function (destination) {
	console.log(this.name, 'is walking to', destination);
};

var animal = new Animal('Elephant');
animal.walk('melbourne');



function Bird(name){
	Animal.call(this,name);
}

inherits(Bird, Animal);

Bird.prototype.fly = function(destination){
	console.log(this.name, 'is flying to ', destination);
}

var bird = new Bird('Sparrow');
bird.walk('sydney');
bird.fly('melbourne');
*/

//Function override
/*function Base(){
	this.message = 'message';
}
Base.prototype.foo = function(){
	return this.message + ' base foo';
}

function Child(){
	Base.call(this);
}
inherits(Child,Base);

Child.prototype.foo = function(){
 	return Base.prototype.foo.call(this) + ' child foo';
}

var child = new Child();
console.log(child.foo());
*/

//Events
/*var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();


//subscribe
emitter.on('foo',function(arg1,arg2){
	console.log('Foo raised ', arg1, arg2);
});

emitter.emit('foo',{ a:123 },{ b:456 });
*/
 /*
var fooHandler = function () {
	console.log('handler called');
	 
	// Unsubscribe
	emitter.removeListener('foo',fooHandler);
};
 
//emitter.on('foo', fooHandler);

emitter.once('foo', fooHandler);
 
// Emit twice
emitter.emit('foo');
emitter.emit('foo');


emitter.on('foo', function a() { });
emitter.on('foo', function b() { });
console.log(emitter.listeners('foo'));
*/
// Listener addition / removal notifications
/*emitter.on('removeListener', function (eventName, listenerFunction) {
console.log(eventName, 'listener removed', listenerFunction.name);
});
emitter.on('newListener', function (eventName, listenerFunction) {
console.log(eventName, 'listener added', listenerFunction.name);
});
 
function a() { }
function b() { }
 
// Add
emitter.on('foo', a);
emitter.on('foo', b);
 
// Remove
emitter.removeListener('foo', a);
emitter.removeListener('foo', b);
*/
var http = require('http');

var server = http.createServer(function(request,response){
	console.log('server starting');
	response.write('Hello World');
	response.end()
});

server.listen(3000);

console.log('server is running at http://127.0.0.1:3000/');