const User = require("../model/User")
const asyncHandler = require("./async")
const ErrorResponse = require("../utils/errorResponse")
const jwt = require("jsonwebtoken")




exports.protect = asyncHandler( async (req,res,next) => {

let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    //  


    //Make sure token exist
   try {

    if(!token){
        return next( new ErrorResponse('Not authorized to access this route', 401))
    }
   
    const decoded = jwt.verify(token, process.env.JWT_SECRETE)
   
     req.user = await User.findById( decoded.id )
     
    next()
   } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
   }
})

//Grant access to specific role
exports.authorize = (...roles) => {
    
    return (req,res,next) =>{
      
        if(!roles.includes(req.user.role)){
           
            return next(new ErrorResponse(`A ${req.user.role} is not authorized to use this route`, 401))
        }
        next()
    }
}