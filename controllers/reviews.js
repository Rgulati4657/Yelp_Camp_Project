const Campground = require('../models/camground');
const Review = require('../models/review');

module.exports.createReview = async( req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // console.log(campground)
    // console.log(review)
    review.author = req.user._id;
    campground.reviews.push(review);
    // res.send("You Made It !!! ");
    await review.save();
    await campground.save();
    req.flash('success','Thankyou for giving review');
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
// res.send("delete me");
req.flash('success','Successfully Removed !!!');
res.redirect(`/campgrounds/${id}`);
} 