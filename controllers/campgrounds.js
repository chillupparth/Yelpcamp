const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


module.exports.index = async (req, res) => {
    const { location, minPrice, maxPrice } = req.query;
    let filters = {};
    let query = {};

    // Apply filtering based on location
    if (location) {
        query.location = new RegExp(location, 'i');
        filters.location = location;
    }

    // Apply filtering based on minimum price
    if (minPrice) {
        query.price = { ...query.price, $gte: minPrice }; 
        filters.minPrice = minPrice;
    }

    // Apply filtering based on maximum price
    if (maxPrice) {
        query.price = { ...query.price, $lte: maxPrice };
        filters.maxPrice = maxPrice;
    }

    // Fetch campgrounds based on the query
    const campgrounds = await Campground.find(query);

    // Render the filtered campgrounds and pass the current filters to the view
    res.render('campgrounds/index', { campgrounds, filters });    
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save()
    req.flash('success', 'Successfully made a campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const fcamp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!fcamp) {
        req.flash('error', 'Cannot find campground !')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/info', { fcamp })
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground },)
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Campground !')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}