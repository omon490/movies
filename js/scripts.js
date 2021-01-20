var ITEMS_PER_PAGE = 10;

var foundMovies = [];

var titleRegex = '';

// DOM

var elSearchForm = document.querySelector('.js-search-form');
if (elSearchForm) {
  var elTitleInput = elSearchForm.querySelector('.js-search-form__title-input');
  var elRatingInput = elSearchForm.querySelector('.js-search-form__rating-input');
  var elGenreSelect = elSearchForm.querySelector('.js-search-form__genre-select');
  var elSortSelect = elSearchForm.querySelector('.js-search-form__sort-select');
}

var elMovieInfoModal = document.querySelector('.movie-info-modal');
if (elMovieInfoModal) {
  var elMovieInfoModalTitle = elMovieInfoModal.querySelector('.movie-info-modal__title');
}

var elNoResultsAlert = document.querySelector('.js-no-results-alert');
var elSearchResult = document.querySelector('.search-results');
var elSearchResultsCount = document.querySelector('.js-search-results-count');
var elPagination = document.querySelector('.pagination');

var elMovieCardTemplate = document.querySelector('#movie-card-template').content;
var elPaginationItemTemplate = document.querySelector('#pagination-item-template').content;


// FUNCTIONS

// Searching

var searchMovies = (titleRegex = '', minRating = 0, genre = 'All') => {
  return movies.filter(movie => {
    var doesMatchCategory = genre === 'All' || movie.categories.includes(genre);
    return movie.title.match(titleRegex) && movie.imdbRating >= minRating && doesMatchCategory;
  });
};

// Sorting

var sortMoviesAZ = data => {
  data.sort((a, b) => {
    if (a.title > b.title) {
      return 1;
    } else if (a.title < b.title) {
      return -1;
    }
    return 0;
  });
};

var sortMoviesZA = data => {
  data.sort((a, b) => {
    if (a.title < b.title) {
      return 1;
    } else if (a.title > b.title) {
      return -1;
    }
    return 0;
  });
};

var sortMoviesRatingDesc = data => {
  data.sort((a, b) => b.imdbRating - a.imdbRating);
};

var sortMoviesRatingAsc = data => {
  data.sort((a, b) => a.imdbRating - b.imdbRating);
};

var sortMoviesYearDesc = data => {
  data.sort((a, b) => b.year - a.year);
};

var sortMoviesYearAsc = data => {
  data.sort((a, b) => a.year - b.year);
};

var sortMovies = (data, sortType) => {
  if (sortType === 'az') {
    sortMoviesAZ(data);
  } else if (sortType === 'za') {
    sortMoviesZA(data);
  } else if (sortType === 'rating_desc') {
    sortMoviesRatingDesc(data);
  } else if (sortType === 'rating_asc') {
    sortMoviesRatingAsc(data);
  } else if (sortType === 'year_desc') {
    sortMoviesYearDesc(data);
  } else if (sortType === 'year_asc') {
    sortMoviesYearAsc(data);
  }
};

// Pagination

var getPage = pageNumber => {
  var startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  var endIndex = startIndex + ITEMS_PER_PAGE;
  return foundMovies.slice(startIndex, endIndex);
};


// DOM GA OID FUNKSIYALAR

/*
  Description: Create movie card element from movie object
  @param movie - object
  @return - HTML element with movie object props included
*/

var createMovieCard = movie => {
  var elMovie = elMovieCardTemplate.cloneNode(true);

  elMovie.querySelector('.movie__poster').src = movie.smallPoster;
  elMovie.querySelector('.movie__poster').alt = `Poster of ${movie.title}`;
  elMovie.querySelector('.movie__year').textContent = movie.year;
  elMovie.querySelector('.movie__rating').textContent = movie.imdbRating;
  elMovie.querySelector('.movie__trailer-link').href = movie.trailer;
  elMovie.querySelector('.js-movie-modal-opener').dataset.imdbId = movie.imdbId;
  elMovie.querySelector('.js-movie-bookmark').dataset.imdbId = movie.imdbId;

  var elMovieTitle = elMovie.querySelector('.movie__title');

  if (titleRegex.source === '(?:)') {
    elMovieTitle.textContent = movie.title;
  } else {
    elMovieTitle.innerHTML = movie.title.replace(titleRegex, `<mark class="px-0">${movie.title.match(titleRegex)}</mark>`);
  }


  return elMovie;
};

/*
  Description: Display given array of movies as HTML elements
  @param movies - array of movie objects
  @return - null
*/

var displayMovies = movies => {
  elSearchResult.innerHTML = '';

  var elMoviesFragment = document.createDocumentFragment();

  movies.forEach(movie => {
    elMoviesFragment.appendChild(createMovieCard(movie));
  });

  elSearchResult.appendChild(elMoviesFragment);
};

var displayPagination = movies => {
  var pagesCount = Math.ceil(movies.length / ITEMS_PER_PAGE);

  elPagination.innerHTML = '';
  var elPaginationFragment = document.createDocumentFragment();

  for (var i = 1; i <= pagesCount; i++) {
    var elPaginationItem = elPaginationItemTemplate.cloneNode(true);
    elPaginationItem.querySelector('.js-page-link').textContent = i;
    elPaginationItem.querySelector('.js-page-link').dataset.pageNumber = i;

    elPaginationFragment.appendChild(elPaginationItem);
  }

  elPagination.appendChild(elPaginationFragment);
  elPagination.querySelector('.page-item').classList.add('active');
};


// EVENT LISTENERS

elSearchForm.addEventListener('submit', evt => {
  evt.preventDefault();

  titleRegex = new RegExp(elTitleInput.value, 'gi');
  var minRating = Number(elRatingInput.value);
  var genre = elGenreSelect.value;
  var sorting = elSortSelect.value;

  foundMovies = searchMovies(titleRegex, minRating, genre);
  // localStorage.setItem('currentMovies', JSON.stringify(foundMovies));

  elNoResultsAlert.classList.add('d-none');
  elSearchResultsCount.textContent = foundMovies.length;

  if (!foundMovies.length) {
    elSearchResult.innerHTML = '';
    elNoResultsAlert.classList.remove('d-none');
    return;
  }

  sortMovies(foundMovies, sorting);

  displayMovies(getPage(1));
  displayPagination(foundMovies);
});

// paginationga quloq solib, linkning data-page qiymatini chiqaramiz
elPagination.addEventListener('click', evt => {
  if (evt.target.matches('.js-page-link')) {
    evt.preventDefault();

    // link bosilganiga qarab N-sahifaning qiymatlarini ko'rsatamiz
    var pageNumber = Number(evt.target.dataset.pageNumber);
    displayMovies(getPage(pageNumber));

    elPagination.querySelectorAll('.page-item').forEach(item => {
      item.classList.remove('active');
    });

    // evt.target.parentElement.classList.add('active');
    evt.target.closest('.page-item').classList.add('active');

    window.scrollTo(0, 0);
  }
});

// TODO - qaysi sahifada turgan bo'lsak, o'shaning linki bosilganda ishlamasin


elSearchResult.addEventListener('click', evt => {
  if (evt.target.matches('.js-movie-modal-opener')) {
    var movie = foundMovies.find(movie => movie.imdbId === evt.target.dataset.imdbId);
    elMovieInfoModalTitle.textContent = movie.title;
    elMovieInfoModal.querySelector('.modal-body').textContent = movie.summary;
  }
});
