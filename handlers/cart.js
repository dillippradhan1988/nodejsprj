var Vacation 		= require('../models/vacation.js');
var Q 				= require('q');
var	emailService 	= require('../lib/email.js')(require('../credentials.js'));

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// deserializes cart items from the database
exports.middleware = function(req, res, next){
	var cart = req.session.cart;
	if(!cart || !cart.items) return next();
	req.cart = {
		items: cart.items.map(function(item){
			return {
				guests: item.guests,
				sku: item.sku,
			};
		})
	};
	var promises = req.cart.items.map(function(item){
		return Q.Promise(function(resolve, reject){
			Vacation.findOne({ sku: item.sku }, function(err, vacation){
				if(err) return reject(err);
				item.vacation = vacation;
				resolve();
			});
		});
	});
	Q.all(promises)
		.then(function(){
			next();
		})
		.catch(function(err){
			next(err);	
		});
};

function Product(){
}
Product.find = function(conditions, fields, options, cb){
	if(typeof conditions==='function') {
		cb = conditions;
		conditions = {};
		fields = null;
		options = {};
	} else if(typeof fields==='function') {
		cb = fields;
		fields = null;
		options = {};
	} else if(typeof options==='function') {
		cb = options;
		options = {};
	}
	
	var products = [
		{
			name: 'Hood River Tour',
			slug: 'hood-river',
			category: 'tour',
			maximumGuests: 15,
			sku: 723,
		},
		{
			name: 'Oregon Coast Tour',
			slug: 'oregon-coast',
			category: 'tour',
			maximumGuests: 10,
			sku: 446,
		},
		{
			name: 'Rock Climbing in Bend',
			slug: 'rock-climbing/bend',
			category: 'adventure',
			requiresWaiver: true,
			//requiresWaiver: false,
			maximumGuests: 4,
			sku: 'B99',
		}
	];
	cb(null, products.filter(function(p) {
		if(conditions.category && p.category!==conditions.category) return false;
		if(conditions.slug && p.slug!==conditions.slug) return false;
		if(isFinite(conditions.sku) && p.sku!==Number(conditions.sku)) return false;
		return true;
	}));
};
Product.findOne = function(conditions, fields, options, cb){
	if(typeof conditions==='function') {
		cb = conditions;
		conditions = {};
		fields = null;
		options = {};
	} else if(typeof fields==='function') {
		cb = fields;
		fields = null;
		options = {};
	} else if(typeof options==='function') {
		cb = options;
		options = {};
	}
	
	Product.find(conditions, fields, options, function(err, products){
		cb(err, products && products.length ? products[0] : null);
	});
};
exports.requestGroupRate = function(req, res, next){
	res.render('contact/request-group-rate',{
		layout:'sectionheadjquery'
	});
};
exports.tours = function(req, res, next){
	Product.findOne({ category: 'tour', slug: req.params.tour }, function(err, tour){
		if(err) return next(err);
		if(!tour) return next();
		res.render('tour', { tour: tour });
	});
};
exports.adventures = function(req, res, next){
	Product.findOne({ category: 'adventure', slug: req.params.subcat + '/' + req.params.name  }, function(err, adventure){
		if(err) return next(err);
		if(!adventure) return next();
		res.render('carts/adventure', { adventure: adventure});
	});
};

function addToCart(sku, guests, req, res, next){
	console.log(sku+"++"+guests);
	var cart = req.session.cart || (req.session.cart = { items: [] });
	Product.findOne({ sku: sku }, function(err, vacation){
		if(err) return next(err);
		if(!vacation) return next(new Error('Unknown vacation SKU: ' + sku));
		cart.items.push({
			sku: sku,
			guests: guests || 1,
		});
		res.redirect(303, '/cart');
	});
}

exports.addProcessGet = function(req, res, next){
	addToCart(req.query.sku, req.query.guests, req, res, next);
};

exports.addProcessPost = function(req, res, next){
	addToCart(req.body.sku, req.body.guests, req, res, next);
};

exports.home = function(req, res, next){
	res.render('carts/cart', { cart: req.cart });
};

exports.checkout = function(req, res, next){
	var cart = req.session.cart;
	if(!cart) next();
	res.render('carts/cart-checkout');
};

exports.thankYou = function(req, res){
	res.render('carts/cart-thank-you', { cart: req.session.cart });
};

exports.emailThankYou = function(req, res){
	res.render('email/cart-thank-you', { cart: req.session.cart, layout: null });
};

exports.checkoutProcessPost = function(req, res){
	var cart = req.session.cart;
	if(!cart) next(new Error('Cart does not exist.'));
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) return res.next(new Error('Invalid email address.'));
	// assign a random cart ID; normally we would use a database ID here
	cart.number = Math.random().toString().replace(/^0\.0*/, '');
	cart.billing = {
		name: name,
		email: email,
	};
    res.render('email/cart-thank-you', 
    	{ layout: null, cart: cart }, function(err,html){
	        if(err) console.error('error in email template: ' + err.stack);
	        emailService.send(cart.billing.email,
	        	'Thank you for booking your trip with Meadowlark Travel!',
	        	html);
	    }
    );
    res.render('carts/cart-thank-you', { cart: cart });
};

exports.setCurrency = function(req,res){
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations');
};