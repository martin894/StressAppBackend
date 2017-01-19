var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['127.0.0.1:9042'], keyspace: 'eventskeyspace' });
                client.connect(function (err) {
                console.log(err);
        });     
app.use(bodyParser());


app.get('/', function(req, res){
    console.log('GET /')
    //var html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
    var html = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.post('/data', function(req, res){	
	var key = uuid.v4();
	var query = 'INSERT INTO events (key,deviceid,value) VALUES (?,?,?)';
	var params = [key,req.body.deviceid,req.body.data];	
	client.execute(query, params, { prepare: true }, function (err) {
 	 console.log(err);
  
	});
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Successful');
});

app.post('/score', function(req, res){   
        var query = 'INSERT INTO score (key,value) VALUES (?,?)';
        var params = [req.body.deviceid,req.body.score];       
        client.execute(query, params, { prepare: true }, function (err) {
         console.log(err);
  
        });
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Sucessful');
});


app.listen(3000);
