//jshint esversion:6

const express = require("express");
// const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-manan:testuser123@cluster0.n5co4.mongodb.net/todolistDB?retryWrites=true&w=majority", {useUnifiedTopology: true,useNewUrlParser: true});

const itemSchema = {
  name: String
};

// Creating Schema for custom Lists
const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);

// Creating documents for default items

const item1 = new Item({
    name: "Sample Item 1"
  });

const item2 = new Item({
    name: "Sample Item 2"
  });

const item3 = new Item({
    name: "Sample Item 3"
  });

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

// const day = date.getDate();



Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    // insertMany has two arguments: What, Callback IF err
    Item.insertMany(defaultItems, function(err){
    if(err) console.log(err);
    });
    res.redirect("/");
  }
  else res.render("list", {listTitle: "Today!", newListItems: foundItems});
    
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listTitle === "Today"){
    // Shortcut to add item
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listTitle}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err) console.log("Successfully deleted");
      res.redirect("/");
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

  
})

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList)
      {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
          list.save();
          res.redirect("/" + customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }
  })

  


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started!");
});
