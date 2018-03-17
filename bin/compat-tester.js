#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const commander = require("commander");
const cssAnalyzer = require("./../src/css/compat-analyzer");
const cssExtracter = require("./../src/css/css-extracter");
const jsAnalyzer = require("./../src/js/compat-analyzer");
const jsExtracter = require("./../src/js/js-extracter");
const htmlAnalyzer = require("./../src/html/compat-analyzer");
const reportHelpers = require("./../lib/report");
const {fetchURL} = require("./../lib/fetchURL");

// Deal with command line arguments
commander
    .description("A command line tool to test HTML and CSS compatibility between a browser scope and a website")
    .option("-url, --url [https://mysite.html]", "Scans the remote web page and fetches/scans associated resources (JS scripts / CSS stylesheets)")
    .option("-file, --file [index.html]", "Scans the local file and fetches/scans associated resources", "index.html")
    .option("-contrib, --contribute [null|true|all]","Contribution mode to help fill data that isn't known into MDN browser-compat dataset. `null` addresses known features with unknown compatibility values and `true` addresses know features which are known to be compatible but without any detail","null")
    .option("-scope, --scope [scope.json]","The browser scope in a JSON format", "scope.json")
    .option("-html, --html [myFile.html]", "Only scans the HTML of myFile.html")
    .option("-css, --css [myFile.css]", "Only scans the CSS of myFile.css")
    .parse(process.argv);
// Exit gracefully, displaying help when no argument is given
if(!process.argv.slice(2).length){
    commander.outputHelp(str=>str);
    process.exit();
}

// Coerce arguments to options
// e.g. if >compat-tester mySite.html myScope.json
// replace defaults
if(commander.args.length > 0){
    const testURL = commander.args.find(el => el.startsWith("http"));
    const testCSS = commander.args.find(el => el.endsWith(".css"));
    if(testURL){
        commander.url = testURL;
    } else if(testCSS){
        commander.css = testCSS;
    } else {
        commander.scope = commander.args.find(el => el.endsWith(".json")) || "scope.json";
        commander.file = commander.args.find(el => el.endsWith(".html")) || "index.html";
    }
}

// Convert different options into an object
const options = {
    "contrib": commander.contribute
    // Might add other secondary options to this
};

const scope = JSON.parse(fs.readFileSync(commander.scope, "utf-8"));

if(!commander.html && !commander.css && !commander.url){
    // Let's parse the HTML
    htmlAnalyzer.analyzeFile(commander.file, scope, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        // report =[ {"browser " / "filename" / "line" / "column" / "featureName" / "minVer"]
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);


    // Let's get the CSS inside the site
    cssExtracter.analyzeFile(commander.file, (e, acc) => {
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
            }, options);
        });
    });


    // Let's get the JavaScript inside the site
    jsExtracter.analyzeFile(commander.file, (e, acc) => {
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
            }, options);
        });
    });
}

if(commander.html){
    htmlAnalyzer.analyzeFile(commander.html, scope, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);
}

if(commander.css){
    const content = fs.readFileSync(commander.css,"utf-8");
    cssAnalyzer.analyzeString(content, scope, 0, commander.css, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("CSS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);
}

if(commander.js){
    const content = fs.readFileSync(commander.js,"utf-8");
    jsAnalyzer.analyzeString(content, scope, 0, commander.js, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("JavaScript analysis isn't yet implemented - JS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);
}

if(commander.url){
    // Let's parse the HTML
    fetchURL(commander.url).then(str => {
        htmlAnalyzer.analyzeString(str, scope, 0, commander.url, (e, d) => {
            if (e) {
                console.error(e);
                return false;
            }
            const report = d;
            console.log("HTML Report:");
            // report =[ {"browser " / "filename" / "line" / "column" / "featureName" / "minVer"]
            report.sort(reportHelpers.sortReport);
            report.map(reportHelpers.printReportLine);
        }, options);

        // Let's get the CSS inside the site
        cssExtracter.analyzeString(str, commander.url, (e, acc) => {
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
                }, options);
            });
        });
        // Let's get the JavaScript inside the site
        jsExtracter.analyzeString(str, commander.url, (e, acc) => {
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
                }, options);
            });
        });
    }
        ,(e)=>{console.error(e);});

}