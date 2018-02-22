const fs = require("fs");
const htmlParser = require("htmlparser2");
const readline = require("readline");
const path = require("path");

exports.analyzeFile = function analyzeFile (fileName, callback){
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let numLine = 1;
    let numLineBlock = 1;
    // An accumulator for each fragment to parse later
    // Each fragment has: a fileName, a lineShift, a content
    const acc = [];
    let inScript = false;
    let scriptBlock = "";
    const parser = new htmlParser.Parser({
        onopentag: function (name, attribs){
            if(name === "script" && (attribs.type === "text/javascript" || attribs.type === "application/javascript" )){
                inScript = true;
                numLineBlock = numLine;
                if("src" in attribs){
                    const fragment = {
                        "fileName":path.relative(path.dirname(fileName),path.resolve(path.dirname(fileName),attribs.src)),
                        "lineShift": 0,
                        "content":fs.readFileSync(attribs.src,"utf-8")
                    };
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

    rl.on("line", (line) => {
        parser.write(line);
        numLine++;
    });

    rl.on("close",() =>{
        parser.end();
    });
};