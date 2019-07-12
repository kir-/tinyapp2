const { assert } = require('chai');
const {lookupDatabase, dataPasser} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('lookupDatabase', function() {
  it('should return a user with valid email', function() {
    const user = lookupDatabase(testUsers, 'email', "user@example.com",);
    const expectedOutput = "userRandomID";
    assert(user,expectedOutput);
  });
  it('should return a falsy if no valid email', function() {
    const user = lookupDatabase(testUsers, 'email', "userecsv@example.com",);
    assert.isNotOk(user);
  });
});

describe('dataPasser', function() {
  it('should return a email object', function() {
    const email = dataPasser(testUsers)('email')("user2RandomID");
    const expectedOutput = {email:  "user2@example.com"};
    assert(email, expectedOutput);
  });
  it('should return a id object', function() {
    const user = dataPasser(testUsers)('id')("user2RandomID");
    const expectedOutput = {id:  "user2RandomID"};
    assert(user, expectedOutput);
  });
});