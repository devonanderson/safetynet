var _ = require('underscore');

function ErrorWrapper (def, type, reqType, ip, stack) {

	this.error = new Error(def.message || 'Unspecified Error');
	
	this.error.stack 	= stack;
	this.error.id 		= def.id || 0;
	this.error.code 	= def.code || 500;
	this.error.type 	= type;
	this.error.reqType 	= reqType;
	this.error.clientIP = ip;
}

ErrorWrapper.prototype = {
	get id() {
		return this.error.id;
	},
	get code() {
		return this.error.code;
	},
	get type() {
		return this.error.type;
	},
	get message() {
		return this.error.message;
	},
	get reqType() {
		return this.error.reqType;
	},
	get clientIP() {
		return this.error.clientIP;
	},
	get stack() {
		return this.error.stack;
	}
}

ErrorWrapper.prototype.toJSON = function () {
	return {
		code	: this.code
	,	type 	: this.type
	,	message	: this.message
	};
}

ErrorWrapper.prototype.toString = function () {
	
	return 'Error: \n\t type: ' + this.type + '\n\t code: ' + this.code + '\n\t message: ' + this.message + '\n';
};

ErrorWrapper.prototype.toStringVerbose = function () {
	
	return (new Date()).toString() + '\nError: \n\t ip: ' + this.clientIP + '\n\t type: ' + this.type + '\n\t code: ' + this.code + '\n\t message: ' + this.message + '\n\n' + this.stack + '\n';
};

exports = module.exports = ErrorWrapper;