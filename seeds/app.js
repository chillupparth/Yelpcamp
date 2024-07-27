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
        const random20 = Math.floor(Math.random() * 20);
        const price = Math.floor(Math.random() * 1000) + 500;
        const camp = new Campground({
            author: "64870bfe2dcea77a01e58c27",
            location: `${cities[random20].city}, ${cities[random20].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random20].longitude,
                    cities[random20].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dh4eovvec/image/upload/v1690126115/Yelpcamp/snw3offbfwzsro8alxdw.jpg',
                    filename: 'Yelpcamp/snw3offbfwzsro8alxdw',
                },
                {
                    url: 'https://res.cloudinary.com/dh4eovvec/image/upload/v1690698648/Yelpcamp/y5wmspsfr2tyhsiwx5zg.jpg',
                    filename: 'Yelpcamp/y5wmspsfr2tyhsiwx5zg',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Successfully seeded");
})