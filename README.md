# CinemaX — Responsive Movie Booking Interface

CinemaX is a front-end movie browsing and seat-selection project. It loads popular movies from **The Movie Database (TMDB)**, lets users search the displayed movies, choose seats from a generated cinema layout, and manage selected bookings in a cart.

## Features

- **Movie listing:** retrieves popular movies from TMDB and displays posters, titles, and release dates.
- **Movie search:** filters the movies already loaded into the page by title.
- **Responsive navigation:** includes a collapsible hamburger menu on smaller screens.
- **Dynamic seat map:** generates 8 rows with left, middle, and right seat groups.
- **Seat categories and pricing:** Economy (5 AZN), Standard (7 AZN), Premium (10 AZN), and VIP (12 AZN).
- **Unavailable seats:** booked seats have a distinct visual state and are disabled.
- **Zoom controls:** zoom in, zoom out, and reset the seat map.
- **Cart:** add selected seats, review the total, and remove a movie booking.
- **Local persistence:** bookings are stored in browser `localStorage`.

## Technologies

- HTML5 — semantic page structure and native dialog elements.
- CSS3 — theme, layouts, seat states, and responsive breakpoints.
- JavaScript (ES modules) — API requests, dynamic DOM updates, seat generation, pricing, and cart logic.
- TMDB API — movie data and poster images.
- Font Awesome and Google Fonts — icons and typography.
- Browser `localStorage` — local booking persistence.

## Project structure

```text
CinemaX/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└──README.md
```

## Run locally

Use a local web server because the application uses JavaScript modules and `fetch`.

### VS Code Live Server

1. Extract and open the project folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

### Python

Run this command from the project folder:

```bash
python -m http.server 5500
```

Open `http://localhost:5500` in your browser.

## TMDB API configuration

The API key is declared near the top of `js/app.js`:

```javascript
const API_KEY = "YOUR_TMDB_API_KEY";
```

As example, you can use my API key:

```
const API_KEY = "dcd4cb151cabb9c78a6f5711bfa78d11";
```

Replace it with a valid TMDB API key if required. The supplied project currently contains the development key used when it was created. Do not publish a personal API key in a public repository. A production implementation should handle API configuration more securely, for example through a backend proxy.

The application requests popular movies from `https://api.themoviedb.org/3/movie/popular` and poster images from `https://image.tmdb.org/t/p/w500`. Internet access is required for these resources, Google Fonts, and Font Awesome.

## Booking workflow

1. Select a movie card to open the booking dialog.
2. Select available seats. The total is recalculated using each seat's category price.
3. Press the cart button in the booking dialog to save the selected seats.
4. Open the floating cart button to review bookings or remove a movie booking.

Bookings are stored in `localStorage` under the `booked` key. They persist after a refresh in the same browser, but are not synchronized with other users or devices.

## Responsive behavior

The stylesheet includes tablet and mobile breakpoints. On mobile, navigation collapses into a hamburger menu, movie cards are stacked vertically, and the booking dialog places the movie description above the seat map. The seat map uses a scrollable viewport and zoom controls for narrow screens.

## Current scope and limitations

This is an **educational front-end prototype**, not a production ticketing platform. It has no backend, database, user authentication, payment processing, or server-side seat locking. Bookings are local to one browser. The TMDB popular-movies endpoint does not provide actual cinema schedules or live screening availability. The Movies and Contact navigation links are present, but separate `movies.html` and `contact.html` pages are not included in this package.

## Suggested future improvements

1. Add a backend API and database for cinemas, screenings, seats, and bookings.
2. Add authentication and a secure checkout/payment flow.
3. Store seat availability per screening and enforce it on the server.
4. Add automated tests for pricing, booking persistence, and responsive behavior.
5. Improve loading and error states, including a retry action.

## Credits

Movie metadata and poster images are provided by **TMDB**. This educational project is not affiliated with or endorsed by TMDB.

## Creator

Nijat Abdurahmanzada
