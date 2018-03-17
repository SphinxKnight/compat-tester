#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const cssAnalyzer = require("./src/css/compat-analyzer");
const jsAnalyzer = require("./src/js/compat-analyzer");
const htmlAnalyzer = require("./src/html/compat-analyzer");
const reportHelpers = require("./lib/report");

// Exports API
exports.htmlStringAnalyzer = function htmlStringAnalyzer (string, browserScope){
    htmlAnalyzer.analyzeString(string, browserScope, 0, "HTMLString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    });
};

exports.cssStringAnalyzer = function cssStringAnalyzer (string, browserScope){
    cssAnalyzer.analyzeString(string, browserScope, 0, "CSSString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("CSS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    });
};

exports.jsStringAnalyzer = function jsStringAnalyzer (string, browserScope){
    jsAnalyzer.analyzeString(string, browserScope, 0, "JSString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("JS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
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
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    });
};

exports.cssFileAnalyzer = function cssFileAnalyzer (filePath, browserScope){
    const content = fs.readFileSync(filePath,"utf-8");
    cssAnalyzer.analyzeString(content, browserScope, 0, path.basename(filePath), (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("CSS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    });
};

exports.jsFileAnalyzer = function jsFileAnalyzer (filePath, browserScope){
    const content = fs.readFileSync(filePath,"utf-8");
    jsAnalyzer.analyzeString(content, browserScope, 0, path.basename(filePath), (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("JavaScript analysis isn't yet implemented - JS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    });
};
