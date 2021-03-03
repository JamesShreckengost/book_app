'use strict';
// ============== Packages ==========================================
const express = require('express');
require('dotenv').config();
const pg = require('pg');
const superagent = require('superagent');


// ====================== App ======================================

const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const client = new pg.Client('postgres://')
client.on('error', error => console.log(error));


// ======================= Routes =================================
app.get('/', homePage);
// app.post('/search', handleBookSearch);
app.get('/books/:id', getSingleBook)
app.post('/books', addBook)

function homePage(req, res) {
  res.render('pages/index.ejs');
}


app.get('/searches/new', (req, res) => {
  res.render('./searches/new.ejs');
});

app.post('/search', (req, res) => {
  let bookSearch = req.query.selectionType;
  let search = req.body.query;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${search}:${bookSearch}`;

  superagent.get(url)
    .then(userData => {

      const bookArr = userData.body.items.map(bookSearch => {
        const book = new Book(bookSearch);
        console.log(book);
        return book
      });
      res.render('./searches/show.ejs', { bookArr: bookArr });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Sorry something went wrong.')
    });
});

function Book(object) {

  

  this.image_url = object.volumeInfo.imageLinks ? object.volumeInfo.imageLinks.smallThumbnail.replace(/HTTP:/i, 'https:') : "https://i.imgur.com/J5LVHEL.jpg";
  this.title = object.volumeInfo.title;
  this.author = object.volumeInfo.authors;
  this.description = object.volumeInfo.description;
  this.pubDate = object.volumeInfo.publishedDate
}


function handleBookSearch(req, res) {
  console.log(req.body)
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=in${req.body.selectionType}:${req.body.query}`)
    .then((data) => {
      const bookArr = data.body.items.map(eachBook => {
        return new Book(eachBook);
      })
      res.render('./searches/show.ejs', { bookArr: bookArr });
      console.log(data.body.items)
    });

};



// function Book(title, image, authors, description) {
//   this.title = title,
//     this.image_url = image || `https://i.imgur.com/J5LVHEL.jpg`,
//     this.authors = authors,
//     this.description = description

// }


// app.get('/books/:id', getsingleBook)
function getSingleBook() {
  res.render('pages/books/')
}
// app.post('/books', addBook)
function addBook() {

}

// ========================= Initialization ====================
app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));