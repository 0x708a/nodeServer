const fs = require("fs");
const url = require("url");
const http = require("http");
const https = require("https");
const StringDecoder = require("string_decoder").StringDecoder;
const util = require("util");
const formidable = require("formidable");
const dataBase = require("./db");

const nasaApi = "https://api.nasa.gov/planetary/apod?api_key=e2oEEvi3MTfpZrGaU99KcBxsxtdLSkeotmAyl3rj"
const port = 3000;
var urlHd = "";
var imgTitle = "";

function errorCheck(error, data, req, res, xtra = null) {
    if (error) {
        res.writeHead(404)
        res.write("" + error);
    } else {
        res.write(data);
    }
    res.end(xtra)
}

https
    .get(nasaApi, resp => {
        let data = "";

        resp.on("data", chunk => {
            data += chunk;
        })

        resp.on("end", () => {
            urlHd = JSON.parse(data).url
            imgTitle = JSON.parse(data).title
        })
    })
    .on("error", err => {
        console.log("Error" + err)
    })


const server = http.createServer(function(req, res) {
    let path = url.parse(req.url, true)
    if (path.pathname == "/endPoint") {
        if (req.method.toLowerCase() == "post") {
            let form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.log("Error: " + err);
                    return;
                }

                if (dataBase.users[0].key == path.search.split("?")[1].split("&")[0].split("key=")[1] && dataBase.users[0].host == path.search.split("?")[1].split("&")[1].split("host=")[1]) {
                    dataBase.names[dataBase.names.length] = path.search.split("?")[1].split("&")[2].split("add=")[1]
                    console.log(dataBase.names)
                    res.writeHead(200, "OK", { "Content-Type": "text/plain" })
                    res.write("successfully added")
                    res.end()
                } else {
                    res.writeHead(200, "OK", { "Content-Type": "text/plain" })
                    res.write("invalid key or host")
                    res.end()
                }

            })
        } else if (req.method.toLowerCase() == "get") {
            if (dataBase.users[0].key == path.search.split("?")[1].split("&")[0].split("key=")[1] && dataBase.users[0].host == path.search.split("?")[1].split("&")[1].split("host=")[1]) {
                res.writeHead(200, "OK", { "Content-Type": "text/html" });
                res.write("" + dataBase.names)
                res.end()
            } else {
                res.writeHead(200, "OK", { "Content-Type": "text/plain" })
                res.end("invalid key or host")
            }

        } else {
            //deal with other methods
        }
    } else if (path.pathname == "/") {
        console.log(path.query)
        fs.readFile("templates/index.html", function(error, data) {

            errorCheck(error, data, req, res)
        })
    } else if (path.pathname == "/pogchamp") {
        console.log(path.pathname)
        res.writeHead(200, { "Content-Type": "text/html" });

        fs.readFile("templates/pogchamp.html", function(error, data) {

            errorCheck(error, data, req, res);

        })
    } else if (path.pathname == "/port") {
        console.log(path.pathname)
        res.writeHead(200, { "Content-Type": "text/html" });

        fs.readFile("templates/port.html", function(error, data) {

            errorCheck(error, data, req, res);

        })

    } else if (path.pathname == "/img") {
        console.log(path.pathname)
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(imgTitle + "\n\n")
        res.end("<img src=\"" + urlHd + "\">")

    } else if (path.pathname == "/getapikey") {
        res.writeHead(200, "OK", { "Content-Type": "text/html" })

        fs.readFile("templates/api.html", function(error, data) {

            errorCheck(error, data, req, res);

        })

    } else {
        console.log(path.pathname)
        res.writeHead(200, { "Content-Type": "text/html" });

        fs.readFile("templates/404.html", function(error, data) {

            errorCheck(error, data, req, res)

        })

    }
})

server.listen(port, function(error) {
    if (error) {
        console.log("Error: " + error);
    } else {
        console.log("SERVER: listening on port " + port);
    }
})