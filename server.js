'use strict';
// ============== Packages ==========================================
const express = require('express');
require('dotenv').config();
const pg = require('pg');



// ====================== App ======================================

const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
// client.on('error', error => console.log(error));


// ======================= Routes =================================
app.get('/', handleIndex);

function handleIndex(req, res){
  res.render('./pages/index.ejs');
}



// ========================= Initialization ====================
app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));