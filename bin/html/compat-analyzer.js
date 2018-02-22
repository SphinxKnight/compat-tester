const htmlParser = require("htmlparser2");
const bcd = require("mdn-browser-compat-data");
const fs = require("fs");
const semver = require("semver");
const readline = require("readline");

exports.analyzeFile = function analyzeFile(fileName, browserScope, callback){
    let report = [];
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let numLine = 1;

    const parser = new htmlParser.Parser({
        onopentag: function(name, attribs){
            if(bcd.html.elements[name]){
                Object.keys(browserScope).map((browser)=>{
                    let versionAddedElem = bcd.html.elements[name].__compat.support[browser].version_added;
                    if((!versionAddedElem) || (versionAddedElem !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedElem)) )){
                        report.push({
                            "featureName":"<"+name+">",
                            "browser":browser,
                            "filename":fileName,
                            "line": numLine,
                            "column": 0,
                            "featureVersion":versionAddedElem
                        });
                    }
                    Object.keys(attribs).map((attrib)=>{
                        if(bcd.html.elements[name][attrib] && bcd.html.elements[name][attrib].__compat){
                            let versionAddedAttr = bcd.html.elements[name][attrib].__compat.support[browser].version_added;
                            if((!versionAddedAttr) || (versionAddedAttr !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedAttr)) )){
                                report.push({
                                    "featureName":"<"+name+"> - attr" + attrib,
                                    "browser":browser,
                                    "filename":fileName,
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
        onend: function(){
            callback(null,report);
        }
    },{decodeEntities: true});


    rl.on("line", (line) => {
        parser.write(line);
        numLine++;
    });
    
    rl.on("close",() =>{
        parser.end();
    });
};

