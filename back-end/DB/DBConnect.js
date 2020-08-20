const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path:"../config/config.env" });



const url = "mongodb://localhost:27017/devcamper2";
     
const connectDB = async () =>{
   const conn = await mongoose.connect(process.env.URL, {
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true 
    })
    console.log(`db connected to ${conn.connection.host}`)
}      


module.exports = connectDB;