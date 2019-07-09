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
  return randomString.join('');
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
  let newString = generateRandomString();
  urlDatabase[newString] = req.body.longURL;
  res.redirect(`/urls/${newString}`);
});

app.get('/urls/new', (req,res)=>{
  res.render('urls_new');
});

app.get("/urls/:shortURL", (req, res)=>{
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

app.post("/urls/:shortURL", (req, res)=>{
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req,res)=>{
  let deleteVar = req.params.shortURL;
  delete urlDatabase[deleteVar];
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req,res)=>{
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/hello', (req,res)=>{
  res.send("<html><body>Hello <b>World</b></html></body>\n");
});

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});