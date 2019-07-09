const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;


app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charListLength = charList.length;
  const randomString = [];
  for (let i = 0; i < 6; i++) {
    randomString.push(charList[Math.floor(Math.random() * charListLength)]);
  }
  return randomString.join('')[0];
};

app.get('/',(req,res) => {
  res.send('Hello');
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req,res) => {
  let templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.post('/urls',(req,res)=>{
  console.log(req.body);
  res.send('Ok');
});

app.get('/urls/new', (req,res)=>{
  res.render('urls_new');
});

app.get("/urls/:shortURL", (req, res)=>{
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

app.get('/hello', (req,res)=>{
  res.send("<html><body>Hello <b>World</b></html></body>\n");
});

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});