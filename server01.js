const hbs = require('express-handlebars');
const Datastore = require('nedb')
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000
const path = require("path")

const coll1 = new Datastore({
    filename: 'kolekcja.db',
    autoload: true
});
let idHandler = 0;


coll1.remove({}, { multi: true }, function (err, numRemoved) {
       
        console.log("usunięto wszystkie dokumenty: ",numRemoved)  
    });


app.get("/", (req, res) => {
    res.render("view1.hbs")
})
app.get("/handleform", (req, res) => {
    let obj = {
        one: req.query.one == 'TAK' ? "TAK" : "NIE",
        two: req.query.two == 'TAK' ? "TAK" : "NIE",
        three: req.query.three == 'TAK' ? "TAK" : "NIE",
        four: req.query.four == 'TAK' ? "TAK" : "NIE",
        row: idHandler++
    }
    coll1.insert(obj, (err, newDoc) => {
        //console.log(JSON.stringify({wpisane : newDoc}, null, 5))
    })
    coll1.find({ }).sort({row : 1}).exec(function (err, docs) {
        console.log(docs)
        res.render("view1.hbs", {a : docs})
    })
})

app.get("/Edit", (req, res)=>{
    coll1.find({row: parseInt(req.query.btedit)}, (err, docs) => {
        //console.log(docs)
        res.render("view2.hbs", {a : docs})
    })
})
app.get("/editconfirm", (req, res)=>{
    let toSet=req.query;
    toSet.row = parseInt(toSet.row)
    coll1.update({ row: toSet.row}, {$set: toSet},{}, (err, numUpdated)=>{
        console.log(`Zaaktualizowano: ${numUpdated}`)
    })
    coll1.find({ }).sort({row : 1}).exec(function (err, docs) {
        res.render("view1.hbs", {a : docs})
    })
})
app.get("/cancel", (req, res)=>{
    coll1.find({ }).sort({row : 1}).exec(function (err, docs) {
        res.render("view1.hbs", {a : docs})
    })
})
app.get("/Del", (req, res)=>{
    coll1.remove({ row: parseInt(req.query.row) }, {}, function (err, numRemoved) {
        idHandler--;
        coll1.count({}, (err, count)=>{
            console.log(count)
            for(let i=parseInt(req.query.row)+1;i<=count;i++){
                coll1.update({row: i}, {$set: {row: i-1}})
            }
            coll1.find({ }).sort({row : 1}).exec(function (err, docs) {
                res.render("view1.hbs", {a : docs})
            })
        })
    });
   
    
})

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static('static'));
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');
app.listen(PORT, function () {
        console.log("start serwera na porcie " + PORT )
    })    