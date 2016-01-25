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
var favicon = require('serve-favicon');

var path = require('path');

// app.set('view engine', 'html');
app.set('views', __dirname + '/app');
app.engine('html', require('ejs').renderFile);
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, '/app')));
app.use(favicon(__dirname + '/app/favicon.ico'));

var fs = require('fs');

var csvWriter = require('csv-write-stream');
// writer.end();

var MailChimpAPI = require('mailchimp').MailChimpAPI;
var mcApi = new MailChimpAPI(process.env.MAIL_CHIMP_KEY || 'some-key', { version: '2.0' });
var Converter = require('csvtojson').Converter;

app.post('/profile', function(req, res) {
  var body = req.body;
  //console.log(body.country+' '+body.city);
  var city = '',
      country = '';
  if (body.city) { city = convertCity(body['country'][0], body['city'][0]); }
  if (body.country) { country = convertCountry(body['country'][0]); }

  body.timeSubmitted = new Date();
  //console.log(body);

  var file = __dirname + '/data.csv';

  checkForFile(file, function() {
    var fileStream = fs.createReadStream('data.csv');

    var converter = new Converter({constructResult:true});
    //end_parsed will be emitted once parsing finished
    converter.on('end_parsed', function (jsonObj) {
      var writer = csvWriter();
      writer.pipe(fs.createWriteStream('data.csv'));
      jsonObj.push(body);
      for (var i = 0; i < jsonObj.length; i ++) {
        writer.write(jsonObj[i]);
      }
      writer.end();

      var params = {
        id: '0b6e45a581',
        email: {
          email: body.email
        },
        merge_vars: {
          FNAME: body['first-name'],
          LNAME: body['last-name'],
          AGE: body.age,
          GENDER: body.gender,
          COUNTRY: country,
          CITY: city,
          NEIGHBOR: body.neighborhood,
          PROFESSION: body.profession,
          HOUSEHOLD: body['household-income'],
          FACEBOOK: body.facebook,
          RFACEBOOK: body['facebook-ref'],
          TWITTER: body.twitter,
          RTWITTER: body['twitter-ref'],
          PINTEREST: body.pinterest,
          RPINTEREST: body['pinterest-ref'],
          INSTAGRAM: body.instagram,
          RINSTAGRAM: body['instagram-ref'],
          YOUTUBE: body.youtube,
          RYOUTUBE: body['youtube-ref'],
          WECHAT: body.wechat,
          RWECHAT: body['wechat-ref'],
          WEIBO: body.weibo,
          RWEIBO: body['weibo-ref'],
          BLOG: body.blog,
          RBLOG: body['blog-ref'],
          BRANDS: body.brands,
          VENUES: body.venues,
          ACTIVITIES: body.activities,
          SKILLS: body.skills
        }
      };
      mcApi.lists_subscribe(params, function(err, response) {
        if (err) {
          params.merge_vars = null;
          delete params['merge_vars'];
          mcApi.lists_subscribe(params, function(err, response) {
            //res.send({redirect: '/sign-up-now-finish.html'});
            return;
          });
        }

        res.send({redirect: '/sign-up-now-finish.html'});

      });
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
  if (req.query.authCode === process.env.AUTH_CODE) {

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
checkForFile(file, function(){});

// Start server
server.listen(8000, function () {
  console.log('Express server listening on %d, in %s mode', 8000, app.get('env'));
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
      console.log('exists!');
      callback(exists);
      return;
    } else {
      console.log('writing file!');
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
          'blog-checkbox': '',
          pinterest: '',
          'pinterest-ref': '',
          instagram: '',
          'instagram-ref': '',
          wechat: '',
          'wechat-ref': '',
          facebook: '',
          'facebook-ref': '',
          twitter: '',
          'twitter-ref': '',
          youtube: '',
          'youtube-ref': '',
          weibo: '',
          'weibo-ref': '',
          blog: '',
          'blog-ref': '',
          brands: '',
          venues: '',
          activities: '',
          email: '',
          timeSubmitted: '',
          activities: '',
          skill: ''
        });
        writer.end();

        callback(exists);
      });
    }

  });
}
