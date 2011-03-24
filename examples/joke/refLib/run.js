/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


var MySQLPool = require("./mysql-pool").MySQLPool,
    pool = new MySQLPool({database: "joke"});

pool.properties.user = 'root';
pool.properties.password = '123456';

pool.connect(4);

pool.query("SELECT * from comment", function(err, rows, fields) {
  if(err) throw err;
  console.log(rows);
	console.log(fields);
});
