const htmlParser = require("htmlparser2");
const bcd = require("mdn-browser-compat-data");
const fs = require("fs");
const semver = require("semver");
const readline = require("readline");

exports.analyzeFile = function analyzeFile(fileName, browserScope, callback){
    let report = {"html":{}};
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
                        if(!(name in report["html"])){
                            report["html"][name]= {};
                        }
                        if(!("elem" in report["html"][name])){
                            report["html"][name]["elem"] = {};
                            report["html"][name]["elem"][name] = [];
                        }
                        report["html"][name]["elem"][name].push({
                            "type":"gap",
                            "browser": browser,
                            "scope_version": browserScope[browser],
                            "feature_version": versionAddedElem,
                            "line": numLine
                        });
                    }
                    Object.keys(attribs).map((attrib)=>{
                        if(bcd.html.elements[name][attrib] && bcd.html.elements[name][attrib].__compat){
                            let versionAddedAttr = bcd.html.elements[name][attrib].__compat.support[browser].version_added;
                            if((!versionAddedAttr) || (versionAddedAttr !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedAttr)) )){
                                if(!(name in report["html"])){
                                    report["html"][name] = {};
                                }
                                if(!("attr" in report["html"][name])){
                                    report["html"][name]["attr"] = {};
                                }
                                if(!(attrib in report["html"][name]["attr"])){
                                    report["html"][name]["attr"][attrib] = [];
                                }
                                report["html"][name]["attr"][attrib].push({
                                    "type":"gap",
                                    "browser": browser,
                                    "scope_version": browserScope[browser],
                                    "feature_version": versionAddedAttr,
                                    "line": numLine
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

