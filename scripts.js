import { BOOKS_PER_PAGE, authors, books, genres } from "./data.js";

/**
 * This object gets and houses all the html elements used in this file for easy
 * access.
 *
 * @type {object}
 */
const htmlElements = {
  header: {
    search: document.querySelector("[data-header-search]"),
    settings: document.querySelector("[data-header-settings]"),
  },
  main: {
    items: document.querySelector("[data-list-items]"),
    message: document.querySelector("[data-list-message]"),
    button: document.querySelector("[data-list-button]"),
  },
  preview: {
    overlay: document.querySelector("[data-list-active]"),
    blur: document.querySelector("[data-list-blur]"),
    image: document.querySelector("[data-list-image]"),
    title: document.querySelector("[data-list-title]"),
    subtitle: document.querySelector("[data-list-subtitle]"),
    description: document.querySelector("[data-list-description]"),
    close: document.querySelector("[data-list-close]"),
  },
  search: {
    overlay: document.querySelector("[data-search-overlay]"),
    form: document.querySelector("[data-search-form]"),
    title: document.querySelector("[data-search-title]"),
    genre: document.querySelector("[data-search-genres]"),
    author: document.querySelector("[data-search-authors]"),
    cancel: document.querySelector("[data-search-cancel]"),
    search: document.querySelector(
      "button.overlay__button.overlay__button_primary[form='search']"
    ),
  },
  settings: {
    overlay: document.querySelector("[data-settings-overlay]"),
    form: document.querySelector("[data-settings-form]"),
    theme: document.querySelector("[data-settings-theme]"),
    save: document.querySelector(
      "button.overlay__button.overlay__button_primary[form='settings']"
    ),
    cancel: document.querySelector("[data-settings-cancel]"),
  },
};

const extracted = books.slice(0, BOOKS_PER_PAGE);

let totalBooksShown = 0;
let range = 1;

if (!books && !Array.isArray(books)) throw new Error("Source required");
if (!range && range.length < 2)
  throw new Error("Range must be an array with two numbers");

//Theme variables
const themes = {
  day: ["255, 255, 255", "10, 10, 20"],
  night: ["10, 10, 20", "255, 255, 255"],
};
// Adjusts theme on open according to users pc preference
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  htmlElements.settings.theme.value = "night";
} else {
  htmlElements.settings.theme.value = "day";
}

htmlElements.settings.form.addEventListener("submit", (event) => {
  // user selects dark/light
  event.preventDefault();
  const formSubmit = new FormData(event.target);
  const submit = Object.fromEntries(formSubmit);

  // Use the theme the user selected
  document.documentElement.style.setProperty(
    "--color-light",
    themes[submit.theme][0]
  );
  document.documentElement.style.setProperty(
    "--color-dark",
    themes[submit.theme][1]
  );

  htmlElements.settings.overlay.close();
});

// Opens settings and focuses on themes
htmlElements.header.settings.addEventListener("click", () => {
  htmlElements.settings.theme.focus();
  htmlElements.settings.overlay.showModal();
});

// Add event listener for cancel button
htmlElements.settings.cancel.addEventListener("click", () => {
  // "cancel" clicked closes setting bar
  htmlElements.settings.overlay.close();
  htmlElements.settings.form.reset();
});

// Function to display a book with picture, title, and author using htmlElements
function displayBookWithElements(book) {
  const { author, id, image, title } = book;
  const authorName = authors[author];
  // Create a container for the book
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book-container");

  bookContainer.className = "preview";

  // Add a click event listener to show the book's details
  bookContainer.addEventListener("click", () => {
    showBookDetails(book);
  });

  // Set the dataset for the book
  bookContainer.dataset.id = id;

  bookContainer.innerHTML =
    /* html */
    /* html */ `
             <img
                 class="preview__image"
                 src="${image}"
             />
            
            <div class="preview__info">
                 <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authorName}</div>
                
            </div>
         `;
  return bookContainer;
}
function showBookDetails(book) {
  // Populate the modal with book details
  const { image, title, author, published, description } = book;

  // Extract the year from the published date
  const publishedDate = new Date(published);
  const year = publishedDate.getFullYear();

  // Set the modal content
  htmlElements.preview.image.src = image;
  htmlElements.preview.title.textContent = title;
  htmlElements.preview.subtitle.textContent = `${authors[author]} (${year})`;
  htmlElements.preview.description.textContent = description;

  // Show the modal
  htmlElements.preview.overlay.style.display = "block";
}
htmlElements.preview.close.addEventListener("click", () => {
  // Hide the modal
  htmlElements.preview.overlay.style.display = "none";
});

// Function to display all books using event handlers
function displayAllBooks() {
  // Clear the existing book list
  htmlElements.main.items.innerHTML = "";

  // Calculate the remaining books to show based on the current genre
  const genreId = htmlElements.search.genre.value;
  const filteredBooks = books.filter((book) => {
    const bookGenres = book.genres.map((genreId) =>
      genres[genreId].toLowerCase()
    );
    return genreId === "" || bookGenres.includes(genres[genreId].toLowerCase());
  });

  // Calculate the remaining books to show
  const remainingBooks = filteredBooks.length - totalBooksShown;
  const booksToDisplay = Math.min(remainingBooks, BOOKS_PER_PAGE);

  // Loop through extracted books and add event listeners to display each one
  for (let i = totalBooksShown; i < totalBooksShown + booksToDisplay; i++) {
    const book = filteredBooks[i];
    if (!book) break; // Break if there are no more books to display
    const bookElement = displayBookWithElements(book);
    htmlElements.main.items.appendChild(bookElement);
  }

  // Update the total books shown
  totalBooksShown += booksToDisplay;

  // Update the "Show more" button text
  htmlElements.main.button.innerText = `Show more (${
    remainingBooks - booksToDisplay
  })`;

  // Disable the "Show more" button if there are no more books to show
  if (remainingBooks - booksToDisplay <= 0) {
    htmlElements.main.button.disabled = true;
  }
}

// Function to open the search overlay
function openSearchOverlay() {
  // Reset the search fields when opening the overlay (optional)
  htmlElements.search.title.value = "";
  htmlElements.search.genre.value = "";
  htmlElements.search.author.value = "";

  // Show the search overlay
  htmlElements.search.overlay.style.display = "block";

  //focus on the for/ didn't though
  htmlElements.search.form.focus();

  // Add a class to disable the page
  document.body.classList.add("disabled-page");
}

// Event listener to open the search overlay when a button is clicked
htmlElements.header.search.addEventListener("click", openSearchOverlay);

// Event listener to close the search overlay when the cancel button is clicked
htmlElements.search.cancel.addEventListener("click", () => {
  // Hide the search overlay
  htmlElements.search.overlay.style.display = "none";
  // Remove the class to enable the page
  document.body.classList.remove("disabled-page");
});

// Function to filter books based on search criteria
function filterBooks() {
  // Get the search input values
  const title = htmlElements.search.title.value.toLowerCase();
  const genreId = htmlElements.search.genre.value; // Get genre ID, not lowercase
  const author = htmlElements.search.author.value.toLowerCase();

  // Filter the books based on the criteria
  const filteredBooks = books.filter((book) => {
    const bookTitle = book.title.toLowerCase();
    const bookGenres = book.genres.map((genreId) =>
      genres[genreId].toLowerCase()
    );
    const bookAuthor = book.author.toLowerCase();
    const isGenreMatch =
      genreId === "" || bookGenres.includes(genres[genreId].toLowerCase());

    return (
      bookTitle.includes(title) && isGenreMatch && bookAuthor.includes(author)
    );
  });
  // Update the extracted books with the filtered books
  extracted.length = 0;
  Array.prototype.push.apply(extracted, filteredBooks.slice(0, BOOKS_PER_PAGE));
  totalBooksShown = BOOKS_PER_PAGE;

  // Clear the existing book list before displaying filtered books
  htmlElements.main.items.innerHTML = "";

  // Display the filtered books
  for (let i = 0; i < BOOKS_PER_PAGE; i++) {
    const book = extracted[i];
    if (!book) break; // Break if there are no more books to display
    const bookElement = displayBookWithElements(book);
    htmlElements.main.items.appendChild(bookElement);
  }

  // Update the "Show more" button text
  const remainingBooks = filteredBooks.length - totalBooksShown;
  const buttonText = `Show more (${remainingBooks > 0 ? remainingBooks : 0})`;
  htmlElements.main.button.innerText = buttonText;

  // Disable the "Show more" button if there are no more books to show
  htmlElements.main.button.disabled = remainingBooks <= 0;

  // Close the search overlay after filtering (optional)
  htmlElements.search.overlay.style.display = "none";
}

// Event listener to trigger the filterBooks function when the search button is clicked
htmlElements.search.search.addEventListener("click", (event) => {
  event.preventDefault();
  filterBooks(); // Call the filterBooks function to filter books
});
//Event listener to trigger the filterBooks function when the search form is submitted
htmlElements.search.form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the form from submitting
  filterBooks();
});

function populateAuthorOptions() {
  const authorSelect = htmlElements.search.author;
  authorSelect.innerHTML = '<option value="">All Authors</option>'; // Clear existing options

  for (const authorId in authors) {
    if (authors.hasOwnProperty(authorId)) {
      const authorName = authors[authorId];
      const option = document.createElement("option");
      option.value = authorId;
      option.textContent = authorName;
      authorSelect.appendChild(option);
    }
  }
}
// Call the function to populate genre options
populateAuthorOptions();
//Function to populate the genre select element
function populateGenreOptions() {
  const genreSelect = htmlElements.search.genre;
  genreSelect.innerHTML = '<option value="">All Genres</option>'; // Clear existing options

  for (const genreId in genres) {
    if (genres.hasOwnProperty(genreId)) {
      const genreName = genres[genreId];
      const option = document.createElement("option");
      option.value = genreId;
      option.textContent = genreName;
      genreSelect.appendChild(option);
    }
  }
}

// Call the function to populate genre and author options
populateGenreOptions();

// Add an event listener to trigger displaying all books when needed
htmlElements.main.button.addEventListener("click", displayAllBooks);

// Initially, display the books when the page loads
displayAllBooks();
