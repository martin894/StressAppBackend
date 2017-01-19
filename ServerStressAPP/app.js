var express = require('express');
var fs = require('fs');
var app = express();
var uuid = require('node-uuid');
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['host1'] });
client.connect(function (err) {
  assert.ifError(err);
});
app.get('/', function(req, res){
    console.log('GET /')
    //var html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
    var html = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.post('/data', function(req, res){
	var key = uuid.v4();
	const query = 'INSERT INTO events (key,value) VALUES (?)*';
	const params = [key,req.body];	
	client.execute(query, params, { prepare: true }, function (err) {
 	 assert.ifError(err);
  
	});
    console.log('POST /data');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Sucessful');
});

app.listen(3000);
