// from http://youmightnotneedjquery.com/
export default function getJSON(url, callback) {

	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var data = JSON.parse(request.responseText);
			callback(null, data);
		} else {
			// We reached our target server, but it returned an error
			error(request.statusText, null);
		}
	};

	request.onerror = function() {
		error(request.statusText, null);
	};

	request.send();
}

