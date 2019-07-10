const generateRandomString = () => {
  const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charListLength = charList.length;
  const randomString = [];
  for (let i = 0; i < 6; i++) {
    randomString.push(charList[Math.floor(Math.random() * charListLength)]);
  }
  return randomString.join('');
};

const lookupDatabase = (data, search, compare, cb = null) => {
  for (let x in data) {
    if (data[x][search] === compare) {
      return x;
    }
  }
  return;
};

const getUsersURL = (data,id) => {
  return data[id];
};

module.exports = {generateRandomString, lookupDatabase};