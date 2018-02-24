const cssTree = require("css-tree");
const bcd = require("mdn-browser-compat-data");
const semver = require("semver");

exports.analyzeString = function analyzeString (text, browserScope, lineShift = 0, fileName, callback){
    const report = [];
    const ast = cssTree.parse(text,{positions:true});
    cssTree.walk(ast,(node) => {
        if(node.type === "Declaration"){
            if(node.property in bcd.css.properties){
                Object.keys(browserScope).map((browser)=>{
                    const supportBrowser = bcd.css.properties[node.property].__compat.support[browser];
                    let versionAddedProp;
                    if(Array.isArray(supportBrowser)){
                        // E.g. CSS property with prefixes
                        versionAddedProp = supportBrowser[0].version_added;
                    } else {
                        versionAddedProp = supportBrowser.version_added;
                    }
                    if((!versionAddedProp) || (versionAddedProp !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedProp)) )){
                        report.push({
                            "featureName": "Property: " + node.property,
                            "browser":browser,
                            "fileName":fileName,
                            "column": node.loc.start.column,
                            "featureVersion": versionAddedProp,
                            "line": node.loc.start.line + lineShift
                        });
                    }
                });
            }
        }
        if(node.type === "Atrule"){
            if(node.name in bcd.css["at-rules"]){
                Object.keys(browserScope).map((browser)=>{
                    const supportBrowser = bcd.css["at-rules"][node.name].__compat.support[browser];
                    let versionAddedAtRules;
                    if(Array.isArray(supportBrowser)){
                        versionAddedAtRules = supportBrowser[0].version_added;
                    } else {
                        versionAddedAtRules = supportBrowser.version_added;
                    }
                    if((!versionAddedAtRules) || (versionAddedAtRules !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedAtRules)) )){
                        report.push({
                            "featureName": "@-rule: @" + node.name,
                            "browser":browser,
                            "fileName":fileName,
                            "column": node.loc.start.column,
                            "featureVersion": versionAddedAtRules,
                            "line": node.loc.start.line + lineShift
                        });
                    }

                });
            }
        }
        if(node.type === "MediaFeature"){
            const mfName = node.name.replace(/^(min)|(max)-/,"");
            if((mfName + "_media_feature") in bcd.css["at-rules"]["media"]){
                Object.keys(browserScope).map((browser)=>{
                    const supportBrowser = bcd.css["at-rules"]["media"][mfName + "_media_feature"].__compat.support[browser];
                    let versionAddedMediaFeature;
                    if(Array.isArray(supportBrowser)){
                        versionAddedMediaFeature = supportBrowser[0].version_added;
                    } else {
                        versionAddedMediaFeature = supportBrowser.version_added;
                    }
                    if((!versionAddedMediaFeature) || (versionAddedMediaFeature !== true && semver.lt(semver.coerce(browserScope[browser]), semver.coerce(versionAddedMediaFeature)) )){
                        report.push({
                            "featureName": "Media feature: @" + mfName,
                            "browser":browser,
                            "fileName":fileName,
                            "column": node.loc.start.column,
                            "featureVersion": versionAddedMediaFeature,
                            "line": node.loc.start.line + lineShift
                        });
                    }
                });
            }
        }
    });
    callback(null,report);
};