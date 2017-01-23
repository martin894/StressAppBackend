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
    var score = [];
    if(top==10){
        const query = 'SELECT user,value FROM score';
        client.execute(query, function (err, result) {
            score = result.sort(sortNumber).slice(0,9);
        });
        res.send(score);
        console.log('Data send');
    } else {
        res.send(score);
    }
});

app.post('/data', function(req, res){	
	var key = uuid.v4();
	var query = 'INSERT INTO events JSON ?';
	var params = [req.body.data];
	client.execute(query, params, { prepare: true }, function (err) {
 	 console.log(err);
  
	});
    console.log('POST /data');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Successful');
});

app.post('/score', function(req, res){
        var searchQuery = 'SELECT deviceid,value,username FROM score WHERE deviceid =?';
        var res;
        client.execute(searchQuery, [req.body.deviceid], function (err, result) {
            res = result;
            console.log(res);
            // if (!result.isEmpty()){
            //     if(req.body.score>result)
            // } else {
            //     var query = 'INSERT INTO score (deviceid,username,value) VALUES (?,?,?)';
            //     var params = [req.body.deviceid,req.body.username,req.body.score];
            //     client.execute(query, params, { prepare: true }, function (err) {
            //         console.log(err);
            //
            //     });
            // }
         });
        if (res){
            console.log("new");
            var query = 'INSERT INTO score (deviceid,username,value) VALUES (?,?,?)';
            console.log(req.body.deviceid);
            var params = [req.body.deviceid,req.body.username,req.body.score];
            client.execute(query, params, { prepare: true }, function (err) {
                    console.log(err);

            });
        }

    console.log('POST /score');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Successful');
});


app.listen(3000);
