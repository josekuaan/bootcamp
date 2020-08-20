const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "please add name"],
        trim:true
    },
    email:{
        type:String,
        required:[true, "Please add an email"],
        unique:true,
        match:[/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 
        "please provide a valid email"]
    },
    role:{
        type:String,
        required:true,
        enum:["user", "publisher"],
        default:"user"
    },
    password:{
        type:String,
        required:[true, "please add a password"],
        select:false,
        minlength:6
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
})

// Encript password
UserSchema.pre("save", async function (next) {
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// generate sign in token
UserSchema.methods.getsignedinToken = function(next){
    return jwt.sign({id:this._id}, process.env.JWT_SECRETE,{
        expiresIn:process.env.JWT_EXPIRE
    })
    next()
}

//Match user entered password to hash password from database
UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
    
}

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {

    //Generate token
    const resetToken = crypto.randomBytes(20).toString('hex')

    //hash token and set to resetpasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
    return resetToken;
}
module.exports = mongoose.model("User", UserSchema)