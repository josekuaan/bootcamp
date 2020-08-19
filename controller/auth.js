
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const User = require("../model/User")
const  crypto  = require("crypto")
const sendEmail = require('../utils/sendEmail')


//@desc    Register user
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = asyncHandler( async (req,res,next) =>{

    const { name,email, password, role } = req.body
   const user = await User.create({
    name,
    email,
    password,
    role
   })
   
   sendTokenResponse(user,200,res)
})

//@desc    Login user
//@route   POST /api/v1/auth/login
//@access  Public
exports.login = asyncHandler( async (req,res,next) =>{

    const { email, password } = req.body  
  
    //Validate email and password
    if(!email || !password){
        return next(new ErrorResponse('Please provide your email and password', 400))
    }
   let user = await User.findOne({email}).select('password')

    if(!user)  return next(new ErrorResponse('Invalid credential', 400))
    
    //check if password match
    const isMatch = await user.comparePassword(password)

    if(!isMatch) return next(new ErrorResponse('Invalid credential', 401))
    sendTokenResponse(user,200,res)
})

//

const sendTokenResponse = (user,statuscode,res) => {
    const token = user.getsignedinToken()

    const options ={
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }
    res.status(statuscode)
    .cookie('token',token,options)
    .json({sucess:true,token})
} 


//@desc    Get currently login user
//@route   Get /api/v1/auth/getme
//@access  Private
exports.getme = async (req, res, next) =>{
    
    const user = await User.findById(req.user.id)
    if(!user) return next(new ErrorResponse('user not found', 400))
    res.status(200).json({success:true,user})
    next()
    
}

//@desc    Get currently login user
//@route   Get /api/v1/auth/getme
//@access  Private
exports.logout = async (req, res, next) =>{
    
    res.cookie('token','none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly:true
    })
    res.status(200).json({success:true,data:{}})
    next()
    
}

//@desc    Update user
//@route   PUT /api/v1/auth/updateDetails/:id
//@access  Private
exports.updateDetails = async (req, res, next) =>{
    
    const fieldsToUpdate = {
        email:req.body.email,
        name:req.body.name
    }
    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new:true,
        runValidators:true
    })

    if(!user) return next(new ErrorResponse('user not found', 400))
    res.status(200).json({success:true,user})
    next()
    
}

//@desc    Update password
//@route   PUT /api/v1/auth/updatepassword
//@access  Private
exports.updatePassword = async (req, res, next) =>{
    
    const user = await User.findById(req.user.id).select('+password')

    //Check current password
    if(!(await user.comparePassword(req.body.currentpassword))) {
        return next(new ErrorResponse('Password is incorrect', 400))
    }
    
    user.password = req.body.newpassword
    await user.save()

    sendTokenResponse(user,200,res)
    
}
//@desc    Reset password 
//@route   PUT /api/v1/auth/resetPassword/:resettoken
//@access  Public
exports.resetPassword = async (req, res, next) =>{

    let resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
    
    let user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}   
            })
    if(!user) return next(new ErrorResponse('Invalid Token', 400))

    //Set new password
    user.password = req.body.password
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    //save user new password
    await user.save({validateBeforeSave:false})
    
    sendTokenResponse(user,200,res)
    
}

//@desc    Post forgot password
//@route   POST /api/v1/auth/forgotpassword
//@access  Private
exports.forgotPassword = async (req, res, next) =>{
    
    // console.log(req)
    // return
    const user = await User.findOne({email:req.body.email})

    console.log(req.body.email,user)
    if(!user) return next(new ErrorResponse('user not found', 400))
    //Get reset token
    const getResetToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave:false})
    //Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${getResetToken}`
    const message = `You are recieving this email because you (or someone else) has requested for a change of password.
    Please make a put to \n\n ${resetUrl}`

    try {
        await sendEmail({
            email:user.email,
            subject:'Password reset token',
           message:message
        })
        return res.status(200).json({success:true,data:'Email sent'})
    } catch (err) {
        console.log(err)
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined

        await user.save({validateBeforeSave:false})
        return next(new ErrorResponse(`Email could not be sent`, 500))
    }
    
}

  