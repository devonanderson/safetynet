function ErrorWrapper (def, type, protocol, ip, cookie, stack) {

	this.error = new Error(def.message || 'Unspecified Error');
	
	this.error.stack 	= stack;
	this.error.id 		= def.id || 0;
	this.error.code 	= def.code || 500;
	this.error.loggable = def.log || false;
	this.error.type 	= type;
	this.error.protocol = protocol;
	this.error.ip 		= ip;
	this.error.cookie 	= cookie;
}

ErrorWrapper.prototype = {
	get id() {
		return this.error.id;
	},
	get code() {
		return this.error.code;
	},
	get loggable() {
		return this.error.loggable;
	},
	get type() {
		return this.error.type;
	},
	get message() {
		return this.error.message;
	},
	get protocol() {
		return this.error.protocol;
	},
	get ip() {
		return this.error.ip;
	},
	get cookie() {
		return this.error.cookie;
	},
	get stack() {
		return this.error.stack;
	}
}

ErrorWrapper.prototype.toJSON = function () {
	return {
		id 		: this.id
	,	code	: this.code
	,	type 	: this.type
	,	message	: this.message
	};
}

ErrorWrapper.prototype.toJSONV = function () {
	return {
		id 		: this.id
	,	code 	: this.code
	,	type 	: this.type
	,	message : this.message
	,	protocol: this.protocol
	,	ip 		: this.ip
	,	cookie 	: this.cookie
	,	stack 	: this.stack
	}
}

ErrorWrapper.prototype.toString = function () {
	
	return (new Date()).toString() + '\nError: \n\t type: ' + this.type + '\n\t code: ' + this.code + '\n\t message: ' + this.message + '\n';
};

ErrorWrapper.prototype.toStringV = function () {
	
	return (new Date()).toString() + '\nError: \n\t id: ' + this.id + '\n\tcode: ' + this.code + '\n\ttype: ' + this.type + '\n\tmessage: ' + this.message + '\n\tip: ' + this.ip +  '\n\tprotocol: ' + this.protocol + '\n\tcookie: ' + this.cookie + '\n\n' + this.stack + '\n';
};

exports = module.exports = ErrorWrapper;