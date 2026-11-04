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

// Creating the cards
function createCard(movie) {
  const card = document.createElement("div");
  card.classList.add("card");

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

movies.forEach((movie) => createCard(movie));
