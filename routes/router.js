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
      res.redirect("/scrape");
    } else{
      res.render("index", {articles: data});
    }
  });
});


router.get("/scrape", function(req, res) {

  request("https://www.nytimes.com/section/world", function(error, response, html) {

    const $ = cheerio.load(html);
    let titlesArray = [];
    //  Process one story
    $("div.story-body").each(function(i, element) {
      let result = {};
      result.link = $(element).find("a").attr("href");
      result.title = $(element).find("h2.headline").text().trim();
      result.summary = $(element).find("p.summary").text().trim();
      let img = $(element).parent().find("figure.media").find("img").attr("src");
      if (img) {
        result.img = img;
      }
      let newArt = new Article(result);
      if (titlesArray.indexOf(result.title) === -1) {
        //not a dupe of another article in the current scrape
        titlesArray.push(result.title); // so save this title into titlesArray in case the article appears again in this scrape
        // Now, make sure that this article hasn't previously been saved into the DB
        Article.count({ title: result.title}, function (err,dupeCheck){
          if (dupeCheck === 0) {
            // the article is not already in the DB
            let entry = new Article(result); // so use Article model to create a new article document
            entry.save(function(err,doc){
              if (err) {
                console.log(err);
              } else {
                
              }
            });
          } else {
            
          } 
        });//end of the database duplicate check logic
      } else {
       
      }
    }); // End of "Process one story" logic
  }, res.redirect("/articles")); // End of the request New York Times World News Page logic
}); // End of the "get /" route



// A Route to Display all the articles in the database
router.get ('/articles', function (req, res){
 
  // Query MongoDB for all article entries... the sort on -1 outputs the newest first
  Article.find().sort({_id: -1})

    // But also populate all of the comments associated with the articles.
    .populate('comments')

    // Then, send them to the handlebars template to be rendered
    .exec(function(err, doc){
      // log any errors
      if (err){
        console.log(err);
      } 
      // or send the doc to the browser 
      else {
        var expbsObject = {articles: doc};
        res.render('index', expbsObject);
      }
    });

});


// Export Router to Server.js
module.exports = router;