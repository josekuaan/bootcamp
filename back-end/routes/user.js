const express = require("express")

const { getAllUsers, getSingleUser, createUser,updateUser,deleteUser } = require("../controller/user")
const { protect,authorize } = require("../middleware/auth")



const Router = express.Router()

Router.use(protect)
Router.use(authorize('admin'))

Router.route("/").post( createUser ).get( getAllUsers )

Router.route("/:id").get( getSingleUser ).put( updateUser ).delete( deleteUser )

 
module.exports = Router;