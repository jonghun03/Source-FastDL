const servername = "FastDL" // 서버 이름을 지정해주세요
const express = require('express'), https = require('https'), http = require('http'), fs = require('fs'); // 각종 모듈 로드
const urlz = require('url');
const bodyparse = require('body-parser');
const querystring = require('querystring');
var requestz = require('request'),
    cheerio = require('cheerio'),
    cookie = require('cookie');
const httpsport = 7777; // 서버 포트를 지정합니다.
var main = express();
main.use('/static', express.static(__dirname + '/public')); // public 폴더에 호스팅할 웹사이트 소스를 넣어주세요
var formidable = require('formidable');

function decodeBase64Image(dataString) {
  try {
    return new Buffer(dataString, 'base64');;
  } catch(e) {
    console.log(e);

    return dataString;
  }
}

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
  // console.log(request); < 모든 request 헤더를 보여 줍니다.
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
    } else if (urlz.parse(url).query !== null && urlz.parse(url).pathname == "/uploadimg") {
      
    } else if (urlz.parse(url).query !== null && urlz.parse(url).pathname == "/dccon") {
      const DCCon = querystring.parse(urlz.parse(url).query); // 0: sets, 1: id;

      if (fs.existsSync("./icons/dccon/" + DCCon.sets + "_" + DCCon.id+".json")) {
        fs.readFile("./icons/dccon/" + DCCon.sets + "_" + DCCon.id + ".json", 'utf8', function (err, data) {
          try {
            fs.createReadStream("./icons/dccon/" + DCCon.sets + "_" + DCCon.id + "."+data).pipe(response);
          } catch(e) {
            console.log(e);
          }
        });
      } else {
        requestz("http://dccon.dcinside.com/hot/1", {}, (err, HTTPresponse, body) => {
          if (err) response.sendStatus(err.code);
          var cookieJar = requestz.jar();
          cookieJar.setCookie(requestz.cookie(HTTPresponse.headers['set-cookie'][0]), 'http://dcinside.com/');
          cookieJar.setCookie(requestz.cookie(HTTPresponse.headers['set-cookie'][1]), 'http://dccon.dcinside.com/');

          // 윾식머튽님의 소중한 폼 데이터
          var form = {
            ci_t: cookie.parse(HTTPresponse.headers['set-cookie'][1]).ci_c,
            package_idx: DCCon.sets,
            code: ''
          }

          // 윾식머튽님의 소중한 헤더 데이터
          var header = {
            'Connection': "keep-alive",
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "*/*",
            "Referer": "http://dccon.dcinside.com/hot/1"
          }

          requestz.post("http://dccon.dcinside.com/index/package_detail", { form: form, headers: header, jar: cookieJar }, (err, Packageresponse, body) => {
            //data : { 'ci_t' : ci_t, package_idx: package_idx, 'code' : code }
            var parsed;
            try {
              parsed = JSON.parse(body);
            } catch (e) {
              return response.sendStatus(500);
            }

            var DCConLists = parsed['detail'];
            for (i = 0; i < DCConLists.length; i++) {
              if (DCConLists[i].title == DCCon.id) {
                requestz("http://dcimg5.dcinside.com/dccon.php?no=" + DCConLists[i].path, { headers: header, encoding: null, jar: cookieJar }, ( err, pakcresp, bodyIMG) => {
                  var filename = pakcresp.headers['content-disposition'].split("=")[1];  
                  try {
                    fs.writeFileSync("./icons/dccon/" + DCCon.sets + "_" + DCCon.id + ".json", filename.split(".")[1]);
                    fs.writeFileSync("./icons/dccon/" + DCCon.sets + "_" + DCCon.id + "." + filename.split(".")[1], new Buffer(bodyIMG));
                  } catch(e) {
                    console.log(e);
                  }
                  console.log(filename.split(".")[1]);
                }).pipe(response);
                return;
              }
            }
            return response.sendStatus(404);
          })
        });
      }
    } else {
      if (fs.existsSync('../garrysmod' + url)) {
        var readFile = fs.readFile('../garrysmod' + url, (err, data) => {
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
