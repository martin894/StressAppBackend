var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var url = 'mongodb://localhost:27017/db';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/score', function (req, res) {
    console.log('GET /score');
    var top = req.query.top;
    var score = [];
    var user = [];
    var highscore = 0;
    var placementvalue = 0;
    if (top) {
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            var collection = db.collection('score');
            collection.find({}, {"sort": [['value', 'desc']]}).toArray(function (err, docs) {
                assert.equal(null, err);
                console.log(docs);
                if (top > docs.length) {
                    top = docs.length;
                }
                for (var i = 0; i < top; i++) {
                    score.push(docs[i].value);
                    users.push(docs[i].username);
                }
                for (var z = 0; z < docs.length; z++) {
                    if (docs[z].deviceid === req.query.deviceid) {
                        placementvalue = z + 1;
                        highscore = docs[z].value;
                    }
                }
                var table = {users: user, scores: score, userscore: highscore, placement: placementvalue++}
                db.close();
                res.send(table);
            });
        });
    } else {
        res.send([]);
    }

})
;

app.post('/event', function (req, res) {
    console.log('POST /event');
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        var collection = db.collection('event');
        collection.insert([JSON.parse(req.body.data)], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("Inserted userdata");
            }
            db.close();
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('Successful');
        });
    });
});

app.post('/score', function (req, res) {
    console.log('POST /score');
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        var collection = db.collection('score');
        collection.find({deviceid: req.body.deviceid}).toArray(function (err, results) {
            console.log(results);
            if (results.length === 0) {
                collection.insert([JSON.parse(req.body.data)], function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                    }
                    db.close();
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end('Successful');
                });
            } else {
                console.log(results[0]);
                if (results[0].value < req.body.value) {
                    collection.update({_id: results[0]._id}, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("score updated");
                        }
                        db.close();
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end('Successful');
                    });
                } else {
                    db.close();
                    console.log("No score inserted because higher value already exist");
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end('Successful');
                }
            }
        });

    });
});

app.post('/survey', function (req, res) {
    console.log('POST /survey');
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        var collection = db.collection('survey');
        collection.insert([req.body.data], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("Inserted surveydata");
            }
            db.close();
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('Successful');
        });
    });
});


app.listen(3000);
