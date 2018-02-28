#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const cssAnalyzer = require("./bin/css/compat-analyzer");
const cssExtracter = require("./bin/css/css-extracter");
const jsAnalyzer = require("./bin/js/compat-analyzer");
const jsExtracter = require("./bin/js/js-extracter");
const htmlAnalyzer = require("./bin/html/compat-analyzer");
const {fetchURL} = require("./lib/fetchURL");

// Deal with command line arguments

let fileName = "index.html";
let scopeFileName = "scope.json";
let mode = "normal";
if(process.argv.length === 2){
    console.log("Using " + fileName + " as the root and " + scopeFileName + " as the scope descriptor");
}
if(process.argv.length === 3 && path.extname(process.argv[2]) === ".html"){
    fileName = process.argv[2];
}
if(process.argv.length === 3 && path.extname(process.argv[2]) === ".json"){
    scopeFileName = process.argv[2];
}
if(process.argv.length === 3 && path.extname(process.argv[2]) === ".css"){
    mode = "css";
    fileName = process.argv[2];
}
if(process.argv.length === 3 && path.extname(process.argv[2]) === ".js"){
    mode = "js";
    fileName = process.argv[2];
}
if(process.argv.length === 3 && process.argv[2].startsWith("http")){
    mode = "url";
    fileName = process.argv[2];
}

if(process.argv.length === 4 && process.argv[2].startsWith("http")){
    mode = "url";
    fileName = process.argv[2];
    scopeFileName = process.argv[3];
} else if(process.argv.length === 4){
    fileName = process.argv[2];
    scopeFileName = process.argv[3];
}



if(process.argv.length === 5){
    if(process.argv.includes("-html")){
        mode = "html";
        fileName = process.argv[process.argv.indexOf("-html") + 1];
        scopeFileName = process.argv[Math.max(2,((process.argv.indexOf("-html") + 2) % 5))];
    }
    if(process.argv.includes("-css")){
        mode = "css";
        fileName = process.argv[process.argv.indexOf("-css") + 1];
        scopeFileName = process.argv[Math.max(2,((process.argv.indexOf("-css") + 2) % 5))];
    }
    if(process.argv.includes("-js")){
        mode = "js";
        fileName = process.argv[process.argv.indexOf("-js") + 1];
        scopeFileName = process.argv[Math.max(2,((process.argv.indexOf("-js") + 2) % 5))];
    }
}


const scope = JSON.parse(fs.readFileSync(scopeFileName, "utf-8"));

if(mode === "normal"){
    // Let's parse the HTML
    htmlAnalyzer.analyzeFile(fileName, scope, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        // report =[ {"browser " / "filename" / "line" / "column" / "featureName" / "minVer"]
        report.sort(sortReport);
        report.map(printReportLine);
    });


    // Let's get the CSS inside the site
    cssExtracter.analyzeFile(fileName, (e, acc) => {
        acc.map(async (block) => {
            cssAnalyzer.analyzeString(await block.content, scope, block.lineShift, block.fileName, (e, d) => {
                if (e) {
                    console.error(e);
                    return false;
                }
                const report = d;
                console.log("CSS Report:");
                report.sort(sortReport);
                report.map(printReportLine);
            });
        });
    });


    // Let's get the JavaScript inside the site
    jsExtracter.analyzeFile(fileName, (e, acc) => {
        acc.map(async (block) => {
            jsAnalyzer.analyzeString(await block.content, scope, block.lineShift, block.fileName, (e, d) => {
                if (e) {
                    console.error(e);
                    return false;
                }
                const report = d;
                // console.log("JS Report:");
                report.sort(sortReport);
                report.map(printReportLine);
            });
        });
    });
}

if(mode === "html"){
    htmlAnalyzer.analyzeFile(fileName, scope, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
}

if(mode === "css"){
    const content = fs.readFileSync(fileName,"utf-8");
    cssAnalyzer.analyzeString(content, scope, 0, fileName, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("CSS Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
}

if(mode === "js"){
    const content = fs.readFileSync(fileName,"utf-8");
    jsAnalyzer.analyzeString(content, scope, 0, fileName, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("JavaScript analysis isn't yet implemented - JS Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
}


if(mode === "url"){
    // Let's parse the HTML
    fetchURL(fileName).then(str => {
        htmlAnalyzer.analyzeString(str, scope, 0, fileName, (e, d) => {
            if (e) {
                console.error(e);
                return false;
            }
            const report = d;
            console.log("HTML Report:");
            // report =[ {"browser " / "filename" / "line" / "column" / "featureName" / "minVer"]
            report.sort(sortReport);
            report.map(printReportLine);
        });

        // Let's get the CSS inside the site
        cssExtracter.analyzeString(str, fileName, (e, acc) => {
            acc.map(async (block) => {
                cssAnalyzer.analyzeString(await block.content, scope, block.lineShift, block.fileName, (e, d) => {
                    if (e) {
                        console.error(e);
                        return false;
                    }
                    const report = d;
                    console.log("CSS Report:");
                    report.sort(sortReport);
                    report.map(printReportLine);
                });
            });
        });
        // Let's get the JavaScript inside the site
        jsExtracter.analyzeString(str, fileName, (e, acc) => {
            acc.map(async (block) => {
                jsAnalyzer.analyzeString(await block.content, scope, block.lineShift, block.fileName, (e, d) => {
                    if (e) {
                        console.error(e);
                        return false;
                    }
                    const report = d;
                    // console.log("JS Report:");
                    report.sort(sortReport);
                    report.map(printReportLine);
                });
            });
        });
    }
        ,(e)=>{console.error(e);});

}



function sortReport (reportLineA, reportLineB){
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

function printReportLine (reportLine) {
    console.log(`\t\t${reportLine.browser} incompatible - ${reportLine.fileName}#L${reportLine.line} - ${reportLine.featureName} ${(reportLine.featureVersion ? (" - minVer: " + reportLine.featureVersion) : " not implemented")}`);
}

exports.htmlStringAnalyzer = function htmlStringAnalyzer (string, browserScope){
    htmlAnalyzer.analyzeString(string, browserScope, 0, fileName, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
};

exports.cssStringAnalyzer = function cssStringAnalyzer (string, browserScope){
    cssAnalyzer.analyzeString(string, browserScope, 0, fileName, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("CSS Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
};

exports.jsStringAnalyzer = function jsStringAnalyzer (string, browserScope){
    jsAnalyzer.analyzeString(string, browserScope, 0, fileName, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("JS Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
};

exports.htmlFileAnalyzer = function htmlFileAnalyzer (filePath, browserScope){
    htmlAnalyzer.analyzeFile(filePath, browserScope, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
};

exports.cssFileAnalyzer = function cssFileAnalyzer (filePath, browserScope){
    const content = fs.readFileSync(filePath,"utf-8");
    cssAnalyzer.analyzeString(content, browserScope, 0, fileName, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("CSS Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
};

exports.jsFileAnalyzer = function jsFileAnalyzer (filePath, browserScope){
    const content = fs.readFileSync(filePath,"utf-8");
    jsAnalyzer.analyzeString(content, browserScope, 0, fileName, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("JavaScript analysis isn't yet implemented - JS Report:");
        report.sort(sortReport);
        report.map(printReportLine);
    });
};
