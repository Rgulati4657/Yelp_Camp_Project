
const {campgroundSchema,reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/camground');
const Review = require('./models/review');

// module.exports.isLoggedIn = (req,res,next)=>{
//     console.log("REQ.USER...",req.user);
//     if(!req.isAuthenticated()){
//         // store the url they are requesting!!
//         req.session.returnTo = (req.query._method === 'DELETE' ? `/campgrounds/${id}` : req.originalUrl);   // modified line 
//         // console.log("path: ", req.path, "Ourl:",req.originalUrl);
//         req.flash('error','You must be signed in');
//        return res.redirect('/login');
//     }
//     next();
// }
// modified below 

module.exports.isLoggedIn = (req, res, next) => {
    const { id } = req.params;
    if (!req.isAuthenticated()) {
      req.session.returnTo = (req.query._method === 'DELETE' ? `/campgrounds/${id}` : req.originalUrl);
      req.flash("error", "You must be signed in first!");
      return res.redirect("/login");
    }
    next();
  };

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        // console.log(res.session.returnTo);
        // console.log("locals :" ,res.locals.returnTo);
    }
    next();
}

// validation
module.exports.validateCampground = (req,res, next) =>{
    
    const {error} = campgroundSchema.validate(req.body);
        // console.log(result);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
        
}

module.exports.isAuthor = async (req,res,next) =>{
    const{id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
    req.flash('error','You do not have permissions to do that! ');
    return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async (req,res,next) =>{
    const{id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
    req.flash('error','You do not have permissions to do that! ');
    return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}