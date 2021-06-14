var express = require('express');
var router = express.Router();
const mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'coin'
}); 

/* GET home page. */
router.get('/', function(req, res, next) {
  let sql = "select * from user";
    let query = connection.query(sql,(err,rows)=>{ 
        if(err) throw err;
    });

  console.log(sql);
  res.render('index', { title: 'Express' });
});

module.exports = router;


// con.connect(function(err) {
//   if (err) throw err;
//   var sql = "SELECT * FROM USER";
//   con.query(sql, function (err, result, fields) {
//     if (err) throw err;
//     console.log(result);
//   });
// });