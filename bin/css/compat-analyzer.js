const cssTree = require("css-tree");
const bcd = require("mdn-browser-compat-data");
const semver = require("semver");

exports.analyzeString = function analyzeString(text, browserScope, callback){
    var report = {"css":{}};
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
                        if(!("properties" in report["css"])){
                            report["css"]["properties"]= {};
                        }
                        if(!(node.property in report["css"]["properties"])){
                            report["css"]["properties"][node.property] = [];
                        }
                        report["css"]["properties"][node.property].push({
                            "type":"gap",
                            "browser": browser,
                            "scope_version": browserScope[browser],
                            "feature_version": versionAddedProp,
                            "line": node.loc.start.line
                        });
                    }
                });
            }
        }
    });
    callback(null,report);
};