
const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    // console.log(registeredUser);
    // here we want if user register then automatically establish session for login so lets do it
    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome to YelpCamp");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }

  // res.send(req.body);
};
module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
    }

module.exports.login = async(req,res)=>{
    // console.log('locals :',req.locals.returnTo);
req.flash('success','welcome back!');

const redirectUrl = res.locals.returnTo || '/campgrounds';
delete req.session.returnTo;
res.redirect(redirectUrl);
}

module.exports.logout =  (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}