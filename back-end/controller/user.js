
const asyncHandler = require("../middleware/async")
const User = require("../model/User")
const sendEmail = require('../utils/sendEmail')
const ErrorResponse = require("../utils/errorResponse")


//@desc    Get all user
//@route   GET /api/v1/auth/users
//@access  Private/admin
exports.getAllUsers = asyncHandler( async (req, res, next) =>{
    
    const user = await User.find()
    if(!user) return next(new ErrorResponse('user not found', 400))
    res.status(200).json({success:true,count:user.length,data:user})
    next()
    
})

//@desc    Get single user
//@route   GET /api/v1/auth/users/:id
//@access  Private/admin
exports.getSingleUser = asyncHandler(async (req, res, next) =>{
    
    const user = await User.findById(req.params.id)
    if(!user) return next(new ErrorResponse('user not found', 400))
    res.status(200).json({success:true,data:user})
    next()
    
})

//@desc    Post user
//@route   POST /api/v1/auth/users
//@access  Private/admin
exports.createUser = asyncHandler(async (req, res, next) =>{
    
    const user = await User.create(req.body)
    res.status(200).json({success:true,data:user})
    next()
    
})

//@desc    Update a user
//@route   PUT /api/v1/auth/users/:id
//@access  Private/admin
exports.updateUser = asyncHandler(async (req, res, next) =>{
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    })
    res.status(200).json({success:true,data:user})
    next()
    
})

//@desc    Delete a user
//@route   DELETE /api/v1/auth/users/:id
//@access  Private/admin
exports.deleteUser = asyncHandler(async (req, res, next) =>{
    
    const user = await User.findByIdAndDelete(req.params.id)
    res.status(200).json({success:true,data:{}})
    next()
    
})