## New York Times News Scraper App
This application is a single page, full stack web app that scrapes and displays all stories from www.nytimes.com/section/world.

Users are presented with a series of article headlines. Clicking on the headline will give the user access to a summary of the article, and a link to display the entire article in a new tab.

Users can comment on each article, and display all comments that have been made.

## Links
Heroku: [NY Times Scraper](https://mongo-news-shulme801.herokuapp.com)
The project is also included in my portfolio at [Steve Hulme’s Portfolio](https://shulme801.github.io/Hulme-Portfolio/).

## Motivation
This project is a full-stack web app, using the Model-View-Controller(MVC) design pattern. It uses Mongo as persistent storage, and Mongoose as the modeling engine or ORM.

## File Overview — what does what?
This is a complex project. A short overview of the function and structure of each file will be helpful. We’ll look first at the file organization, then at the driver code, and then at how the MVC design pattern is implemented.

### Project Directory/File Structure


### Driver Code

* server.js
	* Requires the npm modules express, handlebars, body-parser, morgan, request, cheerio and mongoose (to create the database connection and initialize the collections if not already present).
	* Requires routes/router.js (the “controller”).

server.js contains the code that retrieves the routes , does basic initialization, summons handlebars to create the base html page, and starts listening on the default port (usually 8080). Note that it also establishes for the Express server the /public directory as the source for static information (e.g., images and css).

### MVC Design Pattern Implementation

#### Files that constitute the “Model”
These are the files that interact with the database (in our case, the “burgers” table, as defined in db/schema.sql and seeded by db/seeds.sql).

##### “Model” files
* models/articles.js.  Creates the model for the articles collection.
* models/note.js. Creates the model for the “notes” or “comments” collection.

##### “View” files
* views/layouts/main.handlebars is the HTML shell of our app’s homepage. It pulls in the materialize and google fonts stylesheets, as well as the /public/assets/css/styles.css stylesheet that provides custom formatting.
* views/index.handlebars builds the dynamic content of our homepage — the articles that have been scraped from the New York Times.

##### “Controller” files
* routes/router.js. Requires express so that it can use the Express router function. Requires models/article.js and models/note.js.
	* Sets up a get route at the document root (“/“) that retrieves all articles and comments from the database and uses handlebars to render them. If the database is empty, transfers control to the get route “/scrape”.

## Build status
This is version 1.0 of the application. Version 2 will refactor and clean up of all the code.

## Screenshots



## Tech/framework used
* Node
* Express
* Mongo
* Mongoose
* Cheerio
* Handlebars
* MVC design pattern
* Materialize css framework

## Features
This project is a complete, end-to-end implementation of a web app.
* Front End/Browser
	* Handlebars
	* CSS
	* Dynamic web page rendering
* Middleware
	* Express routing
	* Controller utilizes object - relational modeling to interface to the database.
* Server
	* Database

## Code Example

## Installation
1. git clone the repository.
2. $ npm install package.json.
3. $ node server
4. Point the browser to localhost:8080/.
5. Click the “Articles Refresh” icon on the upper left corner of the Banner to (re)scrape articles.

## License
Copyright 2018 Pilgrim Marine Consultants, LLC (Stephen H. Hulme)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

MIT © Stephen H. Hulme (2018)