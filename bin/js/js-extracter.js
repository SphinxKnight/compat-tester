const fs = require("fs");
const htmlParser = require("htmlparser2");
const readline = require("readline");

exports.analyzeFile = function analyzeFile(fileName, callback){
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let acc = [];
    let inScript = false;
    let scriptBlock = "";
    const parser = new htmlParser.Parser({
        onopentag: function(name, attribs){
            if(name === "script" && attribs.type === "text/javascript"){
                inScript = true;
                if("src" in attribs){
                    acc.push(fs.readFileSync(attribs.src,"utf-8"));
                }
            }
        },
        ontext: function(text){
            if(inScript){
                scriptBlock += text;
            }
        },
        onclosetag: function(name){
            if(name === "style"){
                if(scriptBlock !== ""){
                    acc.push(scriptBlock);
                }
                inScript = false;
                scriptBlock = "";
            }
        },
        onend: function(){
            callback(null, acc);
        }
    },{decodeEntities: true});

    rl.on("line", (line) => {
        parser.write(line);
    });
  
    rl.on("close",() =>{
        parser.end();

    });
};