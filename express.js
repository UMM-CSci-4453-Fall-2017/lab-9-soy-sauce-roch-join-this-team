Promise=require('bluebird')
mysql=require('mysql');
dbf=require('./dbf-setup.js');
var credentials = require('./credentials.json');

var express=require('express'),
app = express(),
port = process.env.PORT || 1337;

//Declare all the necessary arrays
var buttons = [];
var list = [];
var totalAmt = [];
var loginInfo = [];
var receipt = [];

//Method to query the database and returns the rows
var queryDatabase = function(dbf, sql){
  queryResults = dbf.query(mysql.format(sql));
  return(queryResults);
}

//Take in the query rows and the necessary array and insert into the array
var fillInArray = function(result, array){
  array = result;
  return(array);
}

//Send the sql statement into the database, not expecting any returns
var sendToDatabase = function(dbf, sql){
  dbf.query(mysql.format(sql));
}

//Querying database, insert rows data into buttons and send the buttons array back to the client side
app.use(express.static(__dirname + '/public')); //Serves the web pages
app.get("/buttons",function(req,res){
  var sql = "SELECT * FROM " + credentials.user + ".till_buttons";
  var query = queryDatabase(dbf, sql)
  .then(fillInArray(buttons))
  .then(function (buttons) {
    res.send(buttons);})
  .catch(function(err){console.log("DANGER:",err)});
});

//When .post /vold in invoked, this method will truncate the transaction table, res.send() at the end to ensure
//client receives the response and end the socket.
app.post("/void",function(req,res){
  var sql = "TRUNCATE TABLE " + credentials.user + ".transaction";
  var query = sendToDatabase(dbf, sql);
  res.send();
});

//When .get /list is invoked, this method will query the database and compile all the transaction
//data and send it back to the client side.
app.get("/list",function(req,res){
  var sql = "SELECT * FROM " + credentials.user + ".transaction";
  var query = queryDatabase(dbf, sql)
  .then(fillInArray(list))
  .then(function (list) {
    res.send(list);})
  .catch(function(err){console.log("DANGER:",err)});
});

//this method is responsible for adding the transaction info every time one of the buttons is pressed.
//Again res.send() is added to free up the socket.
app.post("/click",function(req,res){
  var id = req.param('id');
  var username = req.param('usern');
  var sql = 'INSERT INTO ' + credentials.user + '.transaction values (' + id + ',(SELECT item FROM ' +
  credentials.user + '.inventory WHERE id = ' + id + '), 1 ,(SELECT prices FROM '+
  credentials.user + '.prices WHERE id = ' + id + '), NOW(), 1, "' + username + '") on duplicate key update amount = amount + 1, ' +
  'cost = cost + (SELECT prices FROM '+ credentials.user + '.prices WHERE id = ' + id + ');'
  var query = sendToDatabase(dbf, sql);
  console.log(sql);
  res.send();
});

//this method is responsible for deleting the record when the user press on one of the item in the
//transaction table, res.send() is added as well.
app.post("/delete", function(req,res){
  var id = req.param('id');
  var sql = 'DELETE FROM ' + credentials.user + '.transaction where id = ' + id;
  var query = sendToDatabase(dbf, sql);
  res.send();
});

//this method is responsible for getting the total amount of transaction.
//Similar to above.
app.get("/total", function(req, res){
  var sql = 'SELECT SUM(cost) AS TOTAL FROM ' + credentials.user + '.transaction';
  var query = queryDatabase(dbf, sql)
  .then(fillInArray(totalAmt))
  .then(function (totalAmt) {
    res.send(totalAmt);})
  .catch(function(err){console.log("DANGER:",err)});
});

app.get("/login", function(req, res){
  var usern = req.param('usern');
  var passw = req.param('pw');
  var sql = 'SELECT password = "' + passw + '" AS CORRECT FROM ' + credentials.user + '.User WHERE username = "' + usern + '";'
  var query = queryDatabase(dbf, sql)
  .then(fillInArray(loginInfo))
  .then(function (loginInfo){
    res.send(loginInfo);})
  .catch(function(err){console.log("DANGER:",err)});
});

app.get("/sale", function(req, res){
  var sql = 'CALL ' + credentials.user + '.SALE()';
  var query = sendToDatabase(dbf, sql);
  res.send();
});

app.get("/ticketize", function(req, res){
  var sql = 'CALL Andy.RECEIPT()';
  var query = queryDatabase(dbf, sql)
  .then(fillInArray(receipt))
  .then(function (receipt){
    res.send(receipt);})
  .catch(function(err){console.log("DANGER:",err)});
});

app.listen(port);
