const moment = require('moment');

const generateRandomString = (length) => {
  const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charListLength = charList.length;
  const randomString = [];
  for (let i = 0; i < length; i++) {
    randomString.push(charList[Math.floor(Math.random() * charListLength)]);
  }
  return randomString.join('');
};

const lookupDatabase = (data, search, compare) => {
  for (let x in data) {
    if (data[x][search] === compare) {
      return x;
    }
  }
  return;
};

const dataPasser = (data)=>{
  const database = data;
  return (property) => {
    const searchProperty = property;
    return (cookie) => {
      if (cookie in database) {
        return {[searchProperty]: database[cookie][searchProperty]};
      }
      return {[searchProperty]: undefined};
    };
  };
};

const trackClicks = (shortURL, visitorID, data) => { //pushes time stamp
  let currentDate = moment().format("MMMM D, hh:mm:s");
  if (!(visitorID in data[shortURL])) {
    data[shortURL][visitorID] = [];
  }
  data[shortURL][visitorID].push(currentDate);
};

const getClicks = (shortURL, data) => { //counts clicks
  let numberOfClicks = 0;
  let numberOfUnique = 0;
  if (data[shortURL]) {
    for (let visitor in data[shortURL]) {
      //console.log(data[shortURL][visitor]);
      numberOfClicks += data[shortURL][visitor].length;
      numberOfUnique++;
    }
  }
  return {numberOfClicks: numberOfClicks,numberOfUnique: numberOfUnique};
};

module.exports = {generateRandomString, lookupDatabase, dataPasser, getClicks, trackClicks};