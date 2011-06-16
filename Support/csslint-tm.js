#!/usr/local/bin/node
var env = process.env || process.ENV,
	fs = require('fs'),
	sys = require('sys'),
	stdout  = process.stdout,
	CSSLint = require(env.TM_BUNDLE_SUPPORT + "/csslint-node.js").CSSLint;

var entities = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;'
};

function html(s) {
  return (s || '').replace(/[&"<>]/g, function(c) {return entities[c] || c;});
}


module.exports = function(options) {
	if (options === undefined)
		options = {};
		
	var file = env.TM_FILEPATH;
	var input = fs.readFileSync(file, 'utf8');
	
	var result = CSSLint.verify(input);
	var messages = result.messages;
	
	var body = "";
	
	if (messages.length){
	    body = '<div class="cssHeader">CSSLint</div>';
	
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
	
    if (body.length > 0) {
      fs.readFile(__dirname + '/output.html', 'utf8', function(e, html) {
        sys.puts(html.replace('{body}', body));
        process.exit(205); //show_html
      });
    }
};
