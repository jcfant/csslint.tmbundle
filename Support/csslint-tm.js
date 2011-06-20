#!/usr/bin/env node
var env = process.env || process.ENV,
	http = require('https'),
	fs = require('fs'),
	sys = require('sys'),
	stdout  = process.stdout,
	cssHost = "raw.github.com", 
	cssFile = "csslint-node.js",
	cssPath = "/stubbornella/csslint/master/build/", 
	cssLintFile = env.TM_BUNDLE_SUPPORT + "/" + cssFile;


/*
 * Based on original version of an html escape from jshint.tmbundle
 */
var htmlConvert = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;'
};

function html(s) {
  return (s) ? s.replace(/[&"<>]/g, function(ch) { return htmlConvert[ch] || ch; }) : '';
}

/*
 * Download the latest CSSLint file.
 */

function getLatestJS(callback){
	var request = http.get({host: cssHost, port: 443, path: cssPath + cssFile}, function(response){
		if (response.statusCode == 200){
			response.setEncoding("utf8");
			var d = "";
			response.on('data', function(chunk) { d += chunk; });
			response.on('end', function() { fs.writeFile(cssLintFile, d, callback); });
		}else{
			callback('Bad HTTP Status Code: ' + response.statusCode);
		}
	}).on('error', function(error){
		callback('Failed to get latest CSSLint.js: ' + error.message);
	});
}

function hasLatestJS(callback){
	fs.stat(cssLintFile, function(error, stats){
		if (error){
			getLatestJS(callback);
			return;
		}
		
		var aDate = Date.parse(stats.atime);
		var mDate = Date.parse(stats.mtime);
		var lDate = aDate < mDate ? aDate : mDate;
		if ((Date.now() - lDate) / 1000 / 60 / 60 / 24 >= 7){
			getLatestJS(callback);
		}else{
			callback();
		}
	});
}

module.exports = function(options) {
	hasLatestJS(function(error){
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
