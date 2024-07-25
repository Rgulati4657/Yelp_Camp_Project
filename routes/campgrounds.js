const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/camground');
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary')
// const upload = multer({dest: 'uploads/'});
const upload = multer({storage});

const campgrounds = require('../controllers/campgrounds');
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post( isLoggedIn,upload.array('image'), validateCampground ,catchAsync( campgrounds.createCampground));
    // .post(upload.array('image'),(req,res)=>{
    //     // res.send({body:req.body,file:req.files});
    //     console.log({body:req.body,file:req.files});
    //     res.send("It Worked");
    // })
    //  file - > files
// we use upload.single for a single pic we can use array like upload.array

// we can do that with try catch but for enhancing lets use utility...


//  creating new camground 
router.get('/new',isLoggedIn,campgrounds.renderNewForm)

// show
router.route('/:id')
.get(catchAsync( campgrounds.showCampground))
.put( isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync( campgrounds.updateCampground))
.delete( isLoggedIn,isAuthor,catchAsync( campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn,isAuthor,catchAsync( campgrounds.editForm))
module.exports = router;
