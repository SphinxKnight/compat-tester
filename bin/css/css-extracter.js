const fs = require("fs");
const htmlParser = require("htmlparser2");
const readline = require("readline");

exports.analyzeFile = function analyzeFile(fileName,callback){
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity
    });
    let acc = [];
    let inStyle = false;
    let styleBlock = "";
    const parser = new htmlParser.Parser({
        onopentag: function(name, attribs){
            if(name === "style"){
                inStyle = true;
            }
            if(name === "link" && attribs.rel === "stylesheet"){
                acc.push(fs.readFileSync(attribs.href,"utf-8"));
            }
        },
        ontext: function(text){
            if(inStyle){
                styleBlock += text;
            }
        },
        onclosetag: function(name){
            if(name === "style"){
                acc.push(styleBlock);
                inStyle = false;
                styleBlock = "";

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