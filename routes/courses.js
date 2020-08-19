const express = require("express")

const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require("../controller/course")
const { protect, authorize } = require("../middleware/auth")

const Router = express.Router( {mergeParams: true})

Router.route('/').get( getCourses ).post( protect, authorize('publisher', 'admin'), createCourse )
Router.route('/:courseId').get( getCourse ).put(protect,authorize('publisher', 'admin'), updateCourse ).delete(protect,authorize('publisher', 'admin'), deleteCourse )



module.exports = Router;