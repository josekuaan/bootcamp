const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path")

//Load vars
dotenv.config({path:"./config/config.env"})

const Bootcamp = require("./model/Bootcamp")
const Course = require("./model/Course")
const User = require("./model/User")
const Review = require("./model/Review")

// Connect to DB
const url = "mongodb://localhost:27017/devcamper2";
mongoose.connect(url,{
    useNewUrlParser:true,
    useFindAndModify:false,
    useCreateIndex:true,
    useUnifiedTopology:true
})


//read json file
const bootcamps = JSON.parse(fs.readFileSync(path.join(`${__dirname}/__data/bootcamps.json`), "utf-8"))
const courses = JSON.parse(fs.readFileSync(path.join(`${__dirname}/__data/courses.json`), "utf-8"))
const users = JSON.parse(fs.readFileSync(path.join(`${__dirname}/__data/users.json`), "utf-8"))
const reviews = JSON.parse(fs.readFileSync(path.join(`${__dirname}/__data/reviews.json`), "utf-8"))

// Import bootcamp

const importData = async () =>{
    try {
        await User.create(users)
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await Review.create(reviews)
        console.log("data imported.....")
        process.exit()
    } catch (err) {
        console.error(err)
    }
}

const deleteData = async () =>{
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("data deleted.....")
        process.exit()
    } catch (err) {
        console.error(err)
    }
}

if(process.argv[2] === "-i"){
    importData()
}else if(process.argv[2] === "-d"){
  deleteData()
}