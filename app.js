const bodyParser = require("body-parser");
const express = require('express')
const ejs = require('ejs')
const app = express();


app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    res.render('pages/index')
})

app.listen(8080);
console.log('3000 is the magic port');
