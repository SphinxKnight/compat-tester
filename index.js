#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const cssAnalyzer = require("./src/css/compat-analyzer");
const jsAnalyzer = require("./src/js/compat-analyzer");
const htmlAnalyzer = require("./src/html/compat-analyzer");
const reportHelpers = require("./lib/report");

// Exports API
exports.htmlStringAnalyzer = function htmlStringAnalyzer (string, browserScope, options){
    htmlAnalyzer.analyzeString(string, browserScope, 0, "HTMLString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);
};

exports.cssStringAnalyzer = function cssStringAnalyzer (string, browserScope, options){
    cssAnalyzer.analyzeString(string, browserScope, 0, "CSSString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("CSS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);
};

exports.jsStringAnalyzer = function jsStringAnalyzer (string, browserScope, options){
    jsAnalyzer.analyzeString(string, browserScope, 0, "JSString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("JS Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);
};

exports.htmlFileAnalyzer = function htmlFileAnalyzer (filePath, browserScope, options){
    htmlAnalyzer.analyzeFile(filePath, browserScope, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        console.log("HTML Report:");
        report.sort(reportHelpers.sortReport);
        report.map(reportHelpers.printReportLine);
    }, options);
};

exports.cssFileAnalyzer = function cssFileAnalyzer (filePath, browserScope, options){
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
    }, options);
};

exports.jsFileAnalyzer = function jsFileAnalyzer (filePath, browserScope, options){
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
    }, options);
};
