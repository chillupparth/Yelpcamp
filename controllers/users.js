const User = require('../models/user');


module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username })
        const regUser = await User.register(user, password);
        req.login(regUser, (err) => {
            if (err) {
                return next(err)
            }
            req.flash("success", "Successfully registered !")
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Successfully logged in');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Logged out !')
        res.redirect('/campgrounds')
    })
}