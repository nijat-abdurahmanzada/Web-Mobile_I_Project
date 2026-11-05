const API_KEY = "dcd4cb151cabb9c78a6f5711bfa78d11";
const URL = "https://api.themoviedb.org/3/movie/popular";
const imageUrl = `https://image.tmdb.org/t/p/w500`;

async function getMovies() {
  try {
    const response = await fetch(`${URL}?api_key=${API_KEY}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    return data.results;
  } catch (error) {
    console.log(error.message);
  }
}

const movies = await getMovies();

const movieList = document.querySelector(".movie-list");
const search = document.querySelector("#search");
const modalContainer = document.getElementById("modal_container");
console.log(modalContainer);
const closeBtn = document.getElementById("close");

// Creating the cards
function createCard(movie) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.id = `${movie.id}`;

  const cardImg = document.createElement("div");
  cardImg.classList.add("card-img");
  const img = document.createElement("img");
  img.src = `${imageUrl}${movie.poster_path}`;
  img.alt = `${movie.title} movie poster`;
  cardImg.append(img);

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  const title = document.createElement("h5");
  title.textContent = movie.title;
  const paragraph = document.createElement("p");
  const releaseDate = new Date(movie.release_date);

  const formattedDate = releaseDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  paragraph.textContent = formattedDate;

  cardBody.append(title);
  cardBody.append(paragraph);

  card.append(cardImg);
  card.append(cardBody);
  movieList.append(card);
}

function renderCard(movies) {
  // movieList.replaceChildren();
  movies.forEach((movie) => createCard(movie));
}

// Search button
function searchCard(input) {
  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(input.toLowerCase()),
  );
}

function openModal(movie) {
  const modalImage = document.querySelector("#modal-image");
  const modalTitle = document.querySelector("#modal-title");
  const modalTotal = document.querySelector("#modal-total");
  
  modalImage.src = `${imageUrl}${movie["poster_path"]}`;
  modalTitle.textContent = `${movie.title}`;
  modalContainer.classList.add("active");
}

function closeModal() {
  modalContainer.classList.remove("active");
}

search.addEventListener("input", (e) => {
  let searchedMovies = searchCard(e.target.value);
  renderCard(searchedMovies);
});

movieList.addEventListener("click", (e) => {
  const selectedCard = e.target.closest(".card");

  if (!selectedCard) return;

  const id = selectedCard.dataset.id;

  const movie = movies.find((movie) => movie.id == id);
  openModal(movie);
});

closeBtn.addEventListener("click", (e) => {
  closeModal();
});

renderCard(movies);
