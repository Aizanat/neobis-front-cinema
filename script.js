const MY_API_KEY = '375abd91-7bbd-4bba-9218-9e6a07437226'
const API_URL_SEARCH =
  'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword='
const PREMIERS =
  'https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL&page=1'
const TOP_AWAITS =
  'https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_MOVIES&page=2'
const BEST =
  'https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_250_MOVIES&page=1'
const RELEASES =
  'https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=CLOSES_RELEASES&page=1'

// local storage
let favorites = JSON.parse(localStorage.getItem('favorites')) || []

getMovies(PREMIERS)

async function getMovies(url) {
  try {
    const resp = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': MY_API_KEY,
      },
    })
    const respData = await resp.json()
    showMovies(respData)
  } catch (error) {
    console.error('Error fetching movies:', error)
  }
}

function getClassByRate(vote) {
  if (vote >= 7) {
    return 'green'
  } else if (vote > 5) {
    return 'orange'
  } else {
    return 'red'
  }
}

const topPremiersOfMonth = document.getElementById('topPremiersOfMonth')
topPremiersOfMonth.addEventListener('click', () => {
  getMovies(PREMIERS)
})

const topAwaitFilms = document.getElementById('topAwaitFilms')
topAwaitFilms.addEventListener('click', () => {
  getMovies(TOP_AWAITS)
})

const topBestFilms = document.getElementById('topBestFilms')
topBestFilms.addEventListener('click', () => {
  getMovies(BEST)
})

const topDigitalReleasesOfMonth = document.getElementById(
  'topDigitalReleasesOfMonth'
)
topDigitalReleasesOfMonth.addEventListener('click', () => {
  getMovies(RELEASES)
})

function showMovies(data) {
  const moviesEl = document.querySelector('.movies')

  document.querySelector('.movies').innerHTML = ''

  if (data.items) {
    data.items.forEach((movie) => {
      const movieEl = document.createElement('div')
      movieEl.classList.add('movie')
      movieEl.innerHTML = `
        <div class="movie__cover-inner">
          <img
            src="${movie.posterUrlPreview}"
            class="movie__cover"
            alt="${movie.nameRu}"
          />
          <div class="movie__cover--darkened"></div>
        </div>
        <div class="movie__info">
          <div class="movie__title">${movie.nameRu}</div>
          <div class="movie__category">${movie.genres.map(
            (genre) => ` ${genre.genre}`
          )}</div>
          ${
            movie.ratingKinopoisk &&
            `
          <div class="movie__average movie__average--${getClassByRate(
            movie.ratingKinopoisk
          )}">${movie.ratingKinopoisk}</div>
          `
          }
        </div>
      `
      moviesEl.appendChild(movieEl)
    })
  } else {
    moviesEl.innerHTML = '<p>No movies found</p>'
  }
}

const form = document.querySelector('form')
const search = document.querySelector('.header__search')

form.addEventListener('submit', (e) => {
  e.preventDefault()

  const apiSearchUrl = `${API_URL_SEARCH}${search.value}`
  if (search.value) {
    getMovies(apiSearchUrl)

    search.value = ''
  }
})
