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
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");

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
  // First, scrape the articles
  res.redirect("/scrape");
});


// A GET route for scraping the New York Times website
router.get('/scrape', function(req, res) {
  axios.get("http://www.nytimes.com/").then(function(response) {
    // Then, we load that response into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Now, we grab every h2 within an article tag, and do the following:

    // Save an empty result object
    var result = {};
    $("article h2").each(function(i, element) { 
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();

      result.link = $(this)
        .children("a")
        .attr("href");

      var entry = new Article (result);
      // Save the entry to MongoDB
      entry.save(function(err, doc) {
         // log any errors
         if (err) {
           console.log(err);
          } 
      });
    }); //end for each logic
  }); //end axios.get logic

  // If we were able to successfully scrape and save, let's display the articles
  res.redirect("/articles");

}); //end scrape route


// Display all the articles in the database
router.get ('/articles', function (req, res){

  // Query MongoDB for all article entries (sort newest to top, assuming Ids increment)
  Article.find().sort({_id: 1})

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
        var expbsObject = {articles: doc};
        res.render('index', expbsObject);
      }
    });

});


// Export Router to Server.js
module.exports = router;