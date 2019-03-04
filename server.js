// Set basic constants
const servername = "FastDL" // Set servername.
const httpsport = 7777; // Set port.
const statichostdir = 'public' // Set static host directory.

const express = require('express'), https = require('https'), http = require('http'), fs = require('fs'); // 각종 모듈 로드
const urlz = require('url');
const bodyparse = require('body-parser');
const querystring = require('querystring');
var requestz = require('request'),
    cheerio = require('cheerio'),
    cookie = require('cookie');
var main = express();
main.use('/static', express.static(__dirname + '/' + statichostdir)); 
var formidable = require('formidable');

function decodeBase64Image(dataString) {
  try {
    return new Buffer(dataString, 'base64');;
  } catch(e) {
    console.log(e);

    return dataString;
  }
}

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


main.post('/*', (request, response) => {
  var form = new formidable.IncomingForm();
  form.parse(request, function (err, fields, files) {
    console.log("ERR: " + err);
    console.log(fields);
    
    try{
      fs.writeFile("./uploadedImage/" + fields.nick + "_" + fields.pl + "_" + Math.floor(Math.random() * 100000) + "_up.jpg", decodeBase64Image(fields.data), () => {
        response.write('Server net message');
        response.end();
      });
    } catch(e) {
      console.log(e)
    }
    
  });
});

function RequestExcute( url, ip, request, response ) {
  console.log("[Server] Client "+ip+" sent "+request.method+" request with url "+url);
  let responsecontent = "";
  let ErrState = 0;

  if (url == "/") {
    response.type("html");
    fs.createReadStream('./Files/MAIN').pipe(response);
  } else if (url.includes("lua") || url.includes("cfg") || url.includes("ERROR_") ) {
    response.sendStatus(406);
  } else {
    if (urlz.parse(url).query !== null && urlz.parse(url).pathname == "/icons") {
      if (fs.existsSync('./icons/' + urlz.parse(url).query.substring(3))) {
        fs.createReadStream('./icons/' + urlz.parse(url).query.substring(3)).pipe(response);
      } else {
        response.sendStatus(404);
      } 
    } else {
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
