// Dependencies
var express    = require("express");
var bodyParser = require("body-parser");
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

// The root display route
router.get("/", function(req, res) {
  Article.find({}, null, {sort: {created: -1}}, function(err, data) {
    if(data.length === 0) {
      // First time to the / page, so redirect to /scrape to add some articles into the database
      res.redirect("/scrape");
    } else{
      // Display the articles that are currently in the database
      res.render("index", {articles: data});
    }
  });
});


// The route to scrape the NY Times page
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
            // the article is not already in the DB because the dupeCheck in the callback had a value of 0 -- 
            // no articles matched.
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
    .populate('notes')

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

// Get route to display all the comments for one article (using the note model)
router.get('/display/comment/:id',function (req,res){
  
  // Collect article id
  var articleId = req.params.id; //This is the index value of the associated article
  res.redirect('/articles');

});

// Post route for adding comments to the db using the note model
router.post('/add/comment/:id', function (req, res){

  // Collect article id
  var articleId = req.params.id; //This is the index value of the associated article
  
  // Collect Author Name
  var noteAuthor = req.body.name;

  // Collect Comment Content
  var noteContent = req.body.comment;

  // Build your author/comment-text object
  var result = {
    author: noteAuthor,
    commentBody: noteContent
  };

  // Using the Comment model, create a new comment entry
  var entry = new Note (result);

  // Save the entry to the database
  entry.save(function(err, doc) {
    // log any errors
    if (err) {
      console.log(err);
    } 
    // Or, relate the comment to the article
    else {
      // Push the new Comment to the list of comments in the article
      Article.findOneAndUpdate({'_id': articleId}, {$push: {'notes':doc._id}}, {new: true})
      // execute the above query
      .exec(function(err, doc){
        // log any errors
        if (err){
          console.log(err);
        } else {
          //Successfully added the comment to the notes collection and we also pushed the comment's ID to the
          //doc in the articles collection.
          res.redirect("/articles");
        }
      });
    }
  });

});

// Delete a Comment Route
router.post('/remove/comment/:id', function (req, res){

  // Collect comment id
  var noteId = req.params.id;

  // Find and Delete the Comment using the Id
  Note.findByIdAndRemove(noteId, function (err, todo) {  
    
    if (err) {
      console.log(err);
    } 
    else {
      res.redirect("/articles");
    }

  });

});



// Export Router 
module.exports = router;