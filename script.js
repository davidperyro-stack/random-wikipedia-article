const randomButton = document.getElementById("randomButton");
const result = document.getElementById("result");
const articleImage = document.getElementById("articleImage");
const articleTitle = document.getElementById("articleTitle");
const articleExtract = document.getElementById("articleExtract");
const articleLink = document.getElementById("articleLink");
const langSelect = document.getElementById("langSelect");
const favButton = document.getElementById("favButton");
const historyList = document.getElementById("historyList");
const favoritesList = document.getElementById("favoritesList");

let currentArticle = null;
let history = [];
let viewCount = 0;
const counterEl = document.getElementById("counter");
const confettiContainer = document.getElementById("confettiContainer")
let favorites = JSON.parse(localStorage.getItem("wikiFavorites") || "[]");
renderFavorites();

async function fetchRandomArticle() {
    const lang = langSelect.value;
    const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`);
    if (!response.ok) throw new Error("Request failed");
    return response.json();
}

async function getValidArticle() {
    let data = await fetchRandomArticle();
    let attempts = 0;
    while (data.type === "disambiguation" && attempts < 5) {
        data = await fetchRandomArticle();
        attempts++;
    }
    return data;
}

async function loadRandomArticle() {
    randomButton.disabled = true;
    randomButton.textContent = "Loading...";

    try {
        const data = await getValidArticle();
        displayArticle(data);
        addToHistory(data);
    } catch (err) {
        articleTitle.textContent = "Something went wrong";
        articleExtract.textContent = "Couldn't fetch an article. Try again.";
        articleImage.classList.add("hidden");
        result.classList.remove("hidden");
    } finally {
        randomButton.disabled = false;
        randomButton.textContent = "Press me! (R)";
    }
}

function displayArticle(data) {
    currentArticle = data;
    articleTitle.textContent = data.title;
    articleExtract.textContent = data.extract;
    articleLink.href = data.content_urls.desktop.page;

    if (data.thumbnail && data.thumbnail.source) {
        articleImage.src = data.thumbnail.source;
        articleImage.classList.remove("hidden");
    } else {
        articleImage.classList.add("hidden");
    }

    result.classList.remove("hidden");
    updateFavButton();
}

function addToHistory(data) {
    history.unshift(data);
    if (history.length > 20) history.pop();
    renderHistory();

    viewCount++;
    counterEl.textContent = `Articles viewed: ${viewCount}`;

    if (viewCount % 10 === 0) {
        celebrateMilestone();
    }
}

function celebrateMilestone() {
    const colors = ["#3366cc", "#f5c518", "#e74c3c", "#2ecc71", "#9b59b6"];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 30; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = 2 + Math.random() * 2 + "s";
        piece.style.animationDelay = Math.random() * 0.3 + "s";
        fragment.appendChild(piece);
    }
    confettiContainer.appendChild(fragment);

    setTimeout(() => {
        confettiContainer.innerHTML = "";
    }, 4500);

    const existingMessage = document.getElementById("milestoneMessage");
    if (existingMessage) existingMessage.remove();

    const message = document.createElement("div");
    message.id = "milestoneMessage";
    message.textContent = `🎉 ${viewCount} articles viewed!`;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2500);
}

function renderHistory() {
    historyList.innerHTML = "";
    history.forEach(article => {
        const li = document.createElement("li");
        li.textContent = article.title;
        li.addEventListener("click", () => displayArticle(article));
        historyList.appendChild(li);
    });
}

function isFavorite(title) {
    return favorites.some(a => a.title === title);
}

function updateFavButton() {
    if (!currentArticle) return;
    favButton.textContent = isFavorite(currentArticle.title) ? "★ Saved" : "☆ Save";
}

function toggleFavorite() {
    if (!currentArticle) return;
    if (isFavorite(currentArticle.title)) {
        favorites = favorites.filter(a => a.title !== currentArticle.title);
    } else {
        favorites.push(currentArticle);
    }
    localStorage.setItem("wikiFavorites", JSON.stringify(favorites));
    updateFavButton();
    renderFavorites();
}

function renderFavorites() {
    favoritesList.innerHTML = "";
    favorites.forEach(article => {
        const li = document.createElement("li");
        li.textContent = article.title;
        li.addEventListener("click", () => displayArticle(article));
        favoritesList.appendChild(li);
    });
}

randomButton.addEventListener("click", loadRandomArticle);
favButton.addEventListener("click", toggleFavorite);

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && document.activeElement.tagName !== "SELECT") {
        loadRandomArticle();
    }
});

document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (btn.dataset.tab === "history") {
            historyList.classList.remove("hidden");
            favoritesList.classList.add("hidden");
        } else {
            historyList.classList.add("hidden");
            favoritesList.classList.remove("hidden");
        }
    });
});
