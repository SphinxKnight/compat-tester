const htmlParser = require("htmlparser2");
const bcd = require("mdn-browser-compat-data");
const fs = require("fs");
const semver = require("semver");
const readline = require("readline");

// eslint-disable-next-line no-unused-vars
exports.analyzeString = function analyzeString (str, browserScope, lineShift = 0, fileName, callback){
    const report = [];
    let numLine = 1;
    const lines = str.split("\n");
    const parser = initParser(browserScope, fileName, numLine, report, callback);
    for(const line of lines){
        parser.write(line);
        numLine++;
    }
    parser.end();
};

exports.analyzeFile = function analyzeFile (fileName, browserScope, callback){
    const report = [];
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let numLine = 1;

    const parser = initParser(browserScope, fileName, numLine, report, callback);

    rl.on("line", (line) => {
        parser.write(line);
        numLine++;
    });

    rl.on("close",() =>{
        parser.end();
    });
};


function initParser (browserScope, fileName, numLine, report, callback){
    return new htmlParser.Parser({
        onopentag: function (name, attribs){
            if(bcd.html.elements[name]){
                Object.keys(browserScope).map((browser)=>{
                    const versionAddedElem = bcd.html.elements[name].__compat.support[browser].version_added;
                    if((!versionAddedElem) || (versionAddedElem !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedElem)) )){
                        report.push({
                            "featureName":"<" + name + ">",
                            "browser":browser,
                            "fileName":fileName,
                            "line": numLine,
                            "column": 0,
                            "featureVersion":versionAddedElem
                        });
                    }
                    Object.keys(attribs).map((attrib)=>{
                        let versionAddedAttr = null;
                        let featureName = "";
                        if(bcd.html.elements[name][attrib] && bcd.html.elements[name][attrib].__compat){
                            versionAddedAttr = bcd.html.elements[name][attrib].__compat.support[browser].version_added;
                            featureName = "<" + name + "> - attribute " + attrib;
                        } else if (bcd.html.global_attributes[attrib] && bcd.html.global_attributes[attrib].__compat){
                            versionAddedAttr = bcd.html.global_attributes[attrib].__compat.support[browser].version_added;
                            featureName = "global attribute " + attrib;
                        }
                        if(versionAddedAttr){
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
                    });
                });

            }
        },
        onend: function (){
            callback(null,report);
        }
    },{decodeEntities: true});

}