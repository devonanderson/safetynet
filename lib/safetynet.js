var fs 	= require('fs')
,	yaml = require('js-yaml')
,	_	= require('underscore')
,	winston = require('winston')
,	ErrorWrapper = require('./error_wrapper');

function SafetyNet (opts) {

	var defaults = {
		definitions: '../errors'
	,	defaultError: 'SYSTEM.DEFAULT'
	, verbose: false
	,	onError: function (err, req, res, next) {
			
			next();
		}
	};

	this.settings = _.extend(defaults, opts);

	this.logger = winston;

	this.init();
}

SafetyNet.prototype.init = function () {

	var settings = this.settings
	,		errors = {};
		
	try {
		var definitions = fs.readdirSync(settings.path);
	} 
	catch (e) {
		console.error('SafetyNet: Could not read route directory: ' + settings.path);
		throw e;
	}
	
	for(var i = 0; i < definitions.length; i++) {
		
		if(definitions[i].indexOf('.yml') == -1) continue;

		var namespace = definitions[i].replace('.yml','').toUpperCase();
		
		try {
			var definition = yaml.safeLoad(fs.readFileSync(settings.path + "/" + definitions[i], 'utf8'));
		} 
		catch(e) {
			console.error('SafetyNet: Route definition: ' + definitions[i] + ' contains errors. Skipping.');
			console.error(e);

			continue;
		}

		errors[namespace] = definition;
	}

	this.errors = errors;
}

SafetyNet.prototype.wrapError = function (err, req) {

	var settings = this.settings
	,		part = err.message.split('.')
	,		route = this.defaultError;
	
	if(this.errors[part[0]]) {
		route = err.message;
	}

	var part = route.split('.')
	,		definition = { 
		message: 'SafetyNet: Could not find error definition for ' + route
	};

	try	{
		definition = this.errors[part[0]][part[1]];
	}
	catch (e) {
		console.error('SafetyNet: Could not find error definition for ' + route);
		console.error(e);
	}

	if(route === settings.defaultError) {
		definition.message = err.message;
	}

	if(req) {
		var protocol = req.protocol
		,		ip = req.ip
		,		cookie = _.isEmpty(req.signedCookies) ? req.cookies : req.signedCookies;
	}

	return new ErrorWrapper(definition, type, protocol, ip, cookie, err.stack);
}

SafetyNet.prototype.middleware = function () {

	var self = this;

	return function (err, req, res, next) {

		var settings = self.settings
		,		error = self.wrapError(err, req);

		if(error.log) {
			this.logger.log('error', err.toJSON(settings.verbose));
		}

		settings.onError.call(this, error, req, res, function () {

			res.status(error.code).send(error.toJSON(settings.verbose));

			next();
		});
	}
}

exports = module.exports = SafetyNet;