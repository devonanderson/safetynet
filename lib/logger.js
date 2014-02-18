var fs 	= require('fs')
,	_	= require('underscore');

function Logger (opts) {

	var defaults = {
		path 		: './log'
	,	file		: 'log'
	,	verbose 	: true
	,	dumpSize 	: 20
	};

	this.settings	= _.extend(defaults, opts);
	this.logData 	= [];	
}

Logger.prototype.log = function (err) {
	
	this.logData.push(this.settings.verbose ? err.toStringV() : err.toString());

	if(this.logData.length > this.settings.dumpSize) {

		this.dump();
		this.clear();
	}
}

Logger.prototype.dump = function () {

	var logString = '';

	for(var i = 0; i < this.logData.length; i++) {

		logString += this.logData[i] + '\n';
	}

	try {
		fs.appendFileSync(this.settings.path + '/' + this.settings.file, logString, 'utf8');
	}
	catch (e) {
		console.error('Logger: Could not open log file: ' + this.settings.path + '/' + this.settings.file);
		console.error(e);
	}

	this.clear();
}

Logger.prototype.clear = function () {

	this.logData = [];
}

exports = module.exports = Logger;