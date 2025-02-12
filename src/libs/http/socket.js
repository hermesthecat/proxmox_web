const IPV4_OCTET = "(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])";
const IPV4_REGEXP = "(?:(?:" + IPV4_OCTET + "\\.){3}" + IPV4_OCTET + ")";
const IPV6_H16 = "(?:[0-9a-fA-F]{1,4})";
const IPV6_LS32 = "(?:(?:" + IPV6_H16 + ":" + IPV6_H16 + ")|" + IPV4_REGEXP + ")";
const IPV6_REGEXP = "(?:" +
	"(?:(?:" + "(?:" + IPV6_H16 + ":){6})" + IPV6_LS32 + ")|" +
	"(?:(?:" + "::" + "(?:" + IPV6_H16 + ":){5})" + IPV6_LS32 + ")|" +
	"(?:(?:(?:" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){4})" + IPV6_LS32 + ")|" +
	"(?:(?:(?:(?:" + IPV6_H16 + ":){0,1}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){3})" + IPV6_LS32 + ")|" +
	"(?:(?:(?:(?:" + IPV6_H16 + ":){0,2}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){2})" + IPV6_LS32 + ")|" +
	"(?:(?:(?:(?:" + IPV6_H16 + ":){0,3}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){1})" + IPV6_LS32 + ")|" +
	"(?:(?:(?:(?:" + IPV6_H16 + ":){0,4}" + IPV6_H16 + ")?::" + ")" + IPV6_LS32 + ")|" +
	"(?:(?:(?:(?:" + IPV6_H16 + ":){0,5}" + IPV6_H16 + ")?::" + ")" + IPV6_H16 + ")|" +
	"(?:(?:(?:(?:" + IPV6_H16 + ":){0,7}" + IPV6_H16 + ")?::" + ")" + ")" +
	")";
const IP64_match = new RegExp("^(?:" + IPV6_REGEXP + "|" + IPV4_REGEXP + ")$");
export default class Socket {
	constructor(url, cb) {
		this.socket = null;
		this.url = '';
		this.url = url;
		this.lockReconnet = false;
		this.isReconnet = false;
		this.timeoutObj = null;
		this.serverTimeoutObj = null;
		this.cb = cb;
		this.timeout = 60 * 1000; // Heartbeat interval
	}

	onmessage() {
		if (this.socket)
			this.socket.onmessage = (ev) => {
				this.getMsg(ev);
				this.reset();
				this.isReconnet = false;
			}
	}
	// Receive data from server
	getMsg(ev) {
		this.cb(ev);
	}

	onerror() {
		if (this.socket)
			this.socket.onerror = () => {
				console.log('WebSocket service error - onerror');
				this.start();
				this.reconnet(this.url);
			}
	}
	// Reconnect
	reconnet() {
		if (this.lockReconnet)
			return false
		this.isReconnet = true;
		this.lockReconnet = true
		setTimeout(() => {
			new Socket(this.url);
			this.lockReconnet = false
		}, 60 * 1000)
	}
	// Open socket connection
	onopen() {
		if (this.socket)
			this.socket.onopen = () => {
				console.log('Socket connection successful')
				if (this.isReconnet) { // Execute global callback function
					console.log('WebSocket reconnected');
					this.isReconnet = false
				}
			}
	}
	// Close socket connection
	onclose() {
		if (this.socket)
			this.socket.onclose = () => {
				console.log("Socket connection closed");
				this.reset();
			}
	}
	sendMsg(arg) { // Send data, receive data
		let data = Object.create(null);
		if (this.socket)
			if (this.socket.readyState === 1) {
				data = JSON.stringify(arg);
				this.socket.send(arg);
			} else {
				setTimeout(() => {
					console.log(socket, 'Waiting for socket connection to succeed')
					this.sendMsg(data)
				}, 1500)
				return false
			}
	}

	reset() {
		clearTimeout(this.timeoutObj)
		clearTimeout(this.serverTimeoutObj)
	}

	start() {
		if (this.socket)
			this.timeoutObj = setTimeout(() => {
				// Send data, if onmessage can receive data, connection is normal, then execute reset method in onmessage to clear timer
				this.socket.send('heart check')
				this.serverTimeoutObj = setTimeout(() => {
					this.socket.close()
				}, this.timeout)
			}, this.timeout)
	}

	windowHostname() {
		return window.location.hostname.replace(/(http|https)/, 'wss');
	}

	init(url, cb) {
		this.url = url;
		this.cb = cb;
		if ('WebSocket' in window) {
			// Without nginx
			//this.socket = new WebSocket('ws://' + location.origin.replace(/(http\:\/\/|https:\/\/)/, '') + '/ws' +this.url + `?accessToken=${window.localStorage.getItem("accessToken")}`)
			this.socket = new WebSocket(this.url) // With nginx
		} else if ('MozWebSocket' in window) {
			// Without nginx
			//this.socket = new MozWebSocket('ws://' + location.origin.replace(/(http\:\/\/|https:\/\/)/, '') + '/ws' + this.url + `?accessToken=${window.localStorage.getItem("accessToken")}`)
			this.socket = new MozWebSocket(this.url) // With nginx
		}
		this.onopen();
		this.onmessage();
		this.onerror();
		this.onclose();
	}
}
