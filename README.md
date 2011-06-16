CSSLint TextMate Bundle

Forked orignally from [JSHint TM Bundle](https://github.com/fgnass/jshint.tmbundle) and updated to use CSSLint

TextMate bundle for [CSSLint](http://csslint.net/)

![Screenshot](https://github.com/jcfant/images/raw/master/CSSLintTMBundle.jpg)

Features:

* Runs automatically upon save (⌘S)
* Can be bypassed by pressing ⇧⌘S
* Output is only shown when errors are found
* Based on Node.js

## Installation

Download the [zip file](http://github.com/jcfant/csslint.tmbundle/zipball/master) and rename the
extracted folder to `csslint.tmbundle`. Double-click.

## Prerequisites

You need [Node.js](http://nodejs.org/) and TextMate, that's all.

If you don't have Node.js installed on your system you can also use [Pierre Bertet's fork](https://github.com/bpierre/jshint.tmbundle) which uses [WebKit's JavaScriptCore](http://trac.webkit.org/wiki/JSC) instead.

This bundle uses `#!/usr/local/bin/node` to launch the node process. If you get a *node - not found* error,the `PATH` variable is probably not setup in TextMate.

## Contributors

* [JC Fant](http://www.scriptble.com)
