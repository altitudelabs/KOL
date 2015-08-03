/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var express = require('express');

// Setup server
var app = express();
var server = require('http').createServer(app);
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var path = require('path');

// app.set('view engine', 'html');
app.set('views', __dirname + '/app');
app.engine('html', require('ejs').renderFile);
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/app')));

var fs = require('fs');

var csvWriter = require('csv-write-stream');
// writer.end();


app.post('/profile', function(req, res) {
  var body = req.body;
  if (body.city) { body.city = convertCity(body.country, body.city); }
  if (body.country) { body.country = convertCountry(body.country); }

  body.timeSubmitted = new Date();
  
  console.log(body);

  var Converter = require('csvtojson').Converter;
  var file = __dirname + '/data.csv';
  checkForFile(file, function() {
    var fileStream = fs.createReadStream('data.csv');
    var converter = new Converter({constructResult:true});
    //end_parsed will be emitted once parsing finished 
    converter.on('end_parsed', function (jsonObj) {

      var writer = csvWriter();
      writer.pipe(fs.createWriteStream('data.csv'));
      console.log(jsonObj, body);
      jsonObj.push(body);
      // fs.writeFileSync('data.xlsx', xls, 'binary');
      for (var i = 0; i < jsonObj.length; i ++) {
        writer.write(jsonObj[i]);
      }
      writer.end();

      // res.sendFile(__dirname + '/app/sign-up-now-finish.html');
      // res.redirect('/sign-up-now-finish.html');
      res.send({redirect: '/sign-up-now-finish.html'});
    });
    //read from file 
    fileStream.pipe(converter);
    
  });
  //new converter instance 

});

var path = require('path');
var mime = require('mime');
// var firstData =

app.get('/profile', function(req, res) {
  console.log(req.query);
  if (req.query.authCode === 'BK7je29TZm') {

    var file = __dirname + '/data.csv';
    checkForFile(file, function() {
      var filename = path.basename(file);
      var mimetype = mime.lookup(file);

      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', mimetype);

      var filestream = fs.createReadStream(file);
      filestream.pipe(res);
      
    });


  } else {
    res.sendStatus(401);
  }



});
var file = __dirname + '/data.csv';
checkForFile(file, function(){ console.log('created file'); });

// Start server
server.listen(9000, function () {
  console.log('Express server listening on %d, in %s mode', 9000, app.get('env'));
});

// Expose app
exports = module.exports = app;



var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

function convertCountry(code) {
  return data.countries[code];
}
function convertCity(country, city) {
  var cityName;
  for (var key in data.states[country]) {
    if (data.states[country][key].code === city) {
      cityName = data.states[country][key].name;
    }
  }
  if (cityName === undefined) { cityName = city; }
  return cityName;
}


function checkForFile(fileName, callback) {
  fs.exists(fileName, function (exists) {
    if (exists) {
        callback();
    } else {
      fs.writeFile(fileName, '', function (err, data){ 
        var writer = csvWriter();
        writer.pipe(fs.createWriteStream('data.csv'));
        writer.write({
          'first-name': '',
          'last-name': '',
          age: '',
          gender: '',
          country: '',
          city: '',
          neighborhood: '',
          profession: '',
          'household-income': '',
          'facebook-checkbox': '',
          'twitter-checkbox': '',
          'pinterest-checkbox': '',
          'instagram-checkbox': '',
          'youtube-checkbox': '',
          'wechat-checkbox': '',
          'weibo-checkbox': '',
          pinterest: '',
          instagram: '',
          wechat: '',
          facebook: '',
          twitter: '',
          youtube: '',
          weibo: '',
          brands: '',
          venues: '',
          activities: '',
          email: '',
          timeSubmitted: '',
        });
        writer.end();

        callback();
      });
    }

  });
}

var writer = csvWriter();
    writer.pipe(fs.createWriteStream('data.csv'));

