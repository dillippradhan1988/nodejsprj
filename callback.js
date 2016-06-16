//Callback 1
/*function first(data, cb) {
    console.log('Executing first');
    setTimeout(cb, 1000, data);
}

function second(data, cb) {
    console.log('Executing second');
    setTimeout(cb, 1000, data);
}

function third(data, cb) {
    console.log('Executing third');
    setTimeout(cb, 1000, data);
}

//In line handlers
first('data', function (text1) {
    second(text1, function (text2) {
        third(text2, function (text3) {
            console.log('done:', text3); // indented
        });
    });
});
*/




//Callback 2
/*function first(data, cb) {
    console.log('Executing first');
    setTimeout(cb, 1000, data);
}
function second(data, cb) {
    console.log('Executing second');
    setTimeout(cb, 1000, data);
}
function third(data, cb) {
    console.log('Executing third');
    setTimeout(cb, 1000, data);
}
// Named handlers
function handleThird(text3) {
    console.log('done:', text3); // no indent!
}

function handleSecond(text2) {
    third(text2, handleThird);
}
function handleFirst(text1) {
    second(text1, handleSecond);
}
// Start the chain
first('data', handleFirst);
*/




//Callback 3 (If/else in an Async World)
/*function alwaysAsync(arg, cb){
    if(arg){
        process.nextTick(function(){
            cb('cached data');
        });
    }else{
        setTimeout(function(){
            cb('loaded data');
        }, 500);
    }
}

alwaysAsync(true, function(data){
    foo();
});
bar();

function foo(){
    console.log('foo');
}
function bar(){
    console.log('bar');
}*/


//Loop in async simple
/*
// an async function to load an item
function loadItem(id, cb) {
    setTimeout(function () {
        cb(null, { id: id });
    }, 500);
}

// functions to manage loading
var loadedItems = [];
function itemsLoaded() {
    console.log('Do something with:', loadedItems);
}

function itemLoaded(err, item) {
    loadedItems.push(item);
    if (loadedItems.length == 2) {
        itemsLoaded();
    }
}
// calls to load
loadItem(1, itemLoaded);
loadItem(2, itemLoaded);
*/


//Loop in async using aync module
/*function loadItem(id, cb){
    setTimeout(function(){
        cb(null, { id: id })
    },500);
}

function itemsLoaded(err, loadedItems){
    console.log('Do something with '+ loadedItems);
}

var async = require("async");

async.parallel([
    function(cb){
        loadItem(1,cb);
    },
    function(cb){
        loadItem(2,cb);
    }
],itemsLoaded);*/

/*var fs = require('fs');

function loadJSON(filename, cb){
    fs.readFile(filename,function(err, data){
        if(err){
            return cb(err);
        }else{
            try{
                var parsed = JSON.parse(data);
            }
            catch(err){
                return cb(err);    
            }
            return cb(null,parsed);
        }
    });
}

loadJSON('package.json',function(err, data){
    console.log('our callback called');
    if(err){
        console.log('Bad json file', err.message);
    }else{
        console.log(data);
    }
})*/






//promise
/*var Q = require('q');

function getPromise() {
    var deferred = Q.defer();
    // Resolve the promise after a second
    setTimeout(function () {
        deferred.resolve('final value');
    }, 1000);
    
    return deferred.promise;
}

var promise = getPromise();

promise.then(function (val) {
    console.log('done with:', val);
});*/