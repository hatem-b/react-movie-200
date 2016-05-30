var React = require('react');
var Movie = require('./Movie.jsx');
var SearchBar = require('./SearchBar.jsx');
var MovieForm = require('./MovieForm.jsx');
var MovieAPI = require('../api/MovieAPI.js');

var Link = require('react-router').Link;

var MoviesStore = require('../stores/MoviesStore');
var MoviesActionCreator = require('../actions/MoviesActionCreator');

var Videotheque = React.createClass({
	getInitialState: function () {
		return {movies: [], loadingMovies: false}
	},

	componentWillMount: function () {
		MoviesStore.addChangeListener(this.updateMovies);
	},

	componentDidMount: function () {
		MoviesActionCreator.fetchMovies();
	},

	componentWillUnmount: function () {
		MoviesStore.removeChangeListener(this.updateMovies);
	},

	updateMovies: function () {
		var state = MoviesStore.getState();
		this.setState({movies: state.displayedMovies});
	},

	onMovieDeletion: function (movieId) {
		MovieAPI.removeMovie(movieId).then(function () {
			var filteredMovieList = this.state.movies.filter(function (movie) {
				return movie.id !== movieId;
			});

			this.setState({movies: filteredMovieList});

			this.props.history.push('/movies');
		}.bind(this));
	},

	addMovie: function (movie) {
		var newMovie = {
			title: movie.title,
			actors: movie.actors,
			synopsis: movie.synopsis
		};

		MovieAPI.addMovie(newMovie).then(function (movie) {
			var newMovieList = this.state.movies.concat([movie]);

			this.setState({movies: newMovieList});

			this.props.history.push('/movies');
		}.bind(this));
	},

	onMovieModification: function (newData) {
		MovieAPI.updateMovie(newData).then(function () {
			var newMovieList = this.state.movies.map(function (movie) {
				if (movie.id === newData.id) {
					return newData;
				} else {
					return movie;
				}
			});

			this.setState({movies: newMovieList});
		}.bind(this));
	},

	render: function () {
		var movies = this.state.movies;
		var onMovieDeletion = this.onMovieDeletion;
		var onMovieModification = this.onMovieModification;
		var moviesTag = movies.map(function (movie) {
			return (
				<li className="list-group-item" key={movie.id}>
					<Link to={'/movie/' + movie.id}>{movie.title}</Link>
				</li>
			);
		});
		var content;

		if (this.state.loadingMovies) {
			content = <li>Chargement de la liste des films en cours</li>
		} else {
			content = moviesTag;
		}

		var childrenElement;

		if (this.props.children) {
			childrenElement = React.cloneElement(this.props.children, {
				onMovieFormSaved: this.addMovie,
				onMovieDeletion: this.onMovieDeletion,
				onMovieModification: this.onMovieModification
			});
		} else {
			childrenElement = false;
		}

		return (
			<div>
				<header className="page-header">
					<h1>
						Ma vidéothèque
						<small>{movies.length}
							films</small>
						<Link className="btn btn-success" to="/movie/new">Ajouter</Link>
					</h1>
				</header>
				<SearchBar onSearch={this.onSearch}/>
				<ul className="col-md-4 list-group">
					{content}
				</ul>
				<div className="col-md-8">
					{childrenElement}
				</div>
			</div>
		);
	}
});

module.exports = Videotheque;
