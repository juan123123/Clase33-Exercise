const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll({
          include: [
            { association: 'genres' },
            { association: 'actors' }
          ]
        })
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id, {
          include: ['actors'],
          raw: true,
          next: true
        })
            .then(movie => {
                console.log(movie)
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        Genres.findAll().then(genres => {
            res.render('moviesAdd.ejs', { allGenres: genres })
        })
        
    },
    create: function (req,res) {
      Movies.create({
        title: req.body.title,
        genre_id: req.body.genre_id,
        rating: req.body.rating,
        release_date: req.body.release_date,
        length: req.body.length,
        awards: req.body.awards
      }).then(result => {
        console.log(result)
        res.redirect('/movies')
      }).catch(err => {
        console.log(err)
        res.redirect('/movies/add')
      })
    },
    edit: function(req,res) {

      let genres = Genres.findAll()

      let movies = Movies.findByPk(req.params.id, {
        include: [
          { association: 'genres' }
        ]
      })

      Promise.all([movies, genres])
        .then(([movie, genre]) => {
          res.render("moviesEdit.ejs", {Movie: movie, allGenres: genre})
      })
      
    },
    update: function (req,res) {
        
        Movies.update({
            title: req.body.title,
            awards: req.body.awards,
            length: req.body.length,
            rating: req.body.rating,
            release_date: req.body.release_date,   
            genre_id: req.body.genre_id
        },{ where: { id: req.params.id }
        })
        .then(result => {
          console.log(result)
          res.redirect('/movies') 
        }).catch(err => {
          console.log(err)
          res.redirect('/')
        })
    },
    
    delete: function (req,res) {
      
      Movies.findByPk(req.params.id).then(result => {
        console.log(result)
        res.render('moviesDelete.ejs', { Movie: result })
      }).catch(err => {
        console.log(err)
      })
    },
    destroy: function (req,res) {
      Movies.destroy({
        truncate: true,
        where: {
          id: req.params.id
        }
      })

      res.redirect('/movies')
    }
}

module.exports = moviesController;