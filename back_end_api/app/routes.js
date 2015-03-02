var Concepts 	 = require('./models/concepts.js');
var ConceptPairs = require('./models/conceptPairs.js');
var Users 		 = require('./models/users.js');

module.exports = function(app) {

	app.get('/api', function (req, res) {
  		res.send('API is running');
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
	app.get('/concepts/:name', function(req, res) {
		var id = getConceptId(req.params.name);
		Concepts.findById(id, function(err, conc) {
			if(err) res.send(err)
			res.send(conc);
		});
	});

	// create a new concept
	app.post('/concepts', function(req, res) {
		var concept = req.body;
		var created = createConcept(concept);
		if(created) res.send(created);
		res.send("Concept already exists");
	});

	var createConcept = function(concept, res) {
		var id = getConceptId(concept.name);
		if (conceptExists(id)) return false;
		Concepts.create({_id : id, name: concept.name, difficulty: concept.difficulty}, function(err, conc) {
			if(err) return err;
			return conc;
		});
	}

	// updates a specific concept
	app.put('/concepts/:name', function(req, res) {
		var id = getConceptId(req.params.name);
		Concepts.findByIdAndUpdate(id, req.body, function(err, post){
			if(err) res.send(err);
			res.json(post);
		});
	});

	app.put('/concepts/increment/:name', function(req, res) {
		var id = getConceptId(req.params.name);
		console.log(id);
		Concepts.findById(id, function(error, conc) {
			var newDif = conc.difficulty + 1;
			Concepts.findByIdAndUpdate(id, {difficulty : newDif}, function(err, post) {
				if(err) res.send(err);
				res.json(post);
			});
		});
	});

	// delete a concept
	app.delete('/concepts/:name', function(req, res) {
		var id  = getConceptId(req.params.name);
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

	// get an unanswered concept pair for a user
	app.get('/conceptpairs/:userid', function(req, res) {
		var id = req.params.userid;
		Users.findById(id, function(err, user){
			if(err) res.send(err);
			else if(user.unanswered.length == 0) {
				res.json(null);
			} else {
				var unans = user.unanswered;
				var pair = unans.pop()
				if(pair) {
					ConceptPairs.findById(pair, function(err, p) {
						if(err) res.send(err);
						res.json(p);
					});
					Users.findByIdAndUpdate(id, {unanswered : unans}, function(){});
				} else {
					res.json(null);
				}
			}
		});
	});

	// create a new concept-pair
	app.post('/conceptpairs', function(req, res) {
		var conceptpair = req.body;
		var id = getPairId(conceptpair.c1, conceptpair.c2);
		if(pairExists(id)) res.send("Concept-pair already exists");
		ConceptPairs.create({_id : id, c1: conceptpair.c1, c2: conceptpair.c2}, function(err, concpair) {
			if(err) res.send(err);
			res.send(concpair);
		});
		var concept = {'name' : conceptpair.c1, 'difficulty' : 0};
		createConcept(concept);
		concept.name = conceptpair.c2;
		createConcept(concept);
	});

	// delete a specific concept pair
	app.delete('/conceptpairs/:c1/:c2', function(req, res) {
		var c1 = req.params.c1;
		var c2 = req.params.c2;
		var id = getPairId(c1, c2);
		ConceptPairs.findByIdAndRemove(id, function(err, post) {
			if(err) res.send(err);
			res.json(post);
		});
	});

	// =====================================
	// Users
	// =====================================


	app.post('/users', function(req, res) {
		var b = req.body;
		var id = b.id;
		getPairIds(function(pairIds) {
			Users.create({_id : id, unanswered : pairIds}, function(err, user) {
				if(err) res.send(err);
				else res.send(user);
			});
		});
	});

	var getPairIds = function(callback) {
		var ids = [];
		ConceptPairs.find(function(err, c){
			if(err) return null;
			else {
				for(var i = 0; i < c.length; i++) {
					ids.push(c[i]._id);
					if(i == c.length -1) callback(ids);
				}
			}
		});
	}

	app.get('/users', function(req, res){
		Users.find(function(err, users) {
			if(err) res.send(err);
			else res.json(users);
		});
	});

	var getPairId = function(con1, con2) {
		var c1 = con1.toLowerCase().replace(/[^\w\s]|_/g, "");
		var c2 = con2.toLowerCase().replace(/[^\w\s]|_/g, "");
		var len1 = c1.length;
		var len2 = c2.length;
		var id = "";
		var i = 0;
		while(i < len1 || i < len2) {
			var c = 0;
			if (i < len1) {
				c += c1.charCodeAt(i);
			}
			if (i < len2) {
				c += c2.charCodeAt(i);
			}
			id += String.fromCharCode(c);
			i++;
		}
		return id;
	}

	var getConceptId = function(concept) {
		var con = concept.toLowerCase().replace(/[^\w\s]|_/g, "");
		return con;
	}

	var conceptExists = function(id) {
		Concepts.findById(id, function(err, conc) {
			if(conc) return true;
			else return false;
		});
	}

	var pairExists = function(id) {
		ConceptPairs.findById(id, function(err, conc) {
			if(conc) return true;
			else return false;
		});
	}
}