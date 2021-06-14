'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
mongoose.set('useFindAndModify', false);

var points = require('../collections/points');
var triangles = require('../collections/triangles');

var coord;
var choice = 1;
points.findOne({}, null, { sort: { number: 1 } }, function (err, rez) { choice = rez.number; });
var mode = "";
var message = "";
var Points = "";
var Trian = "";

router.post('/', function (req, res) {
    (async () => {
    choice = +req.body.choice;
    mode = req.body.mode;
     Points = JSON.parse(req.body.points);
     Trian = JSON.parse(req.body.trian);
        message = "";
        var countP = Points.length, countT = Trian.length;

        switch (mode) {
            case "file":
                var P = "";
                for (let i = 0; i < countP; i++) {
                    P = P + Points[i].abscissa + ' ' + Points[i].ordinate + '; ' + Points[i].number + '\n';
                }
                var T = "";
                for (let i = 0; i < countP; i++) {
                    T = T + Trian[i].first_point + ' ' + Trian[i].second_point + ' ' + Trian[i].third_point + '; ' + Trian[i].number + '\n';
                }
                fs.writeFile('C:/Users/ааааа/Downloads/POINTS' + choice + '.txt', P, function (err) { if (err) console.log(err); });
                fs.writeFile('C:/Users/ааааа/Downloads/TRIANGLES' + choice + '.txt', T, function (err) { if (err) console.log(err); });
                message = "Успешно скачано.";
                res.send({ 'message': message });
                break;
            case "save":
                points.remove({ number: choice }, function (er, rez) { });
                triangles.remove({ number: choice }, function (er, rez) { });

                var Point = mongoose.model('points');
                for (let i = 0; i < countP; i++) {
                    var point = new Point({
                        abscissa : Points[i].abscissa,
                        ordinate : Points[i].ordinate,
                        number : Points[i].number
                        });
                    point.save();
                };
             
                var Triangle = mongoose.model('triangles');
                for (let i = 0; i < countT; i++) {
                    var triangle = new Triangle
                        ({
                            first_point: Trian[i].first_point,
                            second_point: Trian[i].second_point,
                            third_point: Trian[i].third_point,
                            number: Trian[i].number
                        });
                    triangle.save();
                };
             
                message = "Сохранено";
                res.send({ 'message': message });
                break;
            case "DEL":
                points.remove({ number: choice }, function (er, rez) { });
                triangles.remove({ number: choice }, function (er, rez) { });
                await points.findOne({}, null, { sort: { number: 1 } }, function (err, rez) { choice = rez.number; });
                
            default:
                await points.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
                    if (!rez) { console.log("Error!", err); }
                    else {
                        coord = rez;
                    };
                });
                triangles.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
                    if (!rez) { console.log("Error!", err); }
                    else {
                        res.send({ 'coord': coord, 'trian': rez, 'message': message });
                    };
                });
                break;
        };
    })();

})

router.get('/', function (req, res) {

    points.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
        if (!rez) { console.log("Error!", err); }
        else {
            coord = rez;
        };
    });

    triangles.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
        if (!rez) { console.log("Error!", err); }
        else {
            res.render('index', {
                coord: coord,
                trian: rez
            });
        };
    });
});

module.exports = router;
