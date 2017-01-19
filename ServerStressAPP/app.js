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

function sortNumber(a,b) {
    return a - b;
}



app.get('/score', function(req, res){
    console.log('GET /');
    var top = req.query.top;
    if(top==10){
        const query = 'SELECT user,value FROM score';
        client.execute(query, function (err, result) {
            var score = result.sort(sortNumber);


        });

    }		
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("Successful");
});

app.post('/data', function(req, res){	
	var key = uuid.v4();
	var query = 'INSERT INTO events JSON VALUES (?)';
	var params = [req.body.data];
	client.execute(query, params, { prepare: true }, function (err) {
 	 console.log(err);
  
	});
    console.log('POST /data');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Successful');
});

app.post('/score', function(req, res){   
        var query = 'INSERT INTO score (deviceid,username,value) VALUES (?,?,?)';
        var params = [req.body.deviceid,req.body.username,req.body.score];       
        client.execute(query, params, { prepare: true }, function (err) {
         console.log(err);
  
        });
    console.log('POST /data');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Sucessful');
});


app.listen(3000);
