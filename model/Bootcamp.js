const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder")

const BootcampSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please add bootcamp name"],
        unique:true,
        maxlength:[50,"Name cannot be more than 50 characters"]
    },
    slug:String ,
    description:{
        type:String,
        required:[true, " Descript can not be empty"],
        maxlength:[500,"Description cannot be more than 50 characters"]

    },
    website:{
        type :{String,
        match:[ "/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/" ,
         "Please use a valid url, HTTPS or HTTP"]
        }
    },
    phone:{
        type:String,
        required:[true, "Number can not be more than 20 character"]
    },
    email:{
        type:String,
        required:[true, "Please address can not be empty"],
        match:[/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i, 
        "please provide a correct email"]
    },
    address:{
        type:String,
        required:[true, "Please address can not be empty"]
    },
    location:{
        //GoeJson Points
        type:{
            type:String,
            enum:["Point"],
            // required:true
        },
        coordinates:{
            type:[Number],
            // required:true,
            index:"2dsphere"
            
        },
        formattedAddress:String,
        street:String,
        city:String,
        state:String,
        zipcode:String,
        country:String
    },
    careers:{
        // Array of strings
        type:[String],
        required:[true, "select career"],
        enum:[
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Others"
        ]
    },
    averageRating:{
        type:Number,
        min:[1, "Rating must be aleast 1"],
        max:[10, "Rating cannot be more than 10"]
    },
    averageCost:Number,
    photo:{
        type:String,
        default:"no-photo.jpg"
    },
    housing:{
        type:Boolean,
        default:false
    },
    jobAsistance:{
        type:Boolean,
        default:false
    },
    jobGarantee:{
        type:Boolean,
        default:false
    },
    acceptGi:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default: Date.now()
    },
    
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
    

}, {
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// Create slug from name
BootcampSchema.pre("save", function(next){
    
    this.slug = slugify(this.name,{lower:true})
    next()
})

//Geocode and Create location
BootcampSchema.pre("save", async function(next){
   
const loc = await geocoder.geocode(this.address)
this.location = {
    type:'Point',
    coordinates:[loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state:loc[0].stateCode,
    zipcode:loc[0].zipcode,
    country:loc[0].countryCode
}


// Donnot save address in the DB
this.address = undefined
    next()
})

//Cascade delete courses when it voorcamp is deleted
BootcampSchema.pre('remove', async function (next){
    console.log("course removed")
    await this.model('courses').deleteMany({bootcamp: this._id})
    next()
})   

//Reverse populate with virtual
BootcampSchema.virtual('courses',{
    ref:'courses',
    localField:'_id',
    foreignField:'bootcamp',
    justOne: false
})
module.exports = mongoose.model("bootcamps", BootcampSchema)