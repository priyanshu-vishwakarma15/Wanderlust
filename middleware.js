const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema ,  reviewSchema} = require("./schema.js");

// Check whether user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in to create listing!"
        );

        return res.redirect("/login");
    }

    next();
};


// Save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }

    next();
};


// Custom flash middleware
module.exports.flash = (req, res, next) => {

    req.flash = (type, message) => {

        if (!req.session.flash) {
            req.session.flash = {};
        }

        if (!req.session.flash[type]) {
            req.session.flash[type] = [];
        }

        req.session.flash[type].push(message);
    };

    res.locals.success = req.session.flash?.success || [];
    res.locals.error = req.session.flash?.error || [];

    delete req.session.flash;

    next();
};


module.exports.isOwner = async (req , res , next) => {
     let {id} = req.params;
    let listing = await Listing.findById(id);
    if( ! listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error" , "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.validateListing = (req , res , next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400,errMsg);
    } else{
        next();
    }
}; 

module.exports.validateReview = (req , res , next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(400,errMsg);
    } else{
        next();
    }
};



module.exports.isReviewAuthor = async (req , res , next) => {
     let {id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if( ! review.author.equals(res.locals.currUser._id)) {
        req.flash("error" , "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }

    next();
}