const API_URL = 'https://openlibrary.org';

const elements = {
    searchInput: document.querySelector('.search-input'),
    searchButton: document.querySelector('.search-button'),
    booksGrid: document.querySelector('.books-grid'),
    bookDetailsOverlay: document.querySelector('.book-details-overlay'),
    bookDetails: document.querySelector('.book-details'),
};

let currentTheme = 'light';

async function searchBooks(query) {
    try {
        const response = await fetch(`${API_URL}/search.json?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.docs || [];
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}

async function getBookDetails(workId) {
    try {
        const response = await fetch(`${API_URL}${workId}.json`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

function renderBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const coverId = book.cover_i;
    const coverUrl = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : '/placeholder-cover.jpg';

    card.innerHTML = `
        <img src="${coverUrl}" class="book-cover" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>${book.author_name?.[0] || 'Unknown Author'}</p>
    `;

    card.addEventListener('click', async () => {
        const details = await getBookDetails(book.key);
        showBookDetails(details);
    });

    return card;
}

function showBookDetails(details) {
    elements.bookDetails.innerHTML = `
        <h2>${details.title}</h2>
        ${details.description ? `<p>${typeof details.description === 'string' 
            ? details.description 
            : details.description.value}</p>` : ''}
        ${details.covers ? `<img src="https://covers.openlibrary.org/b/id/${details.covers[0]}-L.jpg" 
            alt="${details.title} Cover" style="max-width: 100%">` : ''}
        <p>First published: ${details.first_publish_date || 'Unknown'}</p>
        ${details.subjects ? `<div class="tags">${
            details.subjects.slice(0,5).map(subject => 
                `<span class="tag">${subject}</span>`
            ).join('')
        }</div>` : ''}
    `;
    
    elements.bookDetailsOverlay.style.display = 'flex';
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // Обновите текст кнопки
    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = currentTheme === 'light' 
        ? 'Light Theme' 
        : 'Dark Theme';
    
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Форсируем обновление стилей
    requestAnimationFrame(() => {
        document.body.style.display = 'none';
        document.body.offsetHeight; // Триггер перерисовки
        document.body.style.display = '';
    });
}

// Event Listeners
elements.searchButton.addEventListener('click', async () => {
    const query = elements.searchInput.value.trim();
    if (!query) return;
    
    const books = await searchBooks(query);
    elements.booksGrid.innerHTML = '';
    books.slice(0, 12).forEach(book => {
        elements.booksGrid.appendChild(renderBookCard(book));
    });
});

elements.bookDetailsOverlay.addEventListener('click', (e) => {
    if (e.target === elements.bookDetailsOverlay) {
        elements.bookDetailsOverlay.style.display = 'none';
    }
});

// Initialize theme toggle button
const themeButton = document.createElement('button');
themeButton.className = 'theme-toggle';
themeButton.textContent = 'Toggle Theme';
themeButton.addEventListener('click', toggleTheme);
document.body.appendChild(themeButton);

// Handle Enter key in search input
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.searchButton.click();
});