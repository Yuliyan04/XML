const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

let reviews = {};

fetch("reviews.json")
  .then(r => r.json())
  .then(data => reviews = data);

fetch("catalog.xml")
  .then(r => r.text())
  .then(text => {
    const xml = new DOMParser().parseFromString(text, "application/xml");

    const genreMap = {};
    const domainMap = {};
    const sectorMap = {};
    const platformMap = {};

    xml.querySelectorAll("genre").forEach(g =>
      genreMap[g.getAttribute("id")] = g.querySelector("name").textContent
    );

    xml.querySelectorAll("applicationDomain").forEach(d =>
      domainMap[d.getAttribute("id")] = d.querySelector("name").textContent
    );

    xml.querySelectorAll("sector").forEach(s =>
      sectorMap[s.getAttribute("id")] = s.querySelector("name").textContent
    );

    xml.querySelectorAll("platform").forEach(p =>
      platformMap[p.getAttribute("id")] = p.querySelector("name").textContent
    );

    const g = xml.querySelector(`game[id="${gameId}"]`);
    if (!g) return;

    const game = {
      title: g.querySelector("title").textContent,
      description: g.querySelector("description").textContent.trim(),
      targetAudience: g.querySelector("targetAudience").textContent,
      rating: g.querySelector("rating").textContent,
      image: g.querySelector("thumbnail").getAttribute("source"),
      genre: genreMap[g.getAttribute("genre")],
      applicationDomain: domainMap[g.getAttribute("applicationDomain")],
      platforms: [...g.querySelectorAll("platformRef")]
        .map(p => platformMap[p.getAttribute("ref")]),
      learningGoals: [...g.querySelectorAll("learningGoals goal")]
        .map(x => x.textContent)
    };

    document.getElementById("game").innerHTML = `
      <img src="images/${game.image}">

      <h1>${game.title}</h1>
      <p><strong>Rating:</strong> ${game.rating}</p>
      <p><strong>Genre:</strong> ${game.genre}</p>

      <h3>Description</h3>
      <p>${game.description}</p>

      <p><strong>Target audience:</strong> ${game.targetAudience}</p>

      <h3>Learning goals</h3>
      <ul>
        ${game.learningGoals.map(l => `<li>${l}</li>`).join("")}
      </ul>

      <p><strong>Application domain:</strong> ${game.applicationDomain}</p>
      <p><strong>Platforms:</strong> ${game.platforms.join(", ")}</p>

      ${reviews[gameId] ? `
        <h3>Reviews</h3>
        ${reviews[gameId].map(r => `<p>${r}</p>`).join("")}
      ` : ""}
    `;
  });
