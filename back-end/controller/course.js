
const Course = require("../model/Course")
const Bootcamp = require("../model/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")


//@desc    Get all courses
//@route   GET /api/v1/course
//@route   GET /api/v1/bootcamps/:bootcampId/courses
//@access  Public
exports.getCourses = asyncHandler( async (req,res,next) =>{

    let query;
    
    if(req.params.bootcampId){
      
        query =  Course.find({ bootcamp: req.params.bootcampId })
        // if( !query ) return next( new ErrorResponse(`Could not found a match to your search`, 404))

    }else{

        query =  Course.find().populate({
            path:'bootcamp',
            select:'name description'
        }) 
    }
    const courses = await query; 

   return res.status(201).json({success:true,count:courses.length,data:courses})
})

//@desc    Get single course
//@route   GET /api/v1/course/:id
//@access  Private
exports.getCourse = asyncHandler( async (req,res,next) =>{

   const course = await  Course.findById(req.params.courseId).populate({
       path:'bootcamp',
       select:'name description'
   })
if(!course) return  next( new ErrorResponse(`No Course match this ${req.params.courseId}`, 404))
   return res.status(201).json({success:true,data:course})
})
//@desc    Create course
//@route   POST /api/v1/bootcamp/:bootcampId/course
//@access  Private
exports.createCourse = asyncHandler( async (req,res,next) =>{

    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById( req.params.bootcampId )
    if(!bootcamp) return  next( new ErrorResponse(`No Bootcamp with this ${req.params.courseId}`, 404))
    
    // Make sure user is course owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
        return next( new ErrorResponse(`This user is not authorize to add a to this ${bootcamp._id}`, 401))
    }
    const course = await  Course.create( req.body)
    return res.status(201).json({success:true,data:course})
 })

//@desc    Update course
//@route   PUT /api/v1/course/:id
//@access  Private
exports.updateCourse = asyncHandler( async (req,res,next) =>{

    let course = await  Course.findById( req.params.courseId)
    if( !course ) return next( new ErrorResponse(`Course with id of ${req.params.courseId} not found`, 404))
    
    // Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== "admin"){
        return next( new ErrorResponse(`This user is not authorize to modify this course`, 401))
    }

     course = await Course.findByIdAndUpdate(req.params.courseId, req.body,{
        new:true,
        runValidator:true
    })
     
    return res.status(201).json({success:true,data:course})
 })

//@desc    Delete course
//@route   DELETE /api/v1/course/:id
//@access  Private
exports.deleteCourse = asyncHandler( async (req,res,next) =>{

    let course = await  Course.findById( req.params.courseId )
    if(!course) return next( new ErrorResponse(`Course with id of ${req.params.courseId} not found`, 404))
      
    // Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== "admin"){
        return next( new ErrorResponse(`This user is not authorize to delete this course`, 401))
    }
    await  course.remove()
    return res.status(201).json({success:true,data:{}})
 })