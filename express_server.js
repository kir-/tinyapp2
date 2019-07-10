const express = require('express');
const bodyParser = require('body-parser');
const {generateRandomString, lookupDatabase} = require('./server_functions');
const {urlDatabase, users} = require('./database');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const templateVars = {
  id: '',
  email : '',
  password: '',
  urls: urlDatabase
};

app.get('/register',(req,res)=>{
  templateVars.email = users[req.cookies["userID"]];
  res.render('registration',templateVars);
});

app.post('/register',(req,res)=>{
  templateVars.id = generateRandomString();
  templateVars.email = req.body.Email;
  templateVars.password = req.body.Password;
  if (templateVars.email === "" || lookupDatabase(users,"email",templateVars.email)) {
    res.status(400).send("Error email taken");
    //res.redirect('/login');
    return;
  }
  users[templateVars.id] = {id: templateVars.id, email: templateVars.email, password: templateVars.password};
  res.cookie('userID', templateVars.id);
  res.redirect('/urls');
});

app.get('/login',(req,res)=>{
  templateVars.email = users[req.cookies["userID"]];
  res.render('login',templateVars);
});

app.post('/login', (req, res)=>{
  templateVars.email = req.body.Email;
  templateVars.password = req.body.Password;
  templateVars.id = lookupDatabase(users, 'email', templateVars.email);
  if (templateVars.id && users[templateVars.id].password === templateVars.password) {
    res.cookie('userID', templateVars.id);
    res.redirect('/urls');
  }
  res.status(404).send("Error Account not found");
  return;
});

app.post('/logout', (req, res)=>{
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.get('/urls', (req,res) => {
  templateVars.email = users[req.cookies["userID"]];
  res.render('urls_index', templateVars);
});

app.post('/urls',(req,res)=>{
  const newString = generateRandomString();
  urlDatabase[newString] = {};
  urlDatabase[newString]['longURL'] = req.body.longURL;
  urlDatabase[newString]['userID'] = req.cookies["userID"];
  res.redirect(`/urls/${newString}`);
});

app.get('/urls/new', (req,res)=>{
  templateVars.email = users[req.cookies["userID"]];
  if (req.cookies["userID"] in users) {
    res.render('urls_new',templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res)=>{
  templateVars.email = users[req.cookies["userID"]];
  if (req.params.shortURL in urlDatabase && req.cookies["userID"] === urlDatabase[req.params.shortURL].userID) {
    let urlVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email: templateVars.email};
    res.render('urls_show', urlVars);
  } else {
    res.redirect('/urls');
  }
});

app.post("/urls/:shortURL", (req, res)=>{
  console.log(templateVars.id);
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req,res)=>{
  let deleteVar = req.params.shortURL;
  if (deleteVar in urlDatabase && req.cookies["userID"] === urlDatabase[deleteVar].userID) {
    delete urlDatabase[deleteVar];
  }
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req,res)=>{
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});