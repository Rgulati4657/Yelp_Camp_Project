if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

// console.log(process.env.SECRET);
// console.log(process.env.ApiKey);
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
// const Joi  = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

//router work
const userRoutes = require('./routes/users')
const campgroundRoutes =  require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
// const { MongoStore } = require('connect-mongo');
// const MongoStore = require('connect-mongo');
const MongoDBStore = require("connect-mongo")(session);

// const dbUrl = process.env.DB_URL;
const dbUrl =  process.env.DB_URL ||'mongodb://127.0.0.1:27017/yelp-camp';
// 'mongodb://127.0.0.1:27017/yelp-camp'
// mongoose.connect(dbUrl)
mongoose.connect(dbUrl)
const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error"));
db.once('open',()=>{
    console.log('Database Connected');
});


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize({
    replaceWith: '_'
})); 

// static content like we added validation in boiler plate first lets configure to well structure in public folder
app.use(express.static(path.join(__dirname,'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*3600
});
// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     touchAfter: 24 * 60 * 60,
//     crypto: {
//         secret: 'thisshouldbeabettersecret'
//     }
// });

store.on("error" ,function (e){
    console.log("Session Store Error");
} )

// session
const sessionConfig = {
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,   // just xtra security // default
        // secure:true,
        expires: Date.now() + 1000*60*60*24*7,    // today date in milisecond + millisecond*second*minute*hr*days = week
        maxAge: 1000*60*60*24*7,
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet(
    // {
//     contentSecurityPolicy:false
// }
));

const scriptSrcUrls = [
"https://stackpath.bootstrapcdn.com",
"https://kit.fontawesome.com",
"https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdeliver.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://cdn.maptiler.com",
];
const connectSrcUrls = [
   "https://api.maptiler.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwmlblgvk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
                "https://cdn.maptiler.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




//passport intialize
// recommended session should be written before passport....
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // entering into session / store it
passport.deserializeUser(User.deserializeUser()); // removing out of session

app.use((req,res,next)=>{
    // console.log(req.session);
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})




// pracitce on Userdata first
// app.get('/fakeUser',async (req,res)=>{
//     const user = await new User({email:'coltttt@gmail.com',username:'colt'});
//     const newUser = await User.register(user,'chicken'); // passport method for password
//     res.send(newUser);
// })


// let's use the path of router of campground path here
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);


app.get('/',(req,res)=>{
    res.render('home');
})
 // moved campgrounds paths to router files
// moved reviews to router...
app.all('*',(req,res,next)=>{
    // res.send("404!!!!!!!");
    next(new ExpressError('Page Not Found !!',404))
})

// generic validation
app.use((err,req,res,next)=>{
    // const {statusCode= 500 , message = 'Something went wrong'} = err;
    // we can handle the things like that to
    const {statusCode= 500 } = err;
    if(!err.message)message = 'Something went wrong';
    res.status(statusCode).render('error',{err});
})


app.listen(3000,(req,res)=>{
    console.log("SERVING ON PORT #3000");
})
