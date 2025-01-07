var express = require('express');
var router = express.Router();
const mongoose=require("mongoose")
// console.log("dfhvhsdj") 
const d1=async()=>{

    await mongoose.connect("mongodb://localhost:27017/project1")
    
  
}
d1()
module.exports=d1


