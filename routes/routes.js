const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const User = require('../models/user')

//edit article
router.get('/edit/:id',ensureAuthenticated, function(req,res){
	Article.findById(req.params.id,function(err,article){
		if(article.author!= req.user._id){
			req.flash('danger','not authorized')
			res.redirect('/')
			return;
		}
		res.render('edit_article',{
			title: 'Edit Article',
			article: article
		})
	})
})

// Add submit POST route
router.post('/add',function(req,res){
	req.checkBody('title', 'title is required').notEmpty();
	// req.checkBody('author', 'author is required').notEmpty();
	req.checkBody('body', 'body is required').notEmpty();

	//get errors
	let errors = req.validationErrors();
	if(errors){
       res.render('add_articles',{
		   errors:errors,
		   title: 'Add Article'
	   })
	}else{
		let article = new Article();
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body
		article.save(function(err,data){
			if(err){
				console.log(err);
				return;
			}else {
				req.flash('success','Article A dded')
				res.redirect('/')
			}
		})
	}
})

// update submit
router.post('/edit/:id',ensureAuthenticated,function(req,res){
	let article = {}
	article.title = req.body.title
	article.author = req.body.author
	article.body = req.body.body
	let query = {_id:req.params.id} 
	Article.update(query, article, function(err, article){
		if(err){
			console.log(err);
			return;
		}else {
            req.flash('success', 'Article Updated')
			res.redirect('/')
		}
	})
})

// delete article
router.delete('/:id',function(req,res){
	if(!req.user._id){
		res.status(500).send();
	}

	Article.findById(req.params.id,function(err,article){
		if(article.author!= req.user._id){
			res.status(500).send();
		}else{
			let query = {_id:req.params.id}
	Article.remove(query,function(err,status){
		if(err){
			console.log(err);
		}else {
			res.send('Sucess')
		}
	})
		}
	})
	
})


// Add route
router.get('/add', ensureAuthenticated,function(req,res){
	res.render('add_articles',{
		title: 'articles'
	})
});

function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('danger','Please login')
		res.redirect('/users/login')
	}
}

// get single article
router.get('/:id',ensureAuthenticated,function(req,res){
	Article.findById(req.params.id,function(err,article){
		User.findById(article.author, function(err,user){
        	res.render('article',{
				article:article,
				author: user.name
			})
		})
	})
})

module.exports = router