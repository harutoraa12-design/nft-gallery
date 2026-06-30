// NFT Gallery — vanilla JS renderer with search, filter, modal detail
const DATA_URL = "nfts.json";

const state = {
  data: null,
  search: "",
  collection: "",
  rarity: "",
};

let allNfts = [];

async function loadData() {
  try {
    const res = await fetch(DATA_URL + "?t=" + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to load nfts.json:", err);
    document.getElementById("grid").innerHTML = `
      <p class="empty">Could not load gallery data. Check the repo's <code>docs/nfts.json</code>.</p>
    `;
    return null;
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rarityClass(value) {
  return "rarity-" + String(value || "").replace(/\s+/g, "");
}

function renderHeader(meta) {
  if (meta.title) {
    document.getElementById("gallery-title").textContent = meta.title;
    document.title = meta.title;
  }
  if (meta.tagline) {
    document.getElementById("gallery-tagline").textContent = meta.tagline;
  }
  if (meta.last_updated) {
    document.getElementById("last-updated").textContent = meta.last_updated;
  }
}

function computeStats(nfts) {
  const collections = new Set();
  const traits = new Set();
  nfts.forEach((n) => {
    if (n.collection) collections.add(n.collection);
    (n.attributes || []).forEach((a) => {
      if (a.trait_type && a.value) traits.add(`${a.trait_type}:${a.value}`);
    });
  });
  document.getElementById("stat-total").textContent = nfts.length;
  document.getElementById("stat-collections").textContent = collections.size;
  document.getElementById("stat-traits").textContent = traits.size;
}

function populateFilters(nfts) {
  const collections = [...new Set(nfts.map((n) => n.collection).filter(Boolean))].sort();
  const rarities = [...new Set(nfts.flatMap((n) =>
    (n.attributes || []).map((a) => a.value).filter((v) =>
      ["Common", "Rare", "Epic", "Legendary", "Mythic"].includes(v)
    )
  ))].sort();

  const csel = document.getElementById("collection-filter");
  csel.innerHTML = `<option value="">All collections</option>` +
    collections.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  const rsel = document.getElementById("rarity-filter");
  rsel.innerHTML = `<option value="">All rarities</option>` +
    rarities.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("");
}

function getRarity(nft) {
  const a = (nft.attributes || []).find((x) => x.trait_type && x.trait_type.toLowerCase() === "rarity");
  return a ? a.value : null;
}

function matchesSearch(nft, query) {
  if (!query) return true;
  const haystack = [
    nft.name,
    nft.collection,
    nft.description,
    ...(nft.attributes || []).flatMap((a) => [a.trait_type, a.value]),
  ].join(" ").toLowerCase();
  return query.toLowerCase().split(/\s+/).every((tok) => haystack.includes(tok));
}

function getFiltered() {
  return allNfts.filter((nft) => {
    if (!matchesSearch(nft, state.search)) return false;
    if (state.collection && nft.collection !== state.collection) return false;
    if (state.rarity && getRarity(nft) !== state.rarity) return false;
    return true;
  });
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const filtered = getFiltered();

  document.getElementById("result-count").textContent =
    `${filtered.length} of ${allNfts.length} NFTs`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  grid.innerHTML = filtered.map((nft) => {
    const rarity = getRarity(nft);
    const traitsToShow = (nft.attributes || [])
      .filter((a) => a.trait_type && a.value && a.trait_type.toLowerCase() !== "rarity")
      .slice(0, 3);
    const rarityPill = rarity
      ? `<span class="trait-pill ${rarityClass(rarity)}">${escapeHtml(rarity)}</span>`
      : "";
    return `
      <article class="card" data-id="${escapeHtml(nft.id)}">
        <div class="card-image-wrap">
          <img class="card-image" src="${escapeHtml(nft.image)}" alt="${escapeHtml(nft.name)}" loading="lazy" />
        </div>
        <div class="card-body">
          <p class="card-collection">${escapeHtml(nft.collection || "Uncategorized")}</p>
          <h3 class="card-name">${escapeHtml(nft.name)}</h3>
          <div class="card-traits">
            ${rarityPill}
            ${traitsToShow.map((a) =>
              `<span class="trait-pill">${escapeHtml(a.value)}</span>`
            ).join("")}
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".card").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const nft = allNfts.find((n) => n.id === id);
      if (nft) openModal(nft);
    });
  });
}

function openModal(nft) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-image").src = nft.image || "";
  document.getElementById("modal-image").alt = nft.name || "";
  document.getElementById("modal-collection").textContent = nft.collection || "";
  document.getElementById("modal-name").textContent = nft.name || "";
  document.getElementById("modal-desc").textContent = nft.description || "";

  const attrs = document.getElementById("modal-attrs");
  attrs.innerHTML = (nft.attributes || []).map((a) => `
    <div class="attr">
      <div class="attr-type">${escapeHtml(a.trait_type || "")}</div>
      <div class="attr-value ${a.trait_type && a.trait_type.toLowerCase() === 'rarity' ? rarityClass(a.value) : ''}">${escapeHtml(a.value || "")}</div>
    </div>
  `).join("");

  const link = document.getElementById("modal-link");
  if (nft.external_link) {
    link.href = nft.external_link;
    link.hidden = false;
  } else {
    link.hidden = true;
  }

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// === Event wiring ===
document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadData();
  if (!data) return;

  state.data = data;
  allNfts = data.nfts || [];

  if (data.meta) renderHeader(data.meta);
  computeStats(allNfts);
  populateFilters(allNfts);
  renderGrid();

  document.getElementById("search").addEventListener("input", (e) => {
    state.search = e.target.value;
    renderGrid();
  });
  document.getElementById("collection-filter").addEventListener("change", (e) => {
    state.collection = e.target.value;
    renderGrid();
  });
  document.getElementById("rarity-filter").addEventListener("change", (e) => {
    state.rarity = e.target.value;
    renderGrid();
  });
  document.getElementById("reset-btn").addEventListener("click", () => {
    state.search = "";
    state.collection = "";
    state.rarity = "";
    document.getElementById("search").value = "";
    document.getElementById("collection-filter").value = "";
    document.getElementById("rarity-filter").value = "";
    renderGrid();
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("modal").hidden) closeModal();
  });
});
