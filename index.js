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
    report.sort(sortReport);
    report.map(printReportLine);
    // console.log("\t" + browser + " is incompatible because of:");
    // console.log("\t\t" + "<" + elem + ">" + " " + type + " " + val + " line: " + e.line + (e.feature_version ? " - minVer: " + e.feature_version : ""));
});


// Let's get the CSS inside the site
// cssExtracter.analyzeFile outputs an array of CSS stylesheet codes 
cssExtracter.analyzeFile(process.argv[2], (e, acc) => {
    acc.map((block) => {
        cssAnalyzer.analyzeString(block.content, scope, block.lineShift, block.fileName, (e, d) => {
            if (e) {
                console.error(e);
                return false;
            }
            let report = d;
            console.log("CSS Report:");
            report.sort(sortReport);
            report.map(printReportLine);
        });
    });
});


// Let's get the JavaScript inside the site
jsExtracter.analyzeFile(process.argv[2], (e, acc) => {
    acc.map((block) => {
        jsAnalyzer.analyzeString(block.content, scope, block.lineShift, block.fileName, (e, d) => {
            if (e) {
                console.error(e);
                return false;
            }
            let report = d;
            console.log("JS Report:");
            report.sort(sortReport);
            report.map(printReportLine);
        });
    });
});


function sortReport(reportLineA, reportLineB){
    if(reportLineA.browser !== reportLineB.browser){
        return (reportLineA.browser).localeCompare(reportLineB.browser);
    }
    if(reportLineA.filename !== reportLineB.filename){
        if(reportLineA.filename.split("/").length !== reportLineB.filename.split("/").length){
            return (reportLineA.filename.split("/").length - reportLineB.filename.split("/").length);
        }
        return (reportLineA.filename).localeCompare(reportLineB.filename);
    }
    if(reportLineA.line !== reportLineB.line){
        return reportLineA.line - reportLineB.line;
    }
}

function printReportLine(reportLine) {
    console.log("\t\t" + reportLine.browser + " incompatible - @" + reportLine.fileName + "#L" + reportLine.line + " - " + reportLine.featureName + (reportLine.featureVersion ? (" - minVer: " + reportLine.featureVersion) : " not implemented"));
}