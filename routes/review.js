const express = require("express")

const { getReviews,getReview,addReview,updateReview,deletereview } = require("../controller/review")
const { protect,authorize } = require("../middleware/auth")



const Router = express.Router({mergeParams: true})


Router.route("/").get( getReviews ).post(protect, authorize('user','admin'), addReview );
Router.route('/:id').get( getReview)
Router.route("/:reviewId")
.put( protect, authorize('user','admin'),updateReview )
.delete( protect, authorize('user','admin'),deletereview )

 
module.exports = Router;