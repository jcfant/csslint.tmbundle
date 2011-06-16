#!/usr/local/bin/node
var env = process.env || process.ENV,
	http = require('http'),
	fs = require('fs'),
	sys = require('sys'),
	stdout  = process.stdout,
	cssLintFile = env.TM_BUNDLE_SUPPORT + "/csslint.js";


/*
 * Original version of  an html escape from jshint.tmbundle
 */
var entities = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;'
};

function html(s) {
  return (s || '').replace(/[&"<>]/g, function(c) {return entities[c] || c;});
}

/*
 * Download the latest CSSLint file.
 */

function getLatest(callback){
	var request = http.get({host: "csslint.net", port: 80, path: "/js/csslint.js"}, function(response){
		if (response.statusCode == 200){
			response.setEncoding("utf8");
			var d = "var CSSLint = (function(){";
			response.on('data', function(chunk) { d += chunk; });
			response.on('end', function() { d += '});'; fs.writeFile(cssLintFile, d, callback); });
		}else{
			callback('Bad HTTP Status Code: ' + html(response.statusCode));
		}
	}).on('error', function(error){
		callback('Failed to get latest CSSLint.js: ' + html(error.message));
	});
}

function hasLatest(callback){
	fs.stat(cssLintFile, function(error, stats){
		if (error || (Date.now() - Date.parse(stats.mtime)) / 1000 / 60 / 60 / 24 >= 7){
			getLatest(callback);
		}else{
			callback();
		}
	});
}

module.exports = function(options) {
	hasLatest(function(error){
		if (options === undefined)
			options = {};
			
		var file = env.TM_FILEPATH;
		var input = fs.readFileSync(file, 'utf8');
		var CSSLint = require(cssLintFile).CSSLint;

		var result = CSSLint.verify(input);
		var messages = result.messages;
		
		var body = "";
		
		if (messages.length){
		    if (error){
			    body += '<div class="cssHeader">' + error + '</div>';
		    }
		    body += '<div class="cssHeader">CSSLint</div>';
		
			if (options.rollup){
				//rollups at the bottom
				messages.sort(function(a, b){
					if (a.rollup){
						return -1;
					} else if (b.rollup){
						return 1;
					} else {
						return 0;
					}
				});
			}

			messages.forEach(function(message,i){
				var link = 'txmt://open?url=file://' + escape(file) + '&line=' + message.line;
				body += "<div class=\"entry " + message.type + "\"><a href=\"" + link + "\">";
				body += "<div class=\"header " + message.type + "\">" + message.type + "</div>";
				body += "<div class=\"message\">" + html(message.message) + "</div>";
				body += "<div class=\"evidence\">" + html(message.evidence) + "</div>";
				body += '</a>';
				body += "</div>";
			});
		}

		
		/*
		 * Original version of  writing the error messages to TextMate from jshint.tmbundle
		 */
		if (body.length > 0) {
			fs.readFile(__dirname + '/output.html', 'utf8', function(e, html) {
				sys.puts(html.replace('{body}', body));
				process.exit(205); //show_html
			});
		}
	});
};
