'use strict'

var express         = require('express'),
    googleImages    = require('./index.js'),
    mongoose        = require('mongoose'),
    app             = express();
    
app.set('view engine', 'ejs');

// Setup mongoose
var connection = mongoose.connect(process.env.MONGOLAB_URI);

var historySchema = new mongoose.Schema({
    term: String,
    when: {type: Date, default: Date.now() }
});

var History = connection.model('History', historySchema);


// Setup google-images
    
let client = googleImages('017422373164043366310:1e0qvrkc5ls', 'AIzaSyC-DynV6dTHIzHL3MfmfyBep_uc3_sWK4M');


// Routes

app.get('/', function(req, res) {
   res.render('home'); 
});

app.get('/api/imagesearch/:search', function(req, res) {
    var search = req.params.search,
        query  = req.query,
        page   = 1;     
        
    addToHistory(search);
    
    if (query.hasOwnProperty('offset'))
        page = query.offset;
    
    client.search(search, {page: page})
        .then(function(images) {
           res.send(images); 
        });
});

app.get('/api/latest/imagesearch', function(req, res) {
    History.find({}).sort('-when').limit(10).exec(function(err, history) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(history.map(function(item) {
            return {
                term: item.term,
                when: item.when
            };
        }));
    });
});

app.listen(process.env.PORT, function() {
    console.log('server started...');
});

function addToHistory(item) {
    var newItem = new History({
        term: item
    });
    
    newItem.save(function(err, savedItem) {
        if (err) {
            console.log(err);
            return;
        } 
    });
}