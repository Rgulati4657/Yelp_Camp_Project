const express = require('express');
const router = express.Router({mergeParams: true}); // when we use routing it can't handle params like express if we want that it do we should mention mergerParams true because hume yeh campground ki id ko lene ke liye dikat aaraahi hai normal vali toh direct le paate hai
const {validateReview , isLoggedIn, isReviewAuthor } = require('../middleware.js');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/camground');
const Review = require('../models/review');

const reviews = require('../controllers/reviews')






router.post('/',isLoggedIn, validateReview ,catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview))


module.exports = router;