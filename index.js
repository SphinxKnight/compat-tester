#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const cssAnalyzer = require("./src/css/compat-analyzer");
const jsAnalyzer = require("./src/js/compat-analyzer");
const htmlAnalyzer = require("./src/html/compat-analyzer");
const reportHelpers = require("./lib/report");

// Exports API
exports.htmlStringAnalyzer = function htmlStringAnalyzer (string, browserScope, cbReport, options){
    htmlAnalyzer.analyzeString(string, browserScope, 0, "HTMLString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        cbReport(report);
    }, options);
};

exports.cssStringAnalyzer = function cssStringAnalyzer (string, browserScope, cbReport, options){
    cssAnalyzer.analyzeString(string, browserScope, 0, "CSSString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        cbReport(report);
    }, options);
};

exports.jsStringAnalyzer = function jsStringAnalyzer (string, browserScope, cbReport, options){
    jsAnalyzer.analyzeString(string, browserScope, 0, "JSString", (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        cbReport(report);
    }, options);
};

exports.htmlFileAnalyzer = function htmlFileAnalyzer (filePath, browserScope, cbReport, options){
    htmlAnalyzer.analyzeFile(filePath, browserScope, (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        cbReport(report);
    }, options);
};

exports.cssFileAnalyzer = function cssFileAnalyzer (filePath, browserScope, cbReport, options){
    const content = fs.readFileSync(filePath,"utf-8");
    cssAnalyzer.analyzeString(content, browserScope, 0, path.basename(filePath), (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        cbReport(report);
    }, options);
};

exports.jsFileAnalyzer = function jsFileAnalyzer (filePath, browserScope, cbReport, options){
    const content = fs.readFileSync(filePath,"utf-8");
    jsAnalyzer.analyzeString(content, browserScope, 0, path.basename(filePath), (e, d) => {
        if (e) {
            console.error(e);
            return false;
        }
        const report = d;
        cbReport(report);
    }, options);
};
