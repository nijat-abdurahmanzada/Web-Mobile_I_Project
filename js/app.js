const API_KEY = "dcd4cb151cabb9c78a6f5711bfa78d11";
const API_URL = "https://api.themoviedb.org/3/movie/popular";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const movieList = document.querySelector(".movie-list");
const searchInput = document.querySelector("#search");
const searchButton = document.querySelector("#search-button");

const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#navigation");

const bookingDialog = document.querySelector("#booking_dialog");
const closeBookingButton = document.querySelector("#close-booking-dialog");
const seatMap = document.querySelector("#seating-map");
const mapInfo = document.querySelector("#map_info_container");
const venueTitle = document.querySelector("#venue-title");
const bookingPrice = document.querySelector("#booking-price");
const addToCartButton = document.querySelector("#add-to-cart");

const cartButton = document.querySelector("#in-cart");
const cartCount = document.querySelector("#cart-count");
const cartDialog = document.querySelector("#in-cart-modal-container");
const closeCartButton = document.querySelector("#close-in-cart-modal");
const cartContainer = document.querySelector(".in-cart-main");
const footerPrice = document.querySelector("#footer-price");

const ROW_COUNT = 8;
const COLUMN_COUNT = 8;

const seatTypes = {
  economy: { color: "#94a3b8", price: 5 },
  standard: { color: "#10b981", price: 7 },
  premium: { color: "#3b82f6", price: 10 },
  vip: { color: "#a855f7", price: 12 },
  unavailable: { color: "#ef4444" },
};

let movies = [];
let currentMovie = null;
let totalPrice = 0;
let zoomLevel = 1;

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.2;

/* MOVIES API */

async function getMovies() {
  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.results ?? [];
  } catch (error) {
    console.error("Could not load movies:", error);
    movieList.innerHTML = `
            <p class="empty-message">
                Movies could not be loaded. Please refresh the page.
            </p>
        `;
    return [];
  }
}

/*  
   MOVIE CARDS
  */

function createCard(movie) {
  const card = document.createElement("article");
  card.classList.add("card");
  card.dataset.id = String(movie.id);
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Book seats for ${movie.title}`);

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("card-img");

  const image = document.createElement("img");
  image.src = movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : "";
  image.alt = `${movie.title} movie poster`;
  image.loading = "lazy";

  imageContainer.append(image);

  const body = document.createElement("div");
  body.classList.add("card-body");

  const title = document.createElement("h2");
  title.textContent = movie.title;

  const date = document.createElement("p");
  date.textContent = formatDate(movie.release_date);

  body.append(title, date);
  card.append(imageContainer, body);

  return card;
}

function formatDate(dateString) {
  if (!dateString) return "Release date unavailable";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Release date unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderMovies(movieArray) {
  movieList.replaceChildren();

  if (movieArray.length === 0) {
    const message = document.createElement("p");
    message.classList.add("empty-message");
    message.textContent = "No movies found.";
    movieList.append(message);
    return;
  }

  movieArray.forEach((movie) => {
    movieList.append(createCard(movie));
  });
}

function searchMovies(value) {
  const query = value.trim().toLowerCase();

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(query),
  );

  renderMovies(filteredMovies);
}

/* LOCAL STORAGE HELPERS */

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem("booked")) || [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem("booked", JSON.stringify(bookings));
  updateCartCount();
}

function getBookedSeats(movieId) {
  const booking = getBookings().find((item) => item.movieId === movieId);

  return new Set(
    (booking?.seats || []).map(
      (seat) => `${seat.part}-${seat.column}-${seat.row}`,
    ),
  );
}

function updateCartCount() {
  const count = getBookings().reduce(
    (sum, booking) => sum + booking.seats.length,
    0,
  );

  cartCount.textContent = String(count);
}

/* BOOKING DIALOG */

function openBookingDialog(movie) {
  currentMovie = movie;
  totalPrice = 0;
  zoomLevel = 1;

  venueTitle.textContent = movie.title;
  updateTotalPrice();

  generateSeats(COLUMN_COUNT, ROW_COUNT);

  if (!bookingDialog.open) {
    bookingDialog.showModal();
  }
}

function closeBookingDialog() {
  if (bookingDialog.open) {
    bookingDialog.close();
  }

  currentMovie = null;
  totalPrice = 0;
  updateTotalPrice();
}

function updateTotalPrice() {
  bookingPrice.textContent = `Total: ${totalPrice.toFixed(2)} AZN`;
}

/* SEAT MAP GENERATION */

function getSeatType(rowIndex) {
  if (rowIndex < 2) return "economy";
  if (rowIndex < 4) return "standard";
  if (rowIndex < 6) return "premium";
  return "vip";
}

function createSeat(part, rowIndex, seatIndex, type, bookedSeats) {
  const button = document.createElement("button");

  button.type = "button";
  button.classList.add("seats", type);
  button.dataset.type = type;
  button.dataset.id = `${part}-${rowIndex}-${seatIndex}`;
  button.textContent = String(seatIndex + 1);
  button.setAttribute(
    "aria-label",
    `${type} seat, row ${rowIndex + 1}, seat ${seatIndex + 1}`,
  );

  if (bookedSeats.has(button.dataset.id)) {
    button.classList.add("booked");
    button.disabled = true;
    button.setAttribute("aria-label", "Booked seat");
  }

  return button;
}

function generateSeats(columnCount, rowCount) {
  seatMap.replaceChildren();

  zoomLevel = 1;

  const toolbar = document.createElement("div");
  toolbar.classList.add("seat-toolbar");

  const screen = document.createElement("div");
  screen.classList.add("screen-label");
  screen.textContent = "SCREEN";

  const zoomControls = document.createElement("div");
  zoomControls.classList.add("zoom-controls");
  zoomControls.innerHTML = `
        <button type="button" data-zoom="out" aria-label="Zoom out">
            <i class="fa-solid fa-minus"></i>
        </button>
        <span class="zoom-level">100%</span>
        <button type="button" data-zoom="in" aria-label="Zoom in">
            <i class="fa-solid fa-plus"></i>
        </button>
        <button type="button" data-zoom="reset" aria-label="Reset zoom">
            <i class="fa-solid fa-rotate-left"></i>
        </button>
    `;

  toolbar.append(screen, zoomControls);

  const viewport = document.createElement("div");
  viewport.classList.add("seat-viewport");

  const stage = document.createElement("div");
  stage.classList.add("seat-stage");

  const bookedSeats = getBookedSeats(currentMovie.id);

  for (let i = 0; i < columnCount; i++) {
    const seatRow = document.createElement("div");
    seatRow.classList.add("seat-row");

    const type = getSeatType(i);

    const leftSeats = document.createElement("div");
    leftSeats.classList.add("left-seats");

    for (let j = 0; j < rowCount / 2; j++) {
      leftSeats.append(createSeat("l", i, j, type, bookedSeats));
    }

    const middleSeats = document.createElement("div");
    middleSeats.classList.add("middle-seats");

    for (let j = 0; j < rowCount; j++) {
      middleSeats.append(createSeat("m", i, j, type, bookedSeats));
    }

    const rightSeats = document.createElement("div");
    rightSeats.classList.add("right-seats");

    for (let j = 0; j < rowCount / 2; j++) {
      rightSeats.append(createSeat("r", i, j, type, bookedSeats));
    }

    seatRow.append(leftSeats, middleSeats, rightSeats);
    stage.append(seatRow);
  }

  viewport.append(stage);
  seatMap.append(toolbar, viewport);

  generateInfo();
  seatMap.append(mapInfo);
  updateZoom();
}

function generateInfo() {
  mapInfo.replaceChildren();

  const legend = document.createElement("div");
  legend.classList.add("map-info");

  Object.entries(seatTypes).forEach(([type, details]) => {
    const item = document.createElement("div");
    item.classList.add("map-info-item");

    const square = document.createElement("span");
    square.classList.add("square");
    square.style.backgroundColor = details.color;

    const label = document.createElement("span");
    label.textContent = type.toUpperCase();

    item.append(square, label);
    legend.append(item);
  });

  const selectedItem = document.createElement("div");
  selectedItem.classList.add("map-info-item");

  const selectedSquare = document.createElement("span");
  selectedSquare.classList.add("square");
  selectedSquare.style.backgroundColor = "#f59e0b";

  const selectedLabel = document.createElement("span");
  selectedLabel.textContent = "SELECTED";

  selectedItem.append(selectedSquare, selectedLabel);
  legend.append(selectedItem);

  mapInfo.append(legend);
}

/* ZOOM */

function updateZoom() {
  const stage = seatMap.querySelector(".seat-stage");
  const zoomText = seatMap.querySelector(".zoom-level");

  if (!stage || !zoomText) return;

  stage.style.transform = `scale(${zoomLevel})`;
  zoomText.textContent = `${Math.round(zoomLevel * 100)}%`;
}

/* SEAT SELECTION */

function handleSeatClick(button) {
  if (button.disabled || button.classList.contains("booked")) {
    return;
  }

  const type = button.dataset.type;
  const price = seatTypes[type].price;

  if (button.classList.contains("selected")) {
    button.classList.remove("selected");
    totalPrice -= price;
  } else {
    button.classList.add("selected");
    totalPrice += price;
  }

  totalPrice = Math.max(0, totalPrice);
  updateTotalPrice();
}

function addSelectedSeatsToCart() {
  if (!currentMovie) return;

  const selectedButtons = seatMap.querySelectorAll(".seats.selected");

  if (selectedButtons.length === 0) {
    alert("Please select at least one seat!");
    return;
  }

  const selectedSeats = Array.from(selectedButtons).map((button) => {
    const [part, column, row] = button.dataset.id.split("-");

    return {
      part,
      column: Number(column),
      row: Number(row),
      type: button.dataset.type,
    };
  });

  const bookings = getBookings();

  const booking = {
    movieId: currentMovie.id,
    title: currentMovie.title,
    poster: currentMovie.poster_path,
    seats: selectedSeats,
    totalPrice,
  };

  const existingIndex = bookings.findIndex(
    (item) => item.movieId === currentMovie.id,
  );

  if (existingIndex >= 0) {
    const existingSeats = new Set(
      bookings[existingIndex].seats.map(
        (seat) => `${seat.part}-${seat.column}-${seat.row}`,
      ),
    );

    const newSeats = selectedSeats.filter(
      (seat) => !existingSeats.has(`${seat.part}-${seat.column}-${seat.row}`),
    );

    bookings[existingIndex].seats.push(...newSeats);
    bookings[existingIndex].totalPrice += newSeats.reduce(
      (sum, seat) => sum + seatTypes[seat.type].price,
      0,
    );
  } else {
    bookings.push(booking);
  }

  saveBookings(bookings);
  closeBookingDialog();
}

/* CART */

function createCartItem(booking) {
  const row = document.createElement("article");
  row.classList.add("in-cart-row");
  row.dataset.id = String(booking.movieId);

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("in-cart-img-container");

  const image = document.createElement("img");
  image.src = booking.poster ? `${IMAGE_URL}${booking.poster}` : "";
  image.alt = `${booking.title} poster`;
  imageContainer.append(image);

  const title = document.createElement("div");
  title.classList.add("in-cart-title");
  title.textContent = booking.title;

  const place = document.createElement("div");
  place.classList.add("place");
  place.textContent = `Seats: ${booking.seats.length}`;

  const price = document.createElement("div");
  price.classList.add("price");
  price.textContent = `${booking.totalPrice.toFixed(2)} AZN`;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("in-cart-delete");
  deleteButton.setAttribute("aria-label", `Remove ${booking.title}`);
  deleteButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

  row.append(imageContainer, title, place, price, deleteButton);
  return row;
}

function openCartDialog() {
  renderCart();

  if (!cartDialog.open) {
    cartDialog.showModal();
  }
}

function renderCart() {
  cartContainer.replaceChildren();

  const bookings = getBookings();

  if (bookings.length === 0) {
    const empty = document.createElement("p");
    empty.classList.add("in-cart-empty");
    empty.textContent = "Your cart is empty.";
    cartContainer.append(empty);
  }

  let total = 0;

  bookings.forEach((booking) => {
    cartContainer.append(createCartItem(booking));
    total += booking.totalPrice;
  });

  footerPrice.textContent = `${total.toFixed(2)} AZN`;
  updateCartCount();
}

function deleteCartItem(movieId) {
  const updatedBookings = getBookings().filter(
    (booking) => booking.movieId !== movieId,
  );

  saveBookings(updatedBookings);
  renderCart();
}

/* EVENT LISTENERS */

// Hamburger menu
menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("show");

  menuToggle.setAttribute("aria-expanded", String(isOpen));

  const icon = menuToggle.querySelector("i");
  icon.classList.toggle("fa-bars", !isOpen);
  icon.classList.toggle("fa-xmark", isOpen);
});

navigation.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;

  navigation.classList.remove("show");
  menuToggle.setAttribute("aria-expanded", "false");

  const icon = menuToggle.querySelector("i");
  icon.classList.add("fa-bars");
  icon.classList.remove("fa-xmark");
});

// Search
searchInput.addEventListener("input", (event) => {
  searchMovies(event.target.value);
});

searchButton.addEventListener("click", () => {
  searchMovies(searchInput.value);
});

// Open movie booking
movieList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;

  const movie = movies.find((item) => item.id === Number(card.dataset.id));

  if (movie) openBookingDialog(movie);
});

movieList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest(".card");
  if (!card) return;

  event.preventDefault();

  const movie = movies.find((item) => item.id === Number(card.dataset.id));

  if (movie) openBookingDialog(movie);
});

// Close booking
closeBookingButton.addEventListener("click", closeBookingDialog);

bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) {
    closeBookingDialog();
  }
});

// Seat map: zoom controls and seat selection
seatMap.addEventListener("click", (event) => {
  const zoomButton = event.target.closest("[data-zoom]");

  if (zoomButton) {
    const action = zoomButton.dataset.zoom;

    if (action === "in") {
      zoomLevel = Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP);
    } else if (action === "out") {
      zoomLevel = Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP);
    } else if (action === "reset") {
      zoomLevel = 1;
    }

    updateZoom();
    return;
  }

  const seatButton = event.target.closest(".seats");
  if (!seatButton || !seatMap.contains(seatButton)) return;

  handleSeatClick(seatButton);
});

// Add booking to cart
addToCartButton.addEventListener("click", addSelectedSeatsToCart);

// Cart open / close
cartButton.addEventListener("click", openCartDialog);

closeCartButton.addEventListener("click", () => {
  if (cartDialog.open) cartDialog.close();
});

cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) {
    cartDialog.close();
  }
});

// Delete booking from cart
cartContainer.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".in-cart-delete");
  if (!deleteButton) return;

  const row = deleteButton.closest(".in-cart-row");
  if (!row) return;

  deleteCartItem(Number(row.dataset.id));
});

movies = await getMovies();
renderMovies(movies);
updateCartCount();
