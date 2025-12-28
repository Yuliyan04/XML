let games = [];
let reviews = {};
let activeSector = "";

/* LOAD XML */
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

    const gameNodes = [...xml.querySelectorAll("game")];

    games = gameNodes.map(g => ({
      id: g.getAttribute("id"),
      title: g.querySelector("title").textContent,
      year: g.querySelector("year").textContent,   // ✅ ЕТО ТОВА ЛИПСВАШЕ
      description: g.querySelector("description").textContent.trim(),
      targetAudience: g.querySelector("targetAudience").textContent,
      learningGoals: [...g.querySelectorAll("learningGoals goal")]
        .map(x => x.textContent),
      rating: parseFloat(g.querySelector("rating").textContent),
      image: g.querySelector("thumbnail").getAttribute("source"),
      genre: genreMap[g.getAttribute("genre")],
      applicationDomain: domainMap[g.getAttribute("applicationDomain")],
      sector: sectorMap[g.getAttribute("sector")],
      platforms: [...g.querySelectorAll("platformRef")]
        .map(p => platformMap[p.getAttribute("ref")])
    }));

    buildSectorNav();
    populateFilters();
    filter();
    drawChart(games);
  });

/* LOAD REVIEWS */
fetch("reviews.json")
  .then(r => r.json())
  .then(data => {
    reviews = data;
    filter();
  });

/* SECTOR NAV */
function buildSectorNav() {
  const nav = document.getElementById("sectorNav");
  const sectors = [...new Set(games.map(g => g.sector))];

  nav.innerHTML = `<button class="active" onclick="setSector('')">All</button>`;

  sectors.forEach(s => {
    nav.innerHTML += `<button onclick="setSector('${s}')">${s}</button>`;
  });
}

function setSector(sector) {
  activeSector = sector;
  document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  filter();
}

/* FILTER POPULATION */
function populateFilters() {
  fillSelect("genreFilter", new Set(games.map(g => g.genre)));
  fillSelect("domainFilter", new Set(games.map(g => g.applicationDomain)));
  fillSelect("platformFilter", new Set(games.flatMap(g => g.platforms)));
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

/* EVENTS */
searchInput.addEventListener("input", filter);
genreFilter.addEventListener("change", filter);
domainFilter.addEventListener("change", filter);
platformFilter.addEventListener("change", filter);
sortFilter.addEventListener("change", filter);

/* FILTER + SORT */
function filter() {
  let list = games.filter(g =>
    g.title.toLowerCase().includes(searchInput.value.toLowerCase()) &&
    (genreFilter.value === "" || g.genre === genreFilter.value) &&
    (domainFilter.value === "" || g.applicationDomain === domainFilter.value) &&
    (platformFilter.value === "" || g.platforms.includes(platformFilter.value)) &&
    (activeSector === "" || g.sector === activeSector)
  );

  switch (sortFilter.value) {
    case "title-asc": list.sort((a,b) => a.title.localeCompare(b.title)); break;
    case "title-desc": list.sort((a,b) => b.title.localeCompare(a.title)); break;
    case "rating-desc": list.sort((a,b) => b.rating - a.rating); break;
    case "rating-asc": list.sort((a,b) => a.rating - b.rating); break;
  }

  renderGames(list);
}

/* RENDER */
function renderGames(list) {
  const container = document.getElementById("games");
  container.innerHTML = "";

  list.forEach(g => {
    container.innerHTML += `
      <div class="game">
        <img src="images/${g.image}">
        <h3>${g.title} (${g.year})</h3>
        <p><strong>Rating:</strong> ${g.rating}</p>
        <p><strong>Genre:</strong> ${g.genre}</p>
        <p><a href="game.html?id=${g.id}">View details</a></p>
      </div>
    `;
  });
}

/* D3 */
function drawChart(games) {
  const counts = d3.rollups(games, v => v.length, d => d.genre);
  const svg = d3.select("#genreChart");
  svg.selectAll("*").remove();

  const x = d3.scaleBand().domain(counts.map(d => d[0])).range([0, 480]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(counts, d => d[1])]).range([280, 0]);

  svg.selectAll("rect")
    .data(counts)
    .enter()
    .append("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", d => 280 - y(d[1]))
    .attr("fill", "steelblue");
}
