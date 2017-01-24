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


app.get('/score', function (req, res) {
    console.log('GET /');
    var top = req.query.top;
    var score = [];
    var user = [];
    var highscore = 0;
    var placementvalue = 0;
    if (top) {
        const query = 'SELECT username,value,deviceid FROM score';
        client.execute(query, function (err, result) {
                var temp = [];
                console.log(result.rows);
                if (temp.length >= top) {
                    top = temp.length;
                }
                var temp = result.rows.slice(0, top);
                console.log(temp);
                for (var i = 0; i < temp.length; i++) {
                    score.push(temp[i].value);
                    user.push(temp[i].username);
                }
                var searchQuery = 'SELECT deviceid,value,username FROM score WHERE deviceid =?';
                client.execute(searchQuery, [req.query.deviceid], function (err, result) {
                    if (result.rows[0] != null) {
                        for (var z = 0; z < temp.length; z++) {
                            if (temp[z].deviceid === req.query.deviceid) {
                                placementvalue = z;
                            }
                        }
                        highscore = result.rows[0].value;
                        var table = {users: user, scores: score, userscore: highscore, placement: placementvalue++}
                        res.send(table);
                    } else {
                        var table = {users: user, scores: score, userscore: highscore, placement: placementvalue}
                        res.send(table);
                    }
                });

            }
        );

    } else {
        res.send(score);
    }
})
;

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

    client.execute(searchQuery, [req.body.deviceid], function (err, result) {
        var r = null;
        console.log(result);
        if (result.rows.length > 0) {
            r = result.rows[0];
        }
        if (r === null) {
            console.log("new");
            var query3 = 'INSERT INTO score (deviceid,username,value) VALUES (?,?,?)';
            var params3 = [req.body.deviceid, req.body.username, req.body.value];
            client.execute(query3, params3, {prepare: true}, function (err) {
                console.log(err);

            });
        } else if (r != null && r.value < req.body.value) {
            console.log("test");
            var query2 = 'DELETE FROM score WHERE deviceid=?';
            var params2 = [req.body.deviceid];
            client.execute(query2, params2, {prepare: true}, function (err) {
                console.log(err);
                var query4 = 'INSERT INTO score (deviceid,username,value) VALUES (?,?,?)';
                var params4 = [req.body.deviceid, req.body.username, req.body.value];
                client.execute(query4, params4, {prepare: true}, function (err) {
                    console.log(err);

                });
                console.log("data updated");
            });
        } else {
        }.
        console.log('POST /score');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Successful');
    });


});


app.listen(3000);
