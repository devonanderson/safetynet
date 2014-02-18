var fs 				= require('fs')
,	yaml 			= require('js-yaml')
,	_				= require('underscore')
,	ErrorWrapper 	= require('./entity')
,	Logger 			= require('./logger');

function SafetyNet (opts) {

	var defaults = {
		path 		: './config/errors'
	,	namespace 	: 'APP'
	,	defaultType	: 'SYSTEM.DEFAULT'
	,	logErrors 	: true
	,	logDir		: './logs'
	,	logPrefix	: 'error'
	,	logDumpSize : 20
	}

	this.settings = _.extend(defaults, opts);

	this.map 	= this.mapErrors();
	this.logger = new Logger({
		path 	: this.settings.logDir
	,	file 	: this.settings.logPrefix + '_log'
	,	dumpSize: this.settings.logDumpSize
	});
}

SafetyNet.prototype.mapErrors = function () {

	var errors = {};
		
	try {
		var definitions = fs.readdirSync(this.settings.path);
	} 
	catch (e) {
		console.error('SafetyNet: Could not read route directory: ' + this.settings.path);
		throw e;
	}
	
	for(var i = 0; i < definitions.length; i++) {
		
		if(definitions[i].indexOf('.yml') == -1) continue;
		
		try {
			var errorDef = yaml.safeLoad(fs.readFileSync(this.settings.path + "/" + definitions[i], 'utf8'));
		} 
		catch(e) {
			console.error('SafetyNet: Route definition: ' + definitions[i] + ' contains errors. Skipping.');
			console.error(e);
			continue;
		}

		var namespace = definitions[i].replace('.yml','').toUpperCase();
		errors[namespace] = errorDef;
	}

	return errors;
}

SafetyNet.prototype.wrapError = function (err, req) {

	var route = this.settings.defaultType;
	
	if(err.message.indexOf(this.settings.namespace + ':') > -1) {
		route = err.message.replace(this.settings.namespace + ':', '');
	}

	var part 	= route.split('.')
	,	type 	= part[1]
	,	def 	= { message: 'SafetyNet: Could not find error definition for ' + type };

	try	{
		def = this.map[part[0]][part[1]];
	}
	catch (e) {
		console.error('SafetyNet: Could not find error definition for ' + type);
		console.error(e);
	}

	def.message = def.message.format(err.message);

	var reqType = req.io ? 'websocket' : 'http';

	var ipAddr = req.headers['x-forwarded-for'];
	if (ipAddr) {
		var Addrs = ipAddr.split(',');
		ipAddr = Addrs[Addrs.length - 1];
	} 
	else if(req.io) {
		ipAddr = req.io.disconnected ? 'undefined' : req.io.handshake.address.address;
	}
	else {
		ipAddr = req.connection.remoteAddress;
	}

	return new ErrorWrapper(def, type, reqType, ipAddr, err.stack);
}

SafetyNet.prototype.middleware = function () {

	var self = this;

	return function (err, req, res, next) {

		var entity = self.wrapError(err, req);

		if(self.settings.logErrors) {
			self.logger.log(entity);
		}
		
		switch(entity.reqType) {
			case 'websocket':
				req.io.emit(self.namespace.toLowerCase() + ':error', entity.toJSON());
				break;
			case 'http':
				res.send(entity.toJSON());
				break;
			default:
				console.error('SafetyNet: Request type not supported ' + entity.reqType);
				break;
		}
	}
}

exports = module.exports = SafetyNet;