const htmlParser = require("htmlparser2");
const bcd = require("mdn-browser-compat-data");
const fs = require("fs");
const semver = require("semver");
const readline = require("readline");

// eslint-disable-next-line no-unused-vars
exports.analyzeString = function analyzeString (str, browserScope, lineShift = 0, fileName, callback, options){
    const report = [];
    let numLine = 1;
    const lines = str.split("\n");
    const parser = initParser(browserScope, fileName, numLine, report, callback, options);
    for(const line of lines){
        parser.write(line);
        numLine++;
    }
    parser.end();
};

exports.analyzeFile = function analyzeFile (fileName, browserScope, callback, options){
    const report = [];
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let numLine = 1;

    const parser = initParser(browserScope, fileName, numLine, report, callback, options);

    rl.on("line", (line) => {
        parser.write(line);
        numLine++;
    });

    rl.on("close",() =>{
        parser.end();
    });
};


function initParser (browserScope, fileName, numLine, report, callback, options = {"contrib":null}){
    return new htmlParser.Parser({
        onopentag: function (name, attribs){
            if(bcd.html.elements[name]){
                Object.keys(browserScope).map((browser)=>{
                    let versionAddedElem;
                    if(bcd.html.elements[name].__compat.support[browser]){
                        versionAddedElem = bcd.html.elements[name].__compat.support[browser].version_added;
                    }
                    if((versionAddedElem !== null) && ((!versionAddedElem) || (versionAddedElem !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedElem)) ))){
                        report.push({
                            "featureName":"<" + name + ">",
                            "browser":browser,
                            "fileName":fileName,
                            "line": numLine,
                            "column": 0,
                            "featureVersion":versionAddedElem
                        });
                    }
                    // Intercept any feature that isn't properly filled into MDN according to
                    // the contribute option
                    if((options.contrib === "true" || options.contrib === "all" ) && versionAddedElem === true){
                        // eslint-disable-next-line no-console
                        console.log("HTML element <" + name + "> with true in BCD for " + browser + ": https://github.com/mdn/browser-compat-data/blob/master/html/elements/" + name + ".json to fix that 🤘");
                    }
                    if((options.contrib === "null" || options.contrib === "all" ) && versionAddedElem === null){
                        // eslint-disable-next-line no-console
                        console.log("HTML element <" + name + "> with null in BCD for " + browser + ": https://github.com/mdn/browser-compat-data/blob/master/html/elements/" + name + ".json to fix that 🤘");
                    }
                    Object.keys(attribs).map((attrib)=>{
                        let versionAddedAttr;
                        let featureName = "";
                        if(bcd.html.elements[name][attrib] && bcd.html.elements[name][attrib].__compat && bcd.html.elements[name][attrib].__compat.support[browser]){
                            versionAddedAttr = bcd.html.elements[name][attrib].__compat.support[browser].version_added;
                            featureName = "<" + name + "> - attribute " + attrib;
                        } else if (bcd.html.global_attributes[attrib] && bcd.html.global_attributes[attrib].__compat && bcd.html.global_attributes[attrib].__compat.support[browser]){
                            versionAddedAttr = bcd.html.global_attributes[attrib].__compat.support[browser].version_added;
                            featureName = "global attribute " + attrib;
                        }
                        if(versionAddedAttr !== undefined && versionAddedAttr !== null){
                            if((!versionAddedAttr) || (versionAddedAttr !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedAttr)) )){
                                report.push({
                                    "featureName":featureName,
                                    "browser":browser,
                                    "fileName":fileName,
                                    "line": numLine,
                                    "column": 0,
                                    "featureVersion":versionAddedAttr
                                });
                            }
                        }
                        if((options.contrib === "true" || options.contrib === "all" ) && versionAddedAttr === true){
                            if(featureName.startsWith("global attribute")){
                                // eslint-disable-next-line no-console
                                console.log(featureName + " with true in BCD for " + browser + ": https://github.com/mdn/browser-compat-data/blob/master/html/global_attributes.json to fix that 🤘");
                            } else {
                                // eslint-disable-next-line no-console
                                console.log("HTML " + featureName + " with true in BCD for " + browser + ": https://github.com/mdn/browser-compat-data/blob/master/html/elements/" + name + ".json to fix that 🤘");
                            }
                        }
                        if((options.contrib === "null" || options.contrib === "all" ) && versionAddedAttr === null){
                            if(featureName.startsWith("global attribute")){
                                // eslint-disable-next-line no-console
                                console.log(featureName + " with null in BCD for " + browser + ": https://github.com/mdn/browser-compat-data/blob/master/html/global_attributes.json to fix that 🤘");
                            } else {
                                // eslint-disable-next-line no-console
                                console.log("HTML " + featureName + " with null in BCD for " + browser + " https://github.com/mdn/browser-compat-data/blob/master/html/elements/" + name + ".json to fix that 🤘");
                            }
                        }
                    });
                });

            }
        },
        onend: function (){
            callback(null,report);
        }
    },{decodeEntities: true});

}