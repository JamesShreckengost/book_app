'use strict';
const e = require('express');
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
const client = new pg.Client('postgres://james-shreckengost:1y9bgr18@localhost:5432/book_app')
client.on('error', error => console.log(error));


// ======================= Routes =================================
app.get('/', homePage);
// app.post('/search', handleBookSearch);
// app.get('/books/:id', getSingleBook)


function homePage(req, res) {
  let SQL = 'Select * from book_table';

  return client.query(SQL)
    .then(results =>res.render('pages/index.ejs', {bookArr: results.rows, count:5 }))
      .catch(err => handleError(err, res));
}


app.get('/searches/new', (req, res) => {
  res.render('./searches/new.ejs');
});

app.post('/search', (req, res) => {
  let bookSearch = req.body.selectionType;
  console.log(req.body)
  let search = req.body.query;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${bookSearch}:${search}`;
  console.log(url);

  superagent.get(url)
    .then(userData => {

      const bookArr = userData.body.items.map(bookSearch => {
        const book = new Book(bookSearch);
        return book
      });
      res.render('./searches/show.ejs', { bookArr: bookArr});
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

app.get('/searches/new', handleBookSearch)

function handleBookSearch(req, res) {
  console.log(req.body);
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=in${req.body.selectionType}:${req.body.query}`)
    .then((data) => {
      const bookArr = data.body.items.map(eachBook => {
        return new Book(eachBook);
      })
      res.render('./searches/show.ejs', { bookArr: bookArr });
    });

};



app.get('/books/:id', bookIdGet); 

function bookIdGet(req, res){
  const sqlString = 'SELECT * FROM book_table where id = $1'
  const sqlArr =[req.params.id];
  client.query(sqlString, sqlArr).then(result => {
    const ejsObject = {books: result.rows[0]};
    res.render('pages/books/detail.ejs', ejsObject);
  }).catch(error => {
    res.render('pages/error.ejs');
    console.log(error);
  })
}
          
//     
app.post('/books', addBook);

function addBook(req, res) {
  const {title, author, description, pubdate, image_url} = req.body;
  const sqlString = 'INSERT INTO book_table (title, author, description, pubdate, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
  const sqlArray = [title, author, description, pubdate, image_url];
  client.query(sqlString, sqlArray)
    .then(result => {
      const ejsObject = {allBooks: result.rows, count:5}
      res.render('pages/index.ejs', ejsObject)
    })
    .catch(error => {
      console.log(error);
    });
}

app.put('/books/:id', putBook)

function putBook(req, res){
  const sqlString = 'UPDATE book_table SET image_url=$1, title=$2, author=$3, description=$4, isbn=$5 WHERE id$=6';
  const sqlArr = [req.body.image_url, req.body.title, req.body.author,req.body.description, req.body.ibsn, req.params.id];
  client.query(sqlString, sqlArr).then(result => {
    res.redirect(`/books/${req.params.id}`);
  }).catch(error => {
    res.render('pages/error.ejs');
    console.log(error);
  })

}


// function showCollection(re)

// ========================= Initialization ====================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
  })
