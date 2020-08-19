const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan")
const fileupload = require("express-fileupload")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const xss = require('xss-clean')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')


const bootcamps = require("./routes/bootcamp")
const courses = require("./routes/courses")
const auth = require("./routes/auth")
const user = require("./routes/user")
const reviews = require("./routes/review")
const DBConnect = require("./DB/DBConnect")
const errorHandler = require("./middleware/error");


// Load Env Vars
dotenv.config({ path:"./config/config.env" });
// Initialize DB
DBConnect();

const app = express()

app.use(express.urlencoded({ extended: false }));
app.use(express.json()) 
app.use(cors());
app.use(cookieParser())


// To sanitize data
app.use(mongoSanitize());

// Prevent cross site scripting attacks
app.use(xss())

// Set security headers
app.use(helmet())

//  Rate Limiting
const limitter = rateLimit({
    windowMs:10 * 60 * 1000, // 10mins,
    max:100
})
app.use(limitter)
app.use(hpp())
// middlewares
if(process.env.NODE_ENV === "development") app.use(morgan("dev"))
 
 
// File Upload
app.use(express.static(path.join(__dirname,'public')))
app.use(fileupload())

// Mount Route
app.use("/api/v1/bootcamps", bootcamps)
app.use("/api/v1/courses", courses)
app.use("/api/v1/auth", auth)
app.use("/api/v1/user", user)
app.use("/api/v1/reviews", reviews)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen( PORT, () => {
    console.log(`app is up in ${process.env.NODE_ENV} mode in prot ${PORT}`)
})    
