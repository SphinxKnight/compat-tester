const fs = require("fs");
const htmlParser = require("htmlparser2");
const readline = require("readline");
const path = require("path");
const { URL } = require("url");
const fetchURL = require("../../lib/fetchURL");

exports.analyzeString = function (string, fileName, callback){
    const lines = string.split("\n");
    let numLine = 1;
    const parser = getParser(numLine, fileName, callback);
    for(const line of lines){
        parser.write(line);
        numLine++;
    }
    parser.end();
};

exports.analyzeFile = function analyzeFile (fileName, callback){
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let numLine = 1;
    const parser = getParser(numLine, fileName, callback);
    rl.on("line", (line) => {
        parser.write(line);
        numLine++;
    });

    rl.on("close",() =>{
        parser.end();
    });
};

function getParser (numLine, fileName, callback){
    let numLineBlock = 1;
    // An accumulator for each fragment to parse later
    // Each fragment has: a fileName, a lineShift, a content
    const acc = [];
    let inScript = false;
    let scriptBlock = "";
    return new htmlParser.Parser({
        onopentag: function (name, attribs){
            if(name === "script" && (attribs.type === "text/javascript" || attribs.type === "application/javascript" )){
                inScript = true;
                numLineBlock = numLine;
                if("src" in attribs){
                    const fragment = {};
                    fragment.lineShift = 0;
                    if(attribs.src.startsWith("http")){
                        fragment.fileName = attribs.src;
                        const content = fetchURL.fetchURL(attribs.src);
                        fragment.content = content;
                    } else if (fileName.startsWith("http")) {
                        // resolve href with starting point URL
                        const targetURL = (new URL(attribs.href,fileName)).toString();
                        fragment.fileName = targetURL;
                        const content = fetchURL.fetchURL(targetURL);
                        fragment.content = content;
                    } else {
                        fragment.fileName = path.relative(path.dirname(fileName),path.resolve(path.dirname(fileName),attribs.src));
                        fragment.content = fs.readFileSync(attribs.src,"utf-8");
                    }
                    acc.push(fragment);
                }
            }
        },
        ontext: function (text){
            if(inScript){
                scriptBlock += text;
            }
        },
        onclosetag: function (name){
            if(name === "script" && scriptBlock !== ""){
                const fragment = {
                    "fileName": fileName,
                    "lineShift": numLineBlock,
                    "content": scriptBlock
                };
                acc.push(fragment);
                inScript = false;
            }
            scriptBlock = "";
        },
        onend: function (){
            callback(null, acc);
        }
    },{decodeEntities: true});
}