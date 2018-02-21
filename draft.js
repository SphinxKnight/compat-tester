const htmlParser = require("htmlparser2");
const bcd = require("mdn-browser-compat-data");
const fs = require("fs");
const readline = require("readline");
const semver = require("semver");

const scope = JSON.parse(fs.readFileSync(process.argv[3],"utf-8"));

var report = {"html":{},"css":{},"javascript":{}};
var numLine = 1;

const parser = new htmlParser.Parser({
    onopentag: function(name, attribs){
        if(bcd.html.elements[name]){
            Object.keys(scope).map((browser)=>{
                let version_added_elem = bcd.html.elements[name].__compat.support[browser].version_added;
                if((!version_added_elem) || (version_added_elem !== true && semver.lt(semver.coerce(scope[browser]), semver.coerce(version_added_elem)) )){
                    if(!(name in report["html"])){
                        report["html"][name]= {};
                    }
                    if(!("elem" in report["html"][name])){
                        report["html"][name]["elem"] = [];
                    }
                    report["html"][name]["elem"].push({
                        "type":"gap",
                        "browser": browser,
                        "scope_version": scope[browser],
                        "feature_version": version_added_elem,
                        "line": numLine
                    });
                }
                Object.keys(attribs).map((attrib)=>{
                    if(bcd.html.elements[name][attrib]){
                        let version_added_attr = bcd.html.elements[name][attrib].__compat.support[browser].version_added;
                        if((!version_added_attr) || (version_added_attr !== true && semver.lt(semver.coerce(scope[browser]), semver.coerce(version_added_attr)) )){
                            if(!(name in report["html"])){
                                report["html"][name] = {};
                            }
                            if(!(attrib in report["html"][name])){
                                report["html"][name][attrib] = [];
                            }
                            report["html"][name][attrib].push({
                                "type":"gap",
                                "browser": browser,
                                "scope_version": scope[browser],
                                "feature_version": version_added_attr,
                                "line": numLine
                            });
                        }
                    }
          
                });
            });
      
        }
    },
    onend: function(){
        fs.appendFileSync("log.json",JSON.stringify(report),"utf8");
    }
},{decodeEntities: true});



const rl = readline.createInterface({
    input: fs.createReadStream(process.argv[2]),
    crlfDelay: Infinity
});

rl.on("line", (line) => {
    parser.write(line);
    numLine++;
});

rl.on("close",() =>{
    parser.end();
});