const express = require("express");
const app = express()
const PORT = 3000;
const path = require("path")
const hbs = require('express-handlebars');

const db = require('nedb');
const col = new db({
    filename: 'database.db',
    autoload: true
});

app.set('views', path.join(__dirname, 'views'));         
app.engine('hbs', hbs({ defaultLayout: 'main.hbs'}));   
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));

//TODO first menu on header
let data = {
    array: []
};

app.get("/", function (req, res) {
    // res.render('index.hbs', data);
    // return;

    col.find({},(err,docs)=>{
        res.render('index.hbs', {array: docs});
    })
})

app.post("/post", function (req, res) {
    let post = req.body;
    post.time = new Date().toLocaleDateString();

    // data.array = [post, ...data.array]
    // res.redirect("/");
    
    col.insert(post, (err, newDoc)=>{
        res.redirect("/");
    })
})

app.listen(PORT, function () {
    console.log("localhost:" + PORT )
})