SafetyNet
=========

Simple error logging middleware for [Express](http://github.com/visionmedia/express) using [Winston](http://github.com/indexzero/winston). 

Safetynet uses YAML configuration files to create a library of error definitions. These definitions are used to create custom errors and simplify the error handling process.

##How To

###Definitions

First you must define your errors by either adding to the included YAML file, or by creating your own. The included definition file provides a simple sample error definition. Each YAML file creates it's own namespace, this helps to separate your errors out in a logical way that will keep things nice and tidy.


```
//sample error file system.yml

DEFAULT: //The name of the error
  id: 100 //The unique id
  code: 500 //The HTTP status code
  log: true //Whether or not to log the error
  message: 'Default system error' //The error message
```

###Instantiation

You should instantiate SafetyNet in your app.js file, it should be done before you set Express' middleware.

```
var SafetyNet = require('safetynet'),
	errorHandler = new SafetyNet({
		definitions: '../errors', //The directory where your configuration files are located
		defaultError: 'SAFETYNET.DEFAULT', //You can pass any error object to SafetyNet
		verbose: false, //How much to log from the error object
		onError: function(err, req, res, next) { //Called when an error is passed through the Express middleware
			next();
		}															});
```

Pass the SafetyNet middleware as the last call in the Express middleware chain

```
app.use(errorHandler.middleware());
```

###Usage

Inside your Express routes you can throw a new error like this

```
var route = function (req, res, next) {
	
	next(new Error('SYSTEM.ERROR')); //Calling next with an error as the argument will trigger the error middleware
}
```

```SYSTEM.ERROR``` is the key path for the error definition. SafetyNet will search ```system.yml``` for a key with the name ```ERROR```

```
var route = function (req, res, next) {
	
	foo.bar(function (err) {

		next(err); //SafetyNet can handle any error object
	});
}
```

Passing an error object to SafetyNet will trigger the default route, the default route is defined in the safetynet.yml that ships with the package. The errors message will be set as the message of the passed error object. You can change the default route when you instantiate SafetyNet.

###Events

The ```onError()``` function is called just before the error is sent to the client. You get access to the error object, and the Express ```req``` and ```res``` objects. Calling ```next();``` will trigger the final return to the client. 
