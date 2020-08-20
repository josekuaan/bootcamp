
const path = require("path")
const Bootcamp = require("../model/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")
const geocoder = require("../utils/geocoder")
const asyncHandler = require("../middleware/async")

//@desc    Get all bootcamps
//@route   GET /pi/v1/bootcamp
//@access  Public
exports.getbootCamps = asyncHandler( async ( req,res,next) => {
        
    let query;

    //Make a copy of req
    reqQuery = { ...req.query}
   
    //Fields to  exclude
    const removeFields = ['select','sort','limit','page'];
    //Loop over query and remove field
    removeFields.forEach(param => delete reqQuery[param])
    
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    query = Bootcamp.find( JSON.parse(queryStr) ).populate("courses")

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }
    if(req.query.sort){
        const fields = req.query.sort.split(',').join(' ')
        query = query.sort(fields)
    }else{
        query = query.sort('-createdAt')
    }
    
    //Pagination
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;

    const startIndex = ( page -1 ) * limit;

    query = query.skip( startIndex ).limit( limit );
      const endIndex = page * limit;
      const total = await Bootcamp.countDocuments()

      const pagination = {};

      if(endIndex < total){
          pagination.next = {
              page:page + 1,
              limit
          }
      }

      if(startIndex > 0 ){
          pagination.prev = {
                page: page - 1,
                limit
          }
      }
    //Executing query
    const bootcamps = await query;
        
    return res.status(201).json({sucess:true,pagination,count:bootcamps.length,data:bootcamps})
        
        
}) 

//@desc    Get single bootcamp
//@route   GET /pi/v1/bootcamp/:id
//@access  Private
exports.getbootCamp = asyncHandler(async ( req,res,next) => {
       
            const bootcamp = await Bootcamp.findById(req.params.id)

            if(!bootcamp) return next( new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404))
           
            return  res.status(201).json({sucess:true,data:bootcamp})
        
     
})

//@desc    Post a bootcamps
//@route   POST /api/v1/bootcamp
//@access  Private
exports.postbootCamp = asyncHandler(async (req,res,next) =>{
       //Add user id
        req.body.user = req.user.id
        //Check for published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({user:req.user._id})
        //If the user is not an admin, they can only add one bootcamp
        if( publishedBootcamp && req.user.role !== "admin"){
           
           return  next( new ErrorResponse(`The user with id ${req.user.id} can only published one bootcamp`, 400))
        }
        const bootcamp = await Bootcamp.create(req.body)
        return res.status(201).json({sucess:true,data:bootcamp});
   

})

//@desc    Update a bootcamps
//@route   PUT /api/v1/bootcamp/:id
//@access  Private
exports.updatebootCamp = asyncHandler(async (req,res,next) =>{
   
        let bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp) return next( new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404))

        // Make sure the owner of bootcamp id the only person to update bootcamp
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
            return next( new ErrorResponse(`This user is not authorize to modify this bootcamp`, 401))
        }
        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        return res.status(201).json({sucess:true,data:bootcamp});

})

//@desc    Delete a bootcamps
//@route   DELETE /api/v1/bootcamp/:id
//@access  Private
exports.deletebootCamp = asyncHandler(async (req,res,next) =>{
 
    const bootcamp = await Bootcamp.findById(req.params.id)
    
    if(!bootcamp) return next( new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404))

    // Make sure the owner of bootcamp id is the only person to delete bootcamp
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
        return next( new ErrorResponse(`This user is not authorize to modify this bootcamp`, 401))
    }
    bootcamp.remove(); 
    return res.status(200).json({sucess:true,data:{}});
 
})

//@desc    Get bootcamps within a radius
//@route   GET /api/v1/bootcamp/:radius/:distance
//@access  Private
exports.getbootcampsInRadius = asyncHandler(async (req,res,next) =>{
 
    const { zipcode, distance} = req.params;

    // Get lng an lat from geocoder

    const loc = await geocoder.geocode( zipcode)
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        // Cal radius 
        // Divide the distance by the radius of earth
        //Earth radius 6,963mi
        const radius = distance / 6963
    
        const bootcamps = await Bootcamp.find({
            location:{ $geoWithin: { $centerSphere:[ [ lng, lat], radius] }}
        })
        res.status(200).json({
            sucess:true,
            count:bootcamps.length,
            data:bootcamps
        })
})

//@desc    Upload bootcamp photo
//@route   PUT /api/v1/bootcamp/:id/photo
//@access  Private
exports.uploadBootcampPhoto = asyncHandler(async (req,res,next) =>{
   
    const bootcamp = await Bootcamp.findById(req.params.id,)

    if(!bootcamp) return next( new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404))

    // Make sure the owner of bootcamp id the only person to update bootcamp
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
        return next( new ErrorResponse(`This user is not authorize to modify this course`, 401))
    }
   if(!req.files) return next( new ErrorResponse(`please upload a file`, 400))
    
   const file = req.files.file;
   if(!file.mimetype.startsWith('image'))  return next( new ErrorResponse(`please upload an image file`, 400))
   
   //Chech file size
   if(file.size > process.env.MAX_FILE_UPLOAD) return next( new ErrorResponse(`Upload image less than ${process.env.MAX_FILE_UPLOAD}`, 400))

//Create a customer file name
file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
    if(err){
        console.error(err)
        return next( new ErrorResponse(`problem uploading file`, 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {photo:file.name})
    res.status(200).json({ sucess:true, photo:file.name})
})

})