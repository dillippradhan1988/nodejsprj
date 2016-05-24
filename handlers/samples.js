exports.jqueryTest = function(req, res){
	res.render('samples/jquery-test',{
		layout:'sectionheadjquery'
	});
};

exports.jqfileupload = function(req, res){
	res.render('samples/jqfileupload',{
		layout:'sectionheadjquery'
	});
};

exports.nurseryRhyme = function(req, res){
	res.render('samples/nursery-rhyme',{
		layout:'sectionheadjquery'
	});
};

exports.nurseryRhymeData = function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
};

exports.epicFail = function(req, res){
    process.nextTick(function(){
        throw new Error('Kaboom!');
    });
};