const fs = require("fs");
const htmlParser = require("htmlparser2");
const readline = require("readline");
const path = require("path");
const fetchURL = require("../../lib/fetchURL");

exports.analyzeFile = function (fileName,callback){
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let numLine = 1;
    let numLineBlock = 1;
    // An accumulator for each fragment to parse later
    // Each fragment has: a fileName, a lineShift, a content
    const acc = [];
    let inStyle = false;
    let styleBlock = "";
    const parser = new htmlParser.Parser({
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

    rl.on("line", (line) => {
        parser.write(line);
        numLine++;
    });

    rl.on("close",() =>{
        parser.end();

    });
};