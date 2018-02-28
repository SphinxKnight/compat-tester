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

exports.analyzeFile = function (fileName,callback){
    let numLine = 1;
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });

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
    let inStyle = false;
    let styleBlock = "";
    return new htmlParser.Parser({
        onopentag: function (name, attribs){
            if(name === "style"){
                numLineBlock = numLine;
                inStyle = true;
            }
            if(name === "link" && attribs.rel === "stylesheet"){
                const fragment = {};
                fragment.lineShift = 0;
                if(attribs.href.startsWith("http")){
                    fragment.fileName = attribs.href;
                    const content = fetchURL.fetchURL(attribs.href);
                    fragment.content = content;
                } else if (fileName.startsWith("http")) {
                    // resolve href with starting point URL
                    const targetURL = (new URL(attribs.href,fileName)).toString();
                    fragment.fileName = targetURL;
                    const content = fetchURL.fetchURL(targetURL);
                    fragment.content = content;
                } else {
                    fragment.fileName = path.relative(path.dirname(fileName),path.resolve(path.dirname(fileName),attribs.href));
                    fragment.content = fs.readFileSync(attribs.href,"utf-8");
                }
                acc.push(fragment);
            }
        },
        ontext: function (text){
            if(inStyle){
                styleBlock += text;
            }
        },
        onclosetag: function (name){
            if(name === "style" && styleBlock !== ""){
                const fragment = {
                    "fileName": fileName,
                    "lineShift": numLineBlock,
                    "content": styleBlock
                };
                acc.push(fragment);
                inStyle = false;
            }
            styleBlock = "";
        },
        onend: function (){
            callback(null, acc);
        }
    },{decodeEntities: true});
}