var Concepts 	 = require('./models/concepts.js');
var bcrypt		 = require('bcrypt');
var bcrypt_conf	 = require('../config/bcrypt.js');
var salt = bcrypt_conf.salt;
var validRanges = ['a', 'b', 'overall'];

module.exports = function(app) {

	app.get('/', function (req, res) {
  		res.send('CCTL API is running');
	});
	// =====================================
	// Concepts
	// =====================================

	// get all concepts
	app.get('/concepts', function(req, res) {
		Concepts.find(function(err, c){
			if(err) res.send(err);
			res.json(c);
		});
	});

	// get a specific concept
	app.get('/concepts/:id', function(req, res) {
		var id = req.params.id;
		Concepts.findById(id, function(err, conc) {
			if(err) res.send(err)
			res.send(conc);
		});
	});

	// create a new concept
	app.post('/concepts', function(req, res) {
		var concept = req.body.concept;
		var created = createConcept(concept);
		if(created) res.send(created);
		res.send("Concept already exists");
	});

	var createConcept = function(concept, res) {
		var id = getConceptId(concept.name);
		if (conceptExists(id)) return false;
		else {
			var diff = {overall : 0, a : 0, b : 0}
			Concepts.create({_id : id, name: concept.name, description : concept.description, difficulty: diff}, function(err, conc) {
			if(err) return err;
			return conc;
		});
		}
	}

	// updates a specific concept
	app.put('/concepts/:id', function(req, res) {
		var id = req.params.id;
		Concepts.findByIdAndUpdate(id, req.body, function(err, post){
			if(err) res.send(err);
			res.json(post);
		});
	});

	app.put('/concepts/increment/:id/:agerange', function(req, res) {
		var id = req.params.id;
		var range = req.params.agerange;
		if (isValidRange(range)) {
			Concepts.findById(id, function(error, conc) {
				var newDif = conc.difficulty;
				if(!String(range) != ('overall')) { newDif.overall++;}
				newDif[range]++;
				console.log(range);
				Concepts.findByIdAndUpdate(id, {difficulty : newDif}, function(err, post) {
					if(err) res.send(err);
					res.json(post);
				});
			});
		} else {
			res.sendStatus(404);
		}
	});

	var isValidRange = function(range) {
		var r = String(range);
		if (validRanges.indexOf(r) > -1) {
			return true;
		} else {
			return false;
		}
	}

	// delete a concept
	app.delete('/concepts/:id', function(req, res) {
		var id  = req.params.id;
		Concepts.findByIdAndRemove(id, function(err, post) {
			if(err) res.send(err);
			res.json(post);
		});
	});

	// =====================================
	// ConceptPairs
	// =====================================
	
	// get all concept-pairs
	app.get('/conceptpairs', function(req, res){
		ConceptPairs.find(function(err, c){
			if(err) res.send(err);
			res.json(c);
		});
	});

	// get a specific concept pair
	app.get('/conceptpairs/:c1/:c2', function(req, res) {
		var c1 = req.params.c1;
		var c2 = req.params.c2;
		var id = getPairId(c1, c2);
		ConceptPairs.findById(id, function(err, conc) {
			if(err) res.send(err);
			res.send(conc);
		});
	});


	app.get('/surveyquestion' , function(req, res) {
		getRandomPair(function(cp) {
			if(cp) {
				res.json(cp);
			} else {
				res.json(null);
			}
		});
	});


	app.get('/results/:range', function(req,res) {
		var range = req.params.range;
		if(!isValidRange(range)) {
			res.sendStatus(404);
		} else {
			getConceptsSortByRange(range, function(concepts) {
				res.json(concepts);
			});
		}
	});

	var getConceptsSortByRange = function(range, callback) {
		Concepts.find(function(err, concepts) {
			if(err) return {};
			else {
				var r = String(range);
				callback(concepts.sort(function(a, b) {return b.difficulty[r] - a.difficulty[r]}));
			}
		});
	}

	var getRandomPair = function(callback) {	
		Concepts.find(function(err, concepts) {
			if(err) {
				callback(null);
			} else {
				getRandomIndexes(concepts.length, function(i, j) {
					if(i == null || j == null) {
						callback(null);
					} else {
						var conceptpair = {
							c1 : concepts[i],
							c2 : concepts[j]
						};
						callback(conceptpair);
					}
				});
			}
		});
	}

	var getRandomIndexes = function(max, callback) {
		var i = Math.floor(Math.random() * max);
		var j = Math.floor(Math.random() * max);
		if (i == j) {
			while (i == j) {
				j = Math.floor(Math.random() * max);
				if(j != i) {
					callback(i, j);
				}
			}
		} else {
			callback(i, j);
		}
	}

	var getConceptId = function(concept) {
		var con = concept.toLowerCase().replace(/[^\w\s]|_/g, "");
		var id =  bcrypt.hashSync(con, salt).replace('/', "");
		return id;
	}

	var conceptExists = function(id) {
		Concepts.findById(id, function(err, conc) {
			if(conc) return true;
			else return false;
		});
	}


}