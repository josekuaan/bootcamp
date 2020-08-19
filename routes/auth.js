const express = require("express")

const { register, login, getme, forgotPassword,resetPassword,updateDetails,updatePassword,logout } = require("../controller/auth")
const { protect } = require("../middleware/auth")


const Router = express.Router()

Router.post("/register", register )
Router.post("/login", login )
Router.post("/forgotpassword", forgotPassword )
Router.get("/me", protect, getme )
Router.get("/logout", protect, logout )
Router.put("/resetpassword/:resettoken", resetPassword )
Router.put("/updatedetails",protect, updateDetails )
Router.put("/updatepassword",protect, updatePassword )
 
module.exports = Router;