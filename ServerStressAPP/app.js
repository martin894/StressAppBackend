var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({contactPoints: ['127.0.0.1:9042'], keyspace: 'eventskeyspace'});
client.connect(function (err) {
    console.log(err);
});
app.use(bodyParser());

function sortNumber(a, b) {
    return a - b;
}


app.get('/score', function (req, res) {
    console.log('GET /');
    var top = req.query.top;
    var score = [];
    if (top) {
        const query = 'SELECT user,value FROM score';
        client.execute(query, function (err, result) {
            score = result.sort(sortNumber).slice(0, 9);
        });
        var searchQuery = 'SELECT deviceid,value,username FROM score WHERE deviceid =?';
        client.execute(searchQuery, [req.query.deviceid], function (err, result) {
            score.push(result[2]);
        });
        res.send(score);
        console.log('Data send');
    } else {
        res.send(score);
    }
});

app.post('/data', function (req, res) {
    var key = uuid.v4();
    var query = 'INSERT INTO events JSON ?';
    var params = [req.body.data];
    client.execute(query, params, {prepare: true}, function (err) {
        console.log(err);

    });
    console.log('POST /data');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Successful');
});

app.post('/score', function (req, res) {
    console.log('POST /score');
    var searchQuery = 'SELECT deviceid,value,username FROM score WHERE deviceid =?';
    var r = null;
    client.execute(searchQuery, [req.body.deviceid], function (err, result) {
        r = result;
        console.log(r);

    });
    if (r === null) {
        console.log("new");
        var query = 'INSERT INTO score (deviceid,username,value) VALUES (?,?,?)';
        var params = [req.body.deviceid, req.body.username, req.body.value];
        client.execute(query, params, {prepare: true}, function (err) {
            console.log(err);

        });
    } else if (r[2] < req.body.value) {
        console.log("new value " + r[2]);
        const query = 'UPDATE score SET value = ? WHERE deviceid=?';
        const params = [req.body.value, req.body.deviceid];
        client.execute(query, params, {prepare: true}, function (err) {
            console.log(err);
        });
        console.log("data updated");
    } else {
        console.log("no data");
        console.log(r);
    }
    console.log('POST /score');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Successful');
});


app.listen(3000);
