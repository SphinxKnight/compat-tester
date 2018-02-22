# compat-tester

`compat-tester` is a static tool analysis that, provided a "browser scope", scans HTML, CSS and JS files and outputs a compatibility report for features that might not be available for such a scope (e.g. if my scope contains IE8 and my `style.css` stylesheet contains CSS Grid properties).

`compat-tester`'s approach is pretty naive and currently doesn't detect any [progressive enhancement](https://christianheilmann.com/2012/02/16/stumbling-on-the-escalator/), polyfills, etc. that could improve actual compatibility.


This tool is heavily built upon:
* [`mdn-browser-compat-data`](https://www.npmjs.com/package/mdn-browser-compat-data) from MDN team, please [contribute](https://developer.mozilla.org/docs/MDN/Contribute/Structures/Compatibility_tables) so that more data is available :)
* [`htmlparser2`](https://www.npmjs.com/package/htmlparser2) for parsing HTML
* [`css-tree`](https://www.npmjs.com/package/css-tree) for parsing CSS
Thanks to them for doing the heavy work :)

**This project must be considered as alpha-stage.**

## Install

    npm install compat-tester

## Usage



### As an command line tool
    
    compat-tester # Scans index.html as root file and uses scope.json as defaults
    compat-tester mySite.html myScope.json
    compat-tester -html myPage.html myScope.json  # Only scans the HTML of myPage.html
    compat-tester -css myStyle.css myScope.json   # Only scans the CSS of myStyle.css
    compat-tester -js myScript.js myScope.json    # !Not implemented yet! Only scans myScript.js

### As a module 

    const compatTester = require(compat-tester);
    let report = compatTester.cssStringAnalyzer(string, browserScope);
    let report = compatTester.cssFileAnalyzer(filePath, browserScope);
    let report = compatTester.htmlStringAnalyzer(string, browserScope);
    let report = compatTester.htmlFileAnalyzer(filePath, browserScope);
    let report = compatTester.jsStringAnalyzer(string, browserScope); // Not implemented yet
    let report = compatTester.jsFileAnalyzer(filePath, browserScope); // Not implemented yet

## Browser-scope file

The `scope.json` file is simply a JSON file where the keys are the identifiers of the browsers you want/need to support, following [mdn-browser-compat](https://github.com/mdn/browser-compat-data/blob/master/schemas/compat-data-schema.md#browser-identifiers)'s syntax and where the values are the minimum version you want/need to support.
For instance with the following `scope.json`

    {
        "ie":8,
        "firefox":34
    }

`compat-tester` will report any detected feature that isn't available before Internet Explorer 8 and Firefox 34.
## Limitations - Wishlist
The following features are currently missing :'(
### CSS
(*current feature set: properties*)
* Media-queries
* Selectors
### JavaScript
(*current feature set: nothing*)
* Parsing JS and dealing with primary features like statements, operators
### Misc.
* Resolving remote resources
* Adding comments to locally disable warnings
* An interactive CLI to easily create a `scope.json` file (something like "compat-tester --init")
* Tests
### Integration
* Addon for VSCode
* Addon for SublimeText

## Notes 
This project is one of my first "real" JavaScript project, feel free to add [issues](https://github.com/SphinxKnight/compat-tester/issues) if you see any minor/major/confusing/horrendous stuff.