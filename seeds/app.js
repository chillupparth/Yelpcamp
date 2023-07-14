const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const { places, descriptors } = require('./seedHelpers')

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp', { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected !");
})


const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 1000) + 500;
        const camp = new Campground({
            author: "64870bfe2dcea77a01e58c27",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dh4eovvec/image/upload/v1689340220/Yelpcamp/z6gdbfnftkfu1d9jzdkv.jpg',
                    filename: 'Yelpcamp/z6gdbfnftkfu1d9jzdkv',
                },
                {
                    url: 'https://res.cloudinary.com/dh4eovvec/image/upload/v1689340217/Yelpcamp/dmnayclagsrxcxj9qsbl.jpg',
                    filename: 'Yelpcamp/dmnayclagsrxcxj9qsbl',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})