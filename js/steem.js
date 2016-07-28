/**
 * Author: @pharesim
 * Url: https://github.com/pharesim/steemjs/blob/master/src/ws.js
 
 * Comment: The syntax from the git repo as is crashes app in safari.
 *          Modification made to allow for better cross browser compatibility
 *          2016.07.28 Brian Howell
 *
 */
var WebSocketWrapper;
WebSocketWrapper = function () {
    var ws = WebSocketWrapper.prototype;function WebSocketWrapper(server) {
    	this.server = server;this.connection = {};this.callbacks = [];
    } ws.connect = function () {
    	var _this = this;

    	return new Promise(function (resolve, reject) {
			if ('WebSocket' in window) {
				_this.connection = new WebSocket(_this.server);_this.connection.onopen = function () {
					resolve(_this.connection);
				};
				_this.connection.onerror = function (error) {
					reject(Error('Error connecting to server, please reload the page!' + error));
				};
				_this.connection.onmessage = function (data) {
					var sdata = JSON.parse(data['data']);_this.callbacks[sdata['id']](sdata['result']);
				};
			} else {
				reject(Error('Your browser is too old, please get a recent one!'));
			}
		});
    };
    ws.send = function (data, callback) {
    	this.callbacks[data['id']] = callback;var json = JSON.stringify(data);this.connection.send(json);
    };return WebSocketWrapper;
}();

var SteemWrapper;SteemWrapper = function () {
	var steem = SteemWrapper.prototype;function SteemWrapper(ws) {
		this.ws = ws;this.id = 0;
	}
	steem.send = function (method, params, callback) {
		++this.id;var data = { "id": this.id, "method": method, "params": params };this.ws.send(data, callback);
	};
	return SteemWrapper;
}();