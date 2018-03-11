const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session')
const flash = require('connect-flash');
const expressValidator = require('express-validator')
const passport = require('passport')
const config = require('./config/database')



mongoose.connect(config.database)

const db = mongoose.connection;

//check connection
db.once('open', function(){
	console.log("connected to MongoDB");
});

//check for db errors
db.on('error',function(err){
	console.log(err);
})

//init App
const app = express()

// parse application/x-www-form
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())

// session middleware
app.use(session({
	secret:'my secret Key',
	resave:true,
	saveUninitialized: true
}))

//express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// validator
app.use(expressValidator())

//passport config
require('./config/passport')(passport)
// passport middleware
app.use(passport.initialize());
app.use(passport.session())

// set global 
app.get('*',function(req,res,next){
	res.locals.user = req.user || null
	next()
})
// Add public folder
app.use(express.static(path.join(__dirname, 'public')))

let Article = require('./models/article');

//load views
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/',function(req,res){

		Article.find({}, function(err, articles){

			if(err){
				console.log(err);
			}else {
				res.render('index', {
					title:"Articles",
					articles: articles
				})
			}
		})
})

//user route
let users = require('./routes/users');
app.use('/users',users)

const articles = require('./routes/routes')
app.use('/articles', articles)

app.listen(config.port, function(){
	console.log('server started at port 3000 ..')
})
