const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

    title:{
        type:String,
        required:[true, "please add title for review"],
        trim:true,
        maxlength:100
    },
    text:{
        type: String,
        required:[true, "Please add sime text"],
        trim:true
    },
    rating:{
        type: Number,
        min:1,
        max:10,
        required:[true, "Please add rating between 1 and 10"],
        trim:true
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

//Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({bootcamp:1,user:1},{unique:true})

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(bootcampId){

    const obj = await this.aggregate([
        {
            $match: {bootcamp:bootcampId}
        },
        {
            $group:{
                _id:'$bootcamp',
                averageRating: {$avg:'$rating'}
            }
        }
    ])
   
    try {
        await this.model('bootcamps').findByIdAndUpdate(bootcampId,{
            averageRating: obj[0].averageRating
        })
    } catch (err) {
        console.err(err)
    }
}

//Get averageCost after save
ReviewSchema.post('save', async function (){
 this.constructor.getAverageRating(this.bootcamp)
})

//Get averageCost before remove
ReviewSchema.pre('remove', async function (){
    this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model("reviews", ReviewSchema)