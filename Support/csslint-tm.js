#!/usr/local/bin/node
var env = process.env || process.ENV,
	http = require('https'),
	fs = require('fs'),
	util = require('util'),
	port = "443",
	stdout  = process.stdout,
	showVersionMessage = false,
	versionMessage = "There is a new version of cssLint Bundle. Please upgrade soon.",
	cssHost = "raw.github.com", 
	cssFile = "csslint-node.js",
	cssVersion = "csslint-version",
	cssTempVersion = "csslint-version.tmp",
	cssPath = "/stubbornella/csslint/master/release/", 
	cssLintFile = env.TM_BUNDLE_SUPPORT + "/" + cssFile,
	cssTMFile = env.TM_BUNDLE_SUPPORT + "/" + cssVersion,
	cssTempFile = env.TM_BUNDLE_SUPPORT + "/" + cssTempVersion;


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

function getLatest(callback, file, output){
	var request = http.get({host: cssHost, port: port, path: file}, function(response){
		if (response.statusCode == 200){
			response.setEncoding("utf8");
			var d = "";
			response.on('data', function(chunk) { d += chunk; });
			response.on('end', function() { fs.writeFile(output, d, callback); });
		}else{
			callback('Bad HTTP Status Code: ' + response.statusCode);
		}
	}).on('error', function(error){
		callback('Failed to get latest CSSLint.js: ' + error.message);
	});
}

function versionsMatch(tmContents, tempContents, callback){
	fs.readFile(cssTMFile, function(error, cssTMContents){
		cssTMContents = String(cssTMContents).replace(/^\s+|\s+$/, '');
		if (error)
			callback(false);
			
		fs.stat(cssTempFile, function(error, stats){
			if (error){
				callback(false);
			}else{
				fs.readFile(cssTempFile, function(error, cssTempContents){
					cssTempContents = String(cssTempContents).replace(/^\s+|\s+$/, '');
					callback( (cssTMContents != cssTempContents) );
				});
			}
		});
	});
}

function versionUpdate(show){
	showVersionMessage = show;
	versionUpdate.callback();
	versionUpdate.callback = undefined;
}

function version(error) {
	fs.stat(cssTMFile, function(error, stats){
		if (error){
			// just move .tmp to .version
			fs.readFile(cssTempFile, function(error, contents){
				fs.writeFile(cssTMFile, contents, function() { 
					versionsMatch(cssTMFile, cssTempFile, versionUpdate);
				});
			});
		}else{
			versionsMatch(cssTMFile, cssTempFile, versionUpdate);
		}
	});
}


function hasLatestJS(callback){
	fs.stat(cssLintFile, function(error, stats){
		if (error){
			getLatest(callback, cssPath + cssFile, cssLintFile);
			return;
		}
		
		var aDate = Date.parse(stats.atime);
		var mDate = Date.parse(stats.mtime);
		var lDate = aDate < mDate ? aDate : mDate;
		if ((Date.now() - lDate) / 1000 / 60 / 60 / 24 >= 7){
			getLatest(callback, cssPath + cssFile, cssLintFile);
		}else{
			callback();
		}
	});
}

function hasLatestVersion(callback){
	fs.stat(cssTMFile, function(error, stats){
		if (error){
			//util.puts(error);
			versionUpdate.callback = callback;
			getLatest(version, cssPath + cssVersion,  cssTempFile);
			return;
		}
		
		versionUpdate.callback = callback;
		fs.stat(cssTempFile, function(error){
			if (error){
				getLatest(version, cssPath + cssVersion,  cssTempFile);
			}
			
			var aDate = Date.parse(stats.atime);
			var mDate = Date.parse(stats.mtime);
			var lDate = aDate < mDate ? aDate : mDate;
			if ((Date.now() - lDate) / 1000 / 60 / 60 / 24 >= 7){
				getLatest(version, cssPath + cssVersion,  cssTempFile);
			}else{
				versionsMatch(cssTMFile, cssTempFile, versionUpdate);
			}
		});
	});
}

module.exports = function(options) {
	// check for latest bundle version
	hasLatestVersion(function(){
		// check for latest css lint
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
				if (showVersionMessage){
					body += '<div class="cssHeader">' + versionMessage + '</div>';
				}
			    if (error){
				    body += '<div class="cssHeader">' + error + '</div>';
			    }
		
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
					util.puts(html.replace('{body}', body));
					process.exit(205); //show_html
				});
			}
		});
	});
};
