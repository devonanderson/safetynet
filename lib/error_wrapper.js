
function ErrorWrapper (def, type, protocol, ip, cookie, stack) {

	this.error = new Error(def.message || 'Unknown error');
	
	this.error.stack = stack;
	this.error.id = def.id || 0;
	this.error.code = def.code || 500;
	this.error.loggable = def.log || false;
	this.error.type = type;
	this.error.protocol = protocol;
	this.error.ip = ip;
	this.error.cookie = cookie;
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

ErrorWrapper.prototype.toJSON = function (verbose) {
	var data = {
		id: this.id
	,	code: this.code
	,	type: this.type
	,	message: this.message
	};

	if (verbose) {
		data['protocol'] = this.protocol;
		data['ip'] = this.ip;
		data['cookie'] = this.cookie;
		data['stack'] = this.stack;
	}

	return data;
}

ErrorWrapper.prototype.toString = function (verbose) {
	
	var message = (new Date()).toString() + '\nError: \n\t type: ' + this.type + '\n\t code: ' + this.code + '\n\t message: ' + this.message + '\n';

	if(verbose) {
		message += '\tip: ' + this.ip +  '\n\tprotocol: ' + this.protocol + '\n\tcookie: ' + this.cookie + '\n\n' + this.stack + '\n\n';
	}
	else {
		message += '\n';
	}

	return message;
};

exports = module.exports = ErrorWrapper;