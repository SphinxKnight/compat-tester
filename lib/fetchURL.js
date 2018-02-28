const http = require("http");
const https = require("https");

exports.fetchURL = (url) => {
    return new Promise((resolve, reject) => {
        let client = http;
        if (url.toString().startsWith("https")) {
            client = https;
        }
        client.get(url, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                resolve(data);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
};
