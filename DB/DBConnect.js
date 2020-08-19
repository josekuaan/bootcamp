const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path:"../config/config.env" });

let url;
if(process.env.NODE_ENV === "development"){
    url = "mongodb://localhost:27017/devcamper2"
}else{
   url=process.env.MONGODB_URI
}

  
     
const connectDB = async () =>{
   const conn = await mongoose.connect(url, {
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true 
    })
    console.log(`db connected to ${conn.connection.host}`)
}      


module.exports = connectDB;