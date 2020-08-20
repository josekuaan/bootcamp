const Review = require("../model/Review")
const Bootcamp = require("../model/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")


//@desc    Get all review
//@route   GET /api/v1/reviews
//@route   GET /api/v1/bootcamps/:bootcampId/reviews
//@access  Public
exports.getReviews = asyncHandler( async (req,res,next) =>{

    let query;
    
    if(req.params.bootcampId){
      
        query =  Review.find({ bootcamp: req.params.bootcampId })
        // if( !query ) return next( new ErrorResponse(`Could not found a match to your search`, 404))

    }else{

        query =  Review.find().populate({
            path:'bootcamp',
            select:'name description'
        }) 
    }
    const reviews = await query; 

   return res.status(201).json({success:true,count:reviews.length,data:reviews})
})
//@desc    Get single review
//@route   GET /api/v1/reviews
//@route   GET /api/v1/reviews/:id
//@access  Private
exports.getReview = asyncHandler( async (req,res,next) =>{

 let reviews = await Review.findById( req.params.id).populate({
    path:'bootcamp',
    select:'name description'
}) 
    
 if( !reviews ) return next( new ErrorResponse(`No review found with that ${req.params.id}`, 404))
     reviews = await reviews; 

   return res.status(201).json({success:true,count:reviews.length,data:reviews})
})


//@desc    Create review
//@route   POST /api/v1/bootcamp/:bootcampId/reviews
//@access  Private
exports.addReview = asyncHandler( async (req,res,next) =>{
  
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    
    const bootcamp = await Bootcamp.findById( req.params.bootcampId )
    if(!bootcamp) return  next( new ErrorResponse(`No Bootcamp with the id ${req.params.bootcampId}`, 404))
  
    const review = await  Review.create( req.body)
    return res.status(201).json({success:true,data:review})
 })
 

 //@desc    Update review
//@route   PUT /api/v1/review/:reviewId
//@access  Private
exports.updateReview = asyncHandler( async (req,res,next) =>{

    let review = await  Review.findById( req.params.reviewId)
    if( !review ) return next( new ErrorResponse(`review with id of ${req.params.reviewId} not found`, 404))
    
    // Make sure user is admin or belong to user
    if(review.user.toString() !== req.user.id && req.user.role !== "admin"){ 
        return next( new ErrorResponse(`This user is not authorize to modify this review`, 401))
    }

    review = await Review.findByIdAndUpdate(req.params.reviewId, req.body,{
        new:true,
        runValidator:true
    })
     
    return res.status(201).json({success:true,data:review})
 })

//@desc    Delete review
//@route   DELETE /api/v1/review/:reviewId
//@access  Private
exports.deletereview = asyncHandler( async (req,res,next) =>{

    let review = await  Review.findById( req.params.reviewId )
    if(!review) return next( new ErrorResponse(`Review with id of ${req.params.reviewId} not found`, 404))
      
    // Make sure user is admin or belong to user
    if(review.user.toString() !== req.user.id && req.user.role !== "admin"){
        return next( new ErrorResponse(`This user is not authorize to modify this review`, 401))
    }
    await  review.remove()
    return res.status(201).json({success:true,data:{}})
 })