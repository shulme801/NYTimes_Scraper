// Dependencies
var express    = require("express");
var bodyParser = require("body-parser");
var logger     = require("morgan");
var mongoose   = require("mongoose");
var router     = express.Router();
var exphbs     = require('express-handlebars');

// Requiring our Note and Article models--
var Note    = require("../models/note.js");
var Article = require("../models/article.js");

// scraping tools
var cheerio = require("cheerio");
var request = require("request");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadLines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

// Show any Mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// Once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// Here are the routes

router.get("/", function(req, res) {
  Article.find({}, null, {sort: {created: -1}}, function(err, data) {
    if(data.length === 0) {
      res.render("no-scrapes-yet", {message: "There's nothing scraped yet. Please click \"NYT Scraper\" for World News."});
    }
    else{
      res.render("index", {articles: data});
    }
  });
});


router.get("/scrape", function(req, res) {
  request("https://www.nytimes.com/section/world", function(error, response, html) {
    console.log("I am in scrape route");
    var $ = cheerio.load(html);
    var result = {};
    $("div.story-body").each(function(i, element) {

      var link = $(element).find("a").attr("href");
      var title = $(element).find("h2.headline").text().trim();
      var summary = $(element).find("p.summary").text().trim();
      var img = $(element).parent().find("figure.media").find("img").attr("src");
      result.link = link;
      result.title = title;
      if (summary) {
        result.summary = summary;
      };
      if (img) {
        result.img = img;
      }
      else {
        result.img = $(element).find(".wide-thumb").find("img").attr("src");
      };
      var entry = new Article(result);
      Article.find({title: entry.title}, function(err, data) {
        if (data.length === 0) {
          entry.save(function(err, data) {
            if (err) throw err;
          });
        }
      });
    });
    console.log("Scrape finished.");
    res.redirect("/articles");
  });
  
});


// Display all the articles in the database
router.get ('/articles', function (req, res){
  console.log("I am in articles route");

  // Query MongoDB for all article entries (sort newest to top, assuming Ids increment)
  Article.find().sort({_id: -1})

    // But also populate all of the comments associated with the articles.
    .populate('comments')

    // Then, send them to the handlebars template to be rendered
    .exec(function(err, doc){
      // log any errors
      if (err){
        console.log(err);
      } 
      // or send the doc to the browser as a json object
      else {
        console.log("Rendering doc");
        var expbsObject = {articles: doc};
        res.render('index', expbsObject);
      }
    });

});


// Export Router to Server.js
module.exports = router;