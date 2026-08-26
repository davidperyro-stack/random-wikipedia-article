const randomButton = document.getElementById("randomButton");
const result = document.getElementById("result");
const articleImage = document.getElementById("articleImage");
const articleTitle = document.getElementById("articleTitle");
const articleExtract = document.getElementById("articleExtract");
const articleLink = document.getElementById("articleLink");

randomButton.addEventListener("click", async function () {
    randomButton.disabled = true;
    randomButton.textContent = "Loading...";

    try {
        const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
        if (!response.ok) throw new Error("Request failed");
        const data = await response.json();

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
    } catch (err) {
        articleTitle.textContent = "Something went wrong";
        articleExtract.textContent = "Couldn't fetch an article. Try again.";
        articleImage.classList.add("hidden");
        result.classList.remove("hidden");
    } finally {
        randomButton.disabled = false;
        randomButton.textContent = "Press me!";
    }
});
