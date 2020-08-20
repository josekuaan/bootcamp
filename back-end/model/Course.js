const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({

    title:{
        type:String,
        required:[true, "please add course title"],
        trim:true
    },
    description:{
        type: String,
        required:[true, "Please add description"],
        trim:true
    },
    weeks:{
        type: String,
        required:[true, "Please add number of weeks"],
        trim:true
    },
    tuition:{
        type: Number,
        required:[true, "Please add a tuition cost"],
        trim:true
    },
    minimumSkill:{
        type:String,
        required:[true, "Please add minimum skill"],
        trim:true,
        enum:['beginner','intermediate','advanced']
    },
    scholarShipAvailable:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type:Date,
        dafault:Date.now
    },
    bootcamp:{
        type: mongoose.Schema.ObjectId,
        ref:'bootcamps',
        required:true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
})

// Static method to get avg tuition cost
CourseSchema.statics.getAverageCost = async function(bootcampId){

    const obj = await this.aggregate([
        {
            $match: {bootcamp:bootcampId}
        },
        {
            $group:{
                _id:'$bootcamp',
                averageCost: {$avg:'$tuition'}
            }
        }
    ])
   
    try {
        await this.model('bootcamps').findByIdAndUpdate(bootcampId,{
            averageCost: Math.ceil(obj[0].averageCost)/10 * 10
        })
    } catch (err) {
        console.err(err)
    }
}

//Get averageCost after save
CourseSchema.post('save', async function (){
 this.constructor.getAverageCost(this.bootcamp)
})

//Get averageCost before remove
CourseSchema.pre('remove', async function (){
    this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model("courses", CourseSchema)