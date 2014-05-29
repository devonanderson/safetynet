var fs 				= require('fs')
,	yaml 			= require('js-yaml')
,	_				= require('underscore')
,	winston 		= require('winston')
,	ErrorWrapper 	= require('./entity');

function SafetyNet (opts) {

	var defaults = {
		path 		: '../errors'
	,	namespace 	: 'ERROR'
	,	defaultType	: 'SYSTEM.DEFAULT'
	,	logging 	: {
			logErrors 	: true
		,	toConsole	: true
		,	toFile 		: true
		,	logFile 	: __dirname + '/../logs/error.log'
		,	logger 		: winston
		,	init 		: function (settings, logger) {
				if(settings.toFile) {
					logger.add(logger.transports.File, { filename: settings.logFile });
				}
				if(!settings.toConsole) {
					logger.remove(winston.transports.Console);
				}
			}
		,	log 		: function (err, logger) {
				logger.log('error', err.toJSONV());
			}
		}
	,	handle 		: function (entity, req, res, next) {
			
			res.status(entity.code).send(entity.toJSON());
		}
	,	wrap 		: {
			protocol: 	function (err, req, res) {
				
				return req.protocol;
			}
		,	ip: 	function (err, req, res) {
				
				return req.ip;
			}
		,	cookie: function (err, req, res) {

				return (_.isEmpty(req.signedCookies) ? req.cookies : req.signedCookies);
			}
		}
	}

	var wrap 	= defaults.wrap
	,	logging = defaults.logging;

	this.settings = _.extend(defaults, opts);
	
	if(opts.wrap) {
		this.settings.wrap = _.extend(wrap, opts.wrap);
	}
	if(opts.logging) {
		this.settings.logging = _.extend(logging, opts.logging);
	}

	this.settings.logging.init(this.settings.logging, this.settings.logging.logger);

	this.map 	= this.mapErrors();
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
	,	def 	= { 
		message: 'SafetyNet: Could not find error definition for ' + type 
	};

	try	{
		def = this.map[part[0]][part[1]];
	}
	catch (e) {
		console.error('SafetyNet: Could not find error definition for ' + type);
		console.error(e);
	}

	if(route == this.settings.defaultType) {
		def.message = def.message.format(err.message);
	}
	else {
		def.message = def.message.format(err.text || '');
	}

	var protocol 	= this.settings.wrap.protocol(err, req)
	,	ip 			= this.settings.wrap.ip(err, req)
	,	cookie 		= this.settings.wrap.cookie(err, req);

	return new ErrorWrapper(def, type, protocol, ip, cookie, err.stack);
}

SafetyNet.prototype.middleware = function () {

	var self = this;

	return function (err, req, res, next) {

		var entity 	= self.wrapError(err, req)
		,	logging = self.settings.logging;

		if(logging.logErrors && entity.loggable) {
			logging.log(entity, logging.logger);
		}

		self.settings.handle(entity, req, res, next);
	}
}

exports = module.exports = SafetyNet;