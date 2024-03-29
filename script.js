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

// Получение избранных фильмов из локального хранилища
let favorites = JSON.parse(localStorage.getItem('favorites')) || []

getMovies(PREMIERS)

// Функция для сохранения избранного фильма в локальное хранилище
function saveFavorite(movieId) {
  if (!favorites.includes(movieId)) {
    favorites.push(movieId)
    localStorage.setItem('favorites', JSON.stringify(favorites))
    console.log('вызвался saveFavorite')
  }
}

// Функция для удаления фильма из избранного в локальном хранилище по его id
function removeFavorite(movieId) {
  const index = favorites.indexOf(movieId)
  if (index !== -1) {
    favorites.splice(index, 1)
    localStorage.setItem('favorites', JSON.stringify(favorites))
    console.log('Фильм успешно удален из избранного')

    // Удаление элемента из DOM
    const movieEl = document.querySelector(`.movie[data-movie-id="${movieId}"]`)
    if (movieEl) {
      movieEl.remove()
    }
  } else {
    console.log('Фильм c указанным id не найден в избранном')
  }
}

// Функция для проверки, является ли фильм избранным
function isFavorite(movieId) {
  return favorites.includes(movieId)
}

// Переключение состояния избранного фильма
function toggleFavorite(event) {
  const movieId = event.target.dataset.kinopoiskId
  if (isFavorite(movieId)) {
    removeFavorite(movieId)
    event.target.src = 'img/heart__white.png'
  } else {
    saveFavorite(movieId)
    event.target.src = 'img/heart__red.png'
  }
}

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

function showMovies(data) {
  const moviesEl = document.querySelector('.movies')
  moviesEl.innerHTML = ''

  if (data.items) {
    data.items.forEach((movie) => {
      const movieEl = document.createElement('div')
      movieEl.classList.add('movie')
      const movieId = movie.kinopoiskId || movie.filmId
      const isFavoriteMovie = isFavorite(movieId)

      movieEl.innerHTML = `
        <div class="movie__cover-inner">
          <img
            src="${movie.posterUrlPreview}"
            class="movie__cover"
            alt="${movie.nameRu}"
          />
          <div class="movie__cover--darkened"></div>
          <div class="movie_content-favorite">
            <img
              class="favorite-btn"
              data-kinopoisk-id="${movieId}"
              src="${
                isFavoriteMovie ? 'img/heart__red.png' : 'img/heart__white.png'
              }"
              alt="logo_favorite"
            >
          </div>
        </div>
        <div class="movie__info">
          <div class="movie__title">${movie.nameRu}</div>
          <div class="movie__category">${
            movie.genres
              ? movie.genres.map((genre) => ` ${genre.genre}`).join('')
              : ''
          }</div>
          ${
            movie.ratingKinopoisk
              ? `<div class="movie__average movie__average--${getClassByRate(
                  movie.ratingKinopoisk
                )}">${movie.ratingKinopoisk}</div>`
              : ''
          }
        </div>
      `
      moviesEl.appendChild(movieEl)

      // Добавляем обработчик события для кнопки избранного
      const favoriteButton = movieEl.querySelector('.favorite-btn')
      favoriteButton.addEventListener('click', toggleFavorite)
    })
  } else {
    moviesEl.innerHTML = '<p>No movies found</p>'
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

// Обработчик события для ссылки "Favorites"
const favoritesLink = document.getElementById('favorites')
favoritesLink.addEventListener('click', () => {
  getFavoriteMovies()
})

// Функция для получения избранных фильмов и их отображения
async function getFavoriteMovies() {
  // Получаем избранные фильмы из локального хранилища
  const favoriteMovieIds = JSON.parse(localStorage.getItem('favorites')) || []

  // Получаем информацию о каждом избранном фильме по его идентификатору
  const favoriteMovies = await Promise.all(
    favoriteMovieIds.map(async (movieId) => {
      const resp = await fetch(
        `https://kinopoiskapiunofficial.tech/api/v2.1/films/${movieId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': MY_API_KEY,
          },
        }
      )
      const movieData = await resp.json()
      return movieData.data
    })
  )

  // Отображаем избранные фильмы
  showMovies({ items: favoriteMovies })
}
