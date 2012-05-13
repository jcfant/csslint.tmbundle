CSSLint TextMate Bundle

Forked from jcfant's [CSSLint Textmate Bundle](https://github.com/jcfant/csslint.tmbundle), who originally forked it from [JSHint TM Bundle](https://github.com/fgnass/jshint.tmbundle) and updated it to use CSSLint.

TextMate bundle for [CSSLint](http://csslint.net/)



This Fork differs in several ways from jcfant's:

* First, the window stays open after double clicking on an entry. This way, even though you will be brought to the line in your document the entry is referring to, you will still be able to return to the lint window to see the next entry.
* Second, the window is a set 800px by 800px making it easier to manage.
* Third, I preferred the old design of the window, so I merged the two styles into what IMHO is a much better lint window: 
  * For errors, the background is now red.
	* The line number and column number of the error is displayed.
	* An underline is placed under the character in the code preview where the issue is found.
	* And a description of the rule in question is also displayed.



Features:

* Runs automatically upon save (⌘S)
* Can be bypassed by pressing ⇧⌘S
* Output is only shown when errors are found
* Based on Node.js

## Installation

	cd ~/Library/Application\ Support/TextMate/Bundles
	git clone git://github.com/stefmikhail/csslint.tmbundle.git "CSSLint.tmbundle"
	osascript -e 'tell app "TextMate" to reload bundles'


## Prerequisites

You need [Node.js](http://nodejs.org/) and TextMate, that's all.

This bundle uses `#!/usr/local/bin/node` to launch the node process. If you get a *node - not found* error,the `PATH` variable is probably not setup in TextMate.

## Contributors

* [JC Fant](http://www.scriptble.com)
* Stefan Melnychenko
