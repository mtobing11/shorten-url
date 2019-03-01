'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
var app = express();

var port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGOLAB_URI);

var urlSchema  = new mongoose.Schema({
  originalUrl : String,
  shortenUrl : String
});
var ModelUrl2 = mongoose.model('ModelUrl2',urlSchema);

app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/:helloUrl(*)", function (req, res) {
  var oriUrl = req.params.helloUrl;
  var shortUrl;
  var regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/i;
  
  if(regex.test(oriUrl)){
    var findData = ModelUrl2.findOne({"originalUrl":oriUrl}, (err,data)=>{
      if(data==null){
        shortUrl = Math.floor(Math.random()*100000);
        var newUrl = new ModelUrl2({
          originalUrl : oriUrl,
          shortenUrl : shortUrl
        });
        newUrl.save((err,data)=>err?res.send("error reading database"):null);
        
      } else {
        shortUrl = data.shortenUrl;
        console.log(shortUrl)
      }
      console.log(data);
      res.json({"originalUrl":oriUrl, "shortenUrl":shortUrl});
    });
    console.log("Okeee");
  
    
  
  } else {
    res.send("wrong format")
  }
});

app.get("/:urlToForward", (req,res)=>{
  var dataUrl = req.params.urlToForward;
  ModelUrl2.findOne({"shortenUrl":dataUrl},(err,data)=>{
    if(err) return res.send("Error reading database");
    var regex = new RegExp("^(http|https)://","i");
	if(regex.test(data.originalUrl)){
    res.redirect(301,data.originalUrl)
	} else {
		res.redirect(301,"http://"+data.originalUrl)
	}
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});