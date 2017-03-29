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
    var ids = [];
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
                    user.push(docs[i].username);
                    ids.push(docs[i].deviceid);
                }
                for (var z = 0; z < docs.length; z++) {
                    console.log(docs[z].deviceid + " " + req.query.deviceid + " " + docs[z].username + " " + req.query.username);
                    if ((docs[z].deviceid === req.query.deviceid) && (docs[z].username ===req.query.username)) {
                        placementvalue = z;
                        highscore = docs[z].value;
                        console.log("highest score: " + docs[z].value;
                        break;
                    }
                }
                var table = {users: user, scores: score, userscore: highscore, userids:ids, placement: placementvalue++};
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
                console.log("test");
                console.log(req.body.data);
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
        collection.find({deviceid: JSON.parse(req.body.data).deviceid}).toArray(function (err, results) {
            if (results.length === 0) {
                collection.insert([JSON.parse(req.body.data)], function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("score inserted");
                    }
                    db.close();
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end('Successful');
                });
            } else {
                var uResult = results[0];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].username === JSON.parse(req.body.data).username) {
                      uResult = results[i];  
                    }
                }
                if (uResult.value < JSON.parse(req.body.data).value) {
                    collection.update({_id: uResult._id}, {$set: {value: JSON.parse(req.body.data).value}}, function (err, result) {
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
        collection.insert([JSON.parse(req.body.data)], function (err, result) {
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

app.post('/stresslevel', function (req, res) {
    console.log('POST /stresslevel');
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        var collection = db.collection('stresslevel');
        collection.insert([JSON.parse(req.body.data)], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("Inserted stresslevelvalue");
            }
            db.close();
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('Successful');
        });
    });
});


app.listen(3000);
