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
                    let versionAddedProp ;
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
    });
    callback(null,report);
};