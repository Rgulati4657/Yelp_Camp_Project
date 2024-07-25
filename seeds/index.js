const mongoose = require('mongoose');
const Campground = require('../models/camground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error"));
db.once('open',()=>{
    console.log('Database Connected');
});

const sample = (array) =>array[Math.floor(Math.random() * array.length)];

// delete krega then new instance bnadega
const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<=300;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) +10;
        const camp = new Campground({
            author:'668b4526c00bfc02f233c84d',
            location : `${cities[random1000].city} , ${cities[random1000].state}`,
            title :`${sample(descriptors)} ${sample(places)}`,
            description : 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus similique in quibusdam hic error dicta sunt porro consectetur tenetur optio, soluta saepe exercitationem praesentium harum mollitia delectus, aliquid neque! Recusandae laborum voluptates quidem unde?',
            price,
            geometry: {
                type: 'Point',
                coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
              },
            images:[
                {
                    url: 'https://res.cloudinary.com/dwmlblgvk/image/upload/v1720772953/YelpCamp/um9iimmji2qn81qqw364.jpg',
                    filename: 'YelpCamp/um9iimmji2qn81qqw364',
                  },
                  {
                    url: 'https://res.cloudinary.com/dwmlblgvk/image/upload/v1720772964/YelpCamp/ebcrrb2eq0vpxtrhc5fh.jpg',
                    filename: 'YelpCamp/ebcrrb2eq0vpxtrhc5fh',
                  }
              
            ]
            });
            await camp.save();
    }
}
 seedDB();

 seedDB().then(()=>{
    mongoose.connection.close();
 })
