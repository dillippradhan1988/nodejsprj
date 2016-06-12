var foo         =   {
    "firstName": "John",
    "lastName": "Smith",
    "isAlive": true,
    "age": 25,
    "height_cm": 167.64,
    "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    },
    "phoneNumbers": [
    { "type": "home", "number": "212 555-1234" },
    { "type": "fax", "number": "646 555-4567" }
    ],
    "additionalInfo": null
};

var jsonString  =   JSON.stringify(foo);
console.log(jsonString);
console.log(typeof(jsonString));


var jsonObj     =   JSON.parse(jsonString);
console.log(jsonObj);
console.log(typeof(jsonObj));