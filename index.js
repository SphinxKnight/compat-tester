const fs = require("fs");
const cssAnalyzer = require("./bin/css/compat-analyzer");
const cssExtracter = require("./bin/css/css-extracter");
const jsAnalyzer = require("./bin/js/compat-analyzer");
const jsExtracter = require("./bin/js/js-extracter");

const htmlAnalyzer = require("./bin/html/compat-analyzer");

const scope = JSON.parse(fs.readFileSync(process.argv[3], "utf-8"));


// Let's parse the HTML
htmlAnalyzer.analyzeFile(process.argv[2], scope, (e, d) => {
    if (e) {
        console.error(e);
        return false;
    }
    let report = d;
    console.log("HTML Report:");
    // report =[ {"browser " / "filename" / "line" / "column" / "featureName" / "minVer"]
    report.sort((a,b)=>{
        if(a.browser !== b.browser){
            return (a.browser).localeCompare(b.browser);
        }
        if(a.filename !== b.filename){
            if(a.filename.split("/").length !== b.filename.split("/").length){
                return (a.filename.split("/").length - b.filename.split("/").length);
            }
            return (a.filename).localeCompare(b.filename);
        }
        if(a.line !== b.line){
            return a.line - b.line;
        }
    });

    report.map((elem)=>{
        console.log("\t\t" + elem.browser + " incompatible - @" + elem.filename + "L" + elem.line + " - " + elem.featureName + (elem.featureVersion ? (" - minVer: " + elem.featureVersion) : " not implemented"));
    });
    // console.log("\t" + browser + " is incompatible because of:");
    // console.log("\t\t" + "<" + elem + ">" + " " + type + " " + val + " line: " + e.line + (e.feature_version ? " - minVer: " + e.feature_version : ""));
});


// Let's get the CSS inside the site
// cssExtracter.analyzeFile outputs an array of CSS stylesheet codes 
cssExtracter.analyzeFile(process.argv[2], (e, acc) => {
    acc.map((block) => {
        cssAnalyzer.analyzeString(block, scope, (e, d) => {
            if (e) {
                console.error(e);
                return false;
            }
            let report = d;
            console.log("CSS Report:");
            Object.keys(scope).map((browser) => {
                console.log("\t" + browser + " is incompatible because of:");
                if("properties" in report["css"]){
                    Object.keys(report["css"]["properties"]).map((elem) => {
                        report["css"]["properties"][elem].filter((e) => {
                            return e.browser === browser;
                        }).map((e) => {
                            console.log("\t\t Property: " +  elem + "" + " " + " line: " + e.line + (e.feature_version ? " - minVer: " + e.feature_version : ""));
                        });
                    });
                }
            });
        });
    });
});

// Let's get the JavaScript inside the site
jsExtracter.analyzeFile(process.argv[2], (e, acc) => {
    acc.map((block) => {
        jsAnalyzer.analyzeString(block, scope, (e, d) => {
            if (e) {
                console.error(e);
                return false;
            }
            let report = d;
            console.log("JS Report:");
            Object.keys(scope).map((browser) => {
                console.log("\t" + browser + " is incompatible because of:");
                Object.keys(report["js"]["properties"]).map((elem) => {
                    report["css"]["properties"][elem].filter((e) => {
                        return e.browser === browser;
                    }).map((e) => {
                        console.log("\t\t" + "<" + elem + ">" + " " + " line: " + e.line + (e.feature_version ? " - minVer: " + e.feature_version : ""));
                    });
                });
            });
        });
    });
});


// Let's parse the CSS
var cssTest = `
.a {
    background-color: #ffffff;
}
.b {
    border-top-left-radius: 3px;
}`;
cssAnalyzer.analyzeString(cssTest, scope, (e, d) => {
    if (e) {
        console.error(e);
        return false;
    }
    let report = d;
    console.log("CSS Report:");
    Object.keys(scope).map((browser) => {
        console.log("\t" + browser + " is incompatible because of:");
        Object.keys(report["css"]["properties"]).map((elem) => {
            report["css"]["properties"][elem].filter((e) => {
                return e.browser === browser;
            }).map((e) => {
                console.log("\t\t" + "<" + elem + ">" + " " + " line: " + e.line + (e.feature_version ? " - minVer: " + e.feature_version : ""));
            });
        });
    });
});