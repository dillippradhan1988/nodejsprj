module.exports = {
	checkWaivers: function(req, res, next){
		//console.log("/lib-checkWaivers"+req.session.cart);
		var cart = req.session.cart;
		if(!cart) return next();
		if(cart.some(function(item){ /*console.log(item.product.requiresWaiver);*/return item.product.requiresWaiver; })){
			if(!cart.warnings) cart.warnings = [];
			cart.warnings.push('One or more of your selected tours requires a waiver.');
		}
		next();
	},

	checkGuestCounts: function(req, res, next){
		//console.log("/lib-checkGuestCounts"+req.session.cart);
		var cart = req.session.cart;
		if(!cart) return next();
		if(cart.some(function(item){ /*console.log(item.guests+"++"+item.product.maximumGuests);*/return item.guests > item.product.maximumGuests; })){
			if(!cart.errors) cart.errors = [];
			cart.errors.push('One or more of your selected tours cannot accmodate the ' +
				'number of guests you have selected.');
		}
		next();
	}
};