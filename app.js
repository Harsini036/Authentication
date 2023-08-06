//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const encrypt = require("mongoose-encryption");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
const port = 3000;


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

main().catch(err => console.log(err));
console.log(process.env.SECRET);
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}
 
// Creating a schema (similar to collection)
const usersSchema = new mongoose.Schema({
  username : String,
  password : String
});
//creating a new constant for encrypting our data.
/* const secret = "Thisisourlittlesecret.";
usersSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password'] }); */
usersSchema.plugin(mongooseFieldEncryption, {
  fields: ["password"],
  secret: process.env.SECRET,
  saltGenerator: function (secret) {
    return "1234567890123456"; 
  },
});
 
// Creating a model under the schema//
const User = mongoose.model("User", usersSchema);
 


//mongoose will encrypt data when save() is called and decrypt when find() is called
const user1 = new User ({
  username : "Neo",
  password : "Neo"
});
//user1.save();

app.get("/",(req,res)=>{
 res.render("home");
});

app.get("/register",(req,res)=>{
res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/register",(req,res)=>{
  const newUser = new User({
    username : req.body.username,
    password : req.body.password
  });
  newUser.save()
  .then(success=>{
    if(success)
    console.log("User saved successfully");
    res.render("secrets");
  })
  .catch(err=>{
    console.log(err);
  });
});

app.post("/login",(req,res)=>{
    const username1 = req.body.username;
    const password1 = req.body.password;
    User.findOne({username : username1})
    .then(foundUser=>{
        if(foundUser){
            if(password1 === foundUser.password)
            res.render("secrets");
        }
        else{
            res.send("password doesn't match! Renter correct password");
        }
    })
    .catch(err=>{
        console.log(err);
    })
});
app.listen(port,()=>{
console.log(`server started listening to port ${port}`);
});