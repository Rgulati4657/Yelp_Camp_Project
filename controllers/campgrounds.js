const Campground = require('../models/camground');
const { cloudinary } = require('../cloudinary');

const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm =  (req,res)=>{
    
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res,next)=>{
    const geoData = await maptilerClient.geocoding.forward(
        req.body.campground.location, 
        { limit: 1}
    );

    // console.log('lets see ')
    // console.log(req.body);
    // try {
        // if(!req.body.campground)throw new ExpressError('Invalid Campground  data' , 400);
        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.features[0].geometry;
        campground.images = req.files.map(f => ({url: f.path,filename: f.filename}));
        campground.author= req.user._id;
        await campground.save();
        console.log(campground);

        req.flash('success' , 'Succesfully made a new campground !!');
        res.redirect(`/campgrounds/${campground._id}`);
    // } catch (e) {
    //     next(e);
    // }
}

module.exports.showCampground = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path:'reviews',
    populate:{
        path:'author'
    }
}).populate('author');

    console.log(campground);
    // console.log("looking  on campgrounds");
    // console.log(campgrounds);
if(!campground){
    req.flash('error','Unavailable campground !!!');
   return res.redirect('/campgrounds');
}

    res.render('campgrounds/show', {campground});
}

module.exports.editForm = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Unavailable campground !!!');
       return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground = async (req,res)=>{
    // res.send("it worked"); 
    const {id} = req.params;
    console.log(req.body);
   const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground }, {new:true});

   const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
campground.geometry = geoData.features[0].geometry;

   const imgs = req.files.map(f => ({url: f.path,filename: f.filename}));
   campground.images.push(...imgs); // push because adding not overriding
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
        }

       await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages }}}});
       console.log(campground);
    }
   await campground.save();
   req.flash('success','Successfully updated campground');
        res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully removed campground');
    res.redirect('/campgrounds');
    
}