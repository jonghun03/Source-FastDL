// Set basic constants
const servername = "FastDL" // Set servername.
const httpsport = 7777; // Set port.
const statichostdir = 'public' // Set static host directory.

const express = require('express'), https = require('https'), http = require('http'), fs = require('fs'); // 각종 모듈 로드
const urlz = require('url');
var main = express();
main.use('/static', express.static(__dirname + '/' + statichostdir)); 

function scandir() {
  if (fs.existsSync('../garrysmod')) {
    return '../garrysmod'
  } else if (fs.existsSync('../csgo')) {
    return '../csgo'
  } else if (fs.existsSync('../tf')) {
    return '../tf'
  } else if (fs.existsSync('../cstrike')) {
    return '../cstrike'
  } else {
    return false
  }
};

main.get('/*', ( request, response ) => {
  response.setHeader('server', servername);
  RequestExcute( request.url, request.connection.remoteAddress , request, response );
});

function RequestExcute( url, ip, request, response ) {
  console.log("[Server] Client " + ip + " sent " + request.method + " request with url " + url);
  let responsecontent = "";
  let ErrState = 0;

  if (url == "/") {
    response.type("html");
    fs.createReadStream('./Files/MAIN').pipe(response);
  } else if (url.includes("lua") || url.includes("cfg") || url.includes("ERROR_") ) {
    response.sendStatus(406);
  } else {
    if (urlz.parse(url).query !== null) {
      dir = scandir()
      if ((dir) && (fs.existsSync(dir + url))) {
        var readFile = fs.readFile(dir + url, (err, data) => {
          response.send(data);
        });
        // not support on gmod > fs.createReadStream('../garrysmod' + url).pipe(response);       
      } else {
        response.sendStatus(404);
      }
    }
  }
}

var httpserver = http.createServer(main)
httpserver.listen(httpsport);
