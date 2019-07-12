const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const moment = require('moment');
const {generateRandomString, lookupDatabase, dataPasser, trackClicks, getClicks} = require('./helpers');
const {urlDatabase, users, urlsInfo} = require('./database');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;

app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'userID',
  keys: ['sibnefo9w3riwf']
}));

app.use((req,res,next)=>{
  if (!req.session.visitorID) {
    req.session.visitorID = generateRandomString(10);
  }
  next();
});

app.use((req,res,next)=>{
  if (!(req.session.userID in users) && req.path !== '/login' && req.path !== '/register' && !req.path.includes('/u/')) {
    //req.pleaseLogin = "Please Log In";
    res.redirect('/login?login=invalid');
  } else {
    next();
  }
});

app.use(methodOverride('_method'));

const emailPasser = dataPasser(users)('email');
const longUrlPasser = dataPasser(urlDatabase)('longURL');
const clickPasser = dataPasser(urlDatabase)('numberOfClicks');

app.get('/',(req, res)=>{
  if (req.session.userID in users) {
    res.redirect('/urls');
  }
});

app.get('/register',(req,res)=>{ //renders registration.ejs
  res.render('registration',{...emailPasser(req.session.userID), errors : undefined});
});

app.post('/register',(req,res)=>{ //sets template vars and cookie
  if (!req.body.Email) {
    //res.status(400).send("email cannot be blank");
    res.render('registration',{...emailPasser(req.session.userID), errors : "email cannot be blank"});
  } else if (lookupDatabase(users,"email",req.body.Email)) {
    //res.status(400).send("email taken");
    res.render('registration',{...emailPasser(req.session.userID), errors : "email taken"});
  } else {
    const id = generateRandomString(10);
    users[id] = {id: id, email: req.body.Email, password: bcrypt.hashSync(req.body.Password, 10)};
    req.session.userID = id;
    req.session.visitorID = id;
    res.redirect('/urls');
  }
});

app.get('/login',(req,res)=>{ //renders login
  let login;
  if (req.query.login === 'invalid') {
    login = "Please log in first";
  }
  res.render('login',{...emailPasser(req.session.userID),errors : login || undefined});
});

app.get('/login?login=locked',(req,res)=>{ //renders login
  console.log('in boi');
  res.render('login',{...emailPasser(req.session.userID),errors : "Please log in first"});
});


app.post('/login', (req, res)=>{ //sets template vars and cookie
  const id = lookupDatabase(users, 'email', req.body.Email);
  if (id && bcrypt.compareSync(req.body.Password, users[id].password)) {
    req.session.userID = id;
    req.session.visitorID = id;
    res.redirect('/urls');
    return;
  }
  //res.status(403).send("email or password is incorrect");
  res.render('login',{...emailPasser(req.session.userID),errors : "email or password is incorrect"});
  return;
});

app.post('/logout', (req, res)=>{ //clears cookie and template vars
  res.clearCookie('userID');
  res.redirect('/login');
});

app.get('/urls', (req,res) => { //renders urls_index
  res.render('urls_index', {...emailPasser(req.session.userID),info: urlsInfo,counturls : getClicks, urls: urlDatabase, id: req.session.userID});
});

app.post('/urls',(req,res)=>{ //creates new short url and adds to database
  const newString = generateRandomString(6);
  urlDatabase[newString] = {};
  urlDatabase[newString]['longURL'] = req.body.longURL;
  urlDatabase[newString]['userID'] = req.session.userID;
  urlDatabase[newString]['date'] = moment().format("MMMM D, hh:mm:s");
  urlsInfo[newString] = {};
  res.redirect(`/urls/${newString}`);
});

app.get('/urls/new', (req,res)=>{ //renders urls_new
  res.render('urls_new',emailPasser(req.session.userID));
});

app.get("/urls/:shortURL", (req, res)=>{ //renders urls_show if shortURL exists
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase && req.session.userID === urlDatabase[shortURL].userID) {
    if (urlDatabase[shortURL].longURL.slice(0,4) !== "http") {
      urlDatabase[shortURL].longURL = "http://" + urlDatabase[shortURL].longURL;
    }
    const templateVars = { shortURL: shortURL,info: urlsInfo, counturls: getClicks, date: urlDatabase[shortURL]['date'], ...longUrlPasser(shortURL),...emailPasser(req.session.userID),...clickPasser(shortURL)};
    res.render('urls_show', templateVars);
  } else {
    //res.send('Permission Denied');
    res.redirect('/urls');
  }
});

app.post("/urls/:shortURL", (req, res)=>{ //edits long url in database
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.delete("/urls/:shortURL", (req,res)=>{ // deletes shortURL object
  const deleteVar = req.params.shortURL;
  if (deleteVar in urlDatabase && req.session.userID === urlDatabase[deleteVar].userID) {
    delete urlDatabase[deleteVar];
  }
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req,res)=>{ //redirects shortURL to longURL
  if (req.params.shortURL in urlDatabase) {
    trackClicks(req.params.shortURL, req.session.visitorID, urlsInfo);
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.send("invalid link");
  }
});

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});