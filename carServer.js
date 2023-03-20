const express = require("express");
const app = express();
const PORT = 3000;
const path = require("path");
const hbs = require("express-handlebars");
const Datastore = require("nedb");
const bodyParser = require("body-parser");
const coll1 = new Datastore({
  filename: "kolekcja.db",
  autoload: true,
});
app.use(express.static("static"));

const getEditInfo = (arr)=>{
 const obj = {insured: false, patrol: false, damaged: false, naped: false}
 arr.forEach((element,i) => {
  switch(i){
    case 0:
      if(element === 'true') obj.insured = true;
      else if(element === 'false') obj.insured = false;
      else obj.insured = undefined;
      break;
      case 1:
        if(element === 'true') obj.patrol = true;
      else if(element === 'false') obj.patrol = false;
      else obj.patrol = undefined;
      break;
      case 2:
        if(element === 'true') obj.damaged = true;
      else if(element === 'false') obj.damaged = false;
      else obj.damaged = undefined;
      break;
      case 3:
        if(element === 'true') obj.naped = true;
      else if(element === 'false') obj.naped= false;
      else obj.naped = undefined;
      break;
  }
 });
 return obj;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));

//TODO add option none for db
app.engine(
  "hbs",
  hbs({
    defaultLayout: "main.hbs",
    helpers: {
      isTrue: function (val) {
        let returned = undefined;
        if(val === true) returned = "TAK";
        else if(val === false) returned = "NIE";
        else returned = "BRAK"
        return returned
      },
      isActId: function(val,id){
        // console.log(val,id)
        // console.log(val === id ? true : false);
        return val === id ? true : false;
      }
    },
    extname: ".hbs",
    partialsDir: "views/partials",
  })
);
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
const getCarInfo = (a, b, c, d) => {
  const obj = { insured: false, patrol: false, damaged: false, naped: false };
  obj.insured = a!=undefined ? true : false;
  obj.patrol = b!=undefined ? true : false;
  obj.damaged = c!=undefined ? true : false;
  obj.naped = d!=undefined ? true : false;

  return obj;
};
const addedRecord = {
  isAdded: false,
  id: "",
};
app.get("/", function (req, res) {
  // res.render('index.hbs', data);
  // return;

  // coll1.find({},function(err,numRemoved){
  //     console.log("--- baza:  ",numRemoved)

  // })
  res.render("index.hbs");
});

app.get("/addCar", function (req, res) {
  res.render("addCar.hbs", addedRecord);
  addedRecord.isAdded = false;
  addedRecord.id = "";
});
app.post("/addingCarDB", function (req, res) {
  // console.log(req.body.naped)
  const car = getCarInfo(
    req.body.insured,
    req.body.patrol,
    req.body.damaged,
    req.body.naped
  );
  coll1.insert(car, function (err, newCar) {
    // console.log('nowy rekord: '+JSON.stringify( newCar));
    // console.log('id: '+newCar._id)
    addedRecord.isAdded = true;
    addedRecord.id = newCar._id;
  });
  res.redirect("/addCar");
  // res.render('addCar.hbs')
});
app.post("/deleteCarDB", function (req, res) {
  const key = Object.keys(req.body)[0];
  coll1.remove({ _id: key }, {}, function (err, removed) {
    // console.log("rek: "+removed)
    res.redirect("/listCar");
  });
});
app.get("/listCar", function (req, res) {
  const context = { dataDB: [] };
  coll1.find({}, function (err, docs) {
    context.dataDB = docs;
    // console.log("tesst"+new Date().getMilliseconds())
    res.render("listCar.hbs", context);
  });
  // console.log(new Date().getMilliseconds());
});
app.get('/editCar', function (req, res) {
  const actualID = req.query._id === undefined ? undefined : req.query._id;
  const context = { dataDB: [] };
  coll1.find({}, function (err, docs) {
    context.dataDB = docs;
    // console.log("tesst"+new Date().getMilliseconds())
    res.render("editCar.hbs", {context: context,actId: actualID});
  });
  
})
app.get('/updateData', function (req, res){
  const arr = [req.query.insured,req.query.patrol,req.query.damaged,req.query.naped]
  const updCar = getEditInfo(arr);
  coll1.update({_id: req.query._id},{ $set: updCar },{},function (err,numUpdated){
    // console.log(updCar, req.query.id);
    console.log("update: "+numUpdated);
    res.redirect('/editCar');
  })
  
})
app.get('/cancelUpdate', function (req, res){
  res.redirect('/editCar');
})
app.listen(PORT, function () {
  console.log("localhost:" + PORT);
});
