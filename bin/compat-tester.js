#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const cssAnalyzer = require("./src/css/compat-analyzer");
const cssExtracter = require("./src/css/css-extracter");
const jsAnalyzer = require("./src/js/compat-analyzer");
const jsExtracter = require("./src/js/js-extracter");
const htmlAnalyzer = require("./src/html/compat-analyzer");
const reportHelpers = require("./../lib/report");
const {fetchURL} = require("./../lib/fetchURL");


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
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
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
                report.sort(reportHelpers.sortReport);
                report.map(reportHelpers.printReportLine);
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
                report.sort(reportHelpers.sortReport);
                report.map(reportHelpers.printReportLine);
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
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
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
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
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
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
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
            report.sort(reportHelpers.sortReport);
            report.map(reportHelpers.printReportLine);
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
                    report.sort(reportHelpers.sortReport);
                    report.map(reportHelpers.printReportLine);
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
                    report.sort(reportHelpers.sortReport);
                    report.map(reportHelpers.printReportLine);
                });
            });
        });
    }
        ,(e)=>{console.error(e);});

}