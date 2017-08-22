import io from "../../../vendor/client.socket.io.js";
import stringify from 'json-stringify-safe';
import _debounce from 'lodash/function/debounce';
import _forEach from 'lodash/collection/forEach';


// Import this file into client SENDING log messages then make use of library 
// EX: const remoteConsoleTransmitter = new RemoteConsoleTransmitter("http://localhost:3000");

const WAIT = 3000;
const STYPE = "logPayload";
const LINE_BREAK = "\r\n";
const EOL = ";;; ";

// const origConsoleLog = window.console.log.bind(window.console);
const LOG_TYPES = {
	LOG: "LOG",
	WARN: "WARNING",
	ERR: "ERROR",
	THROWN: "THROWN ERROR"
};

let getLogTime = function() {
    var d = new Date();
    return d.getHours() + ':' +
        ('0' + d.getMinutes()).substr(('0' + d.getMinutes()).length - 2) + ':' +
        ('0' + d.getSeconds()).substr(('0' + d.getSeconds()).length - 2) + '.' +
        d.getMilliseconds();
};

function RemoteConsoleTransmitter(host) {
	this.socket = io((typeof host === "string") ? host : "http://localhost");
	this.unsentMessages = [];

    this.transmitUnsentMessages = _debounce(this.transmitUnsentMessages.bind(this), WAIT);
	this.interceptLogMessages();

	return this;
};

RemoteConsoleTransmitter.prototype.logMessage = function logMessage(message, style) {
    let output = message;
    if (typeof message !== "string") {
        output = stringify(message);
    }

    if (typeof style === "string") {
        output = "[" + style + "] " + output;
    }

    this.storeLogMessage("[" + getLogTime() + "] " + output);
};

RemoteConsoleTransmitter.prototype.interpretLogMessageArguments = function interpretLogMessageArguments(args) {
    let output = "";
    let simplified = Array.prototype.slice.apply(args);

    _forEach(simplified, function(arg) {
        if (typeof(arg) === "object") {
            output += "{{" + stringify(arg) + "}}" + EOL;
        }
        else {
            output += arg + EOL;
        }
    });

    return output;
};

RemoteConsoleTransmitter.prototype.interceptLogMessages = function interceptLogMessages() {
    let self = this;

    window.console.log = function() {
        self.logMessage(self.interpretLogMessageArguments(arguments), LOG_TYPES.LOG);
    };

    window.console.warn = function() {
        self.logMessage(self.interpretLogMessageArguments(arguments), LOG_TYPES.WARN);
    };

    window.console.error = function() {
        self.logMessage(self.interpretLogMessageArguments(arguments), LOG_TYPES.ERR);
    };

    window.onunhandledrejection = window.onanyerror = window.onerror = function() {
        self.logMessage(self.interpretLogMessageArguments([arguments[0].reason.toString(), arguments]), (arguments[0].type && arguments[0].type.toUpperCase()) || LOG_TYPES.THROWN);
        return true;
    };
};

RemoteConsoleTransmitter.prototype.storeLogMessage = function storeLogMessage(message) {
	if (typeof message === "string") {
		this.unsentMessages.push(message.trim());
	}

	this.transmitUnsentMessages();
};

RemoteConsoleTransmitter.prototype.transmitUnsentMessages = function transmitUnsentMessages() {
	this.socket.emit(STYPE, stringify(this.unsentMessages));
    this.unsentMessages = [];
};

export default RemoteConsoleTransmitter;
