const bcd = require("mdn-browser-compat-data");
const semver = require("semver");

exports.analyzeString = function analyzeString(text, browserScope, lineShift = 0, fileName, callback){
    let report = [];
    callback(null,report);
};