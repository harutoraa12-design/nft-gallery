# NFT Gallery

A static, responsive NFT gallery showcasing curated digital collectibles.
Renders metadata from a single JSON file — no backend, no build step.

**Live:** https://harutoraa12-design.github.io/nft-gallery/

## Features

- **Grid layout** — auto-fills responsive cards on any screen size
- **Live search** — search by name, collection, description, or any trait value
- **Filters** — dropdown filters by collection and rarity
- **Modal detail** — click any card for full-size image + attribute table + on-chain link
- **Stats** — total NFTs, unique collections, unique traits at the top
- **Cache-bust** — JSON fetches with `?t=<timestamp>` so deploys always show fresh data
- **Pure vanilla** — no framework, no build, no dependencies. Just HTML + CSS + JS
- **Dark NFT aesthetic** — gold accent + rarity-tier color coding (Common → Mythic)

## Repo layout

```
nft-gallery/
├── docs/                  ← GitHub Pages source
│   ├── index.html         ← dashboard
│   ├── style.css          ← dark theme
│   ├── app.js             ← render + filter + modal logic
│   └── nfts.json          ← gallery data (edit this!)
├── .gitignore
├── LICENSE
└── README.md
```

## Edit the gallery

Open `docs/nfts.json` and add/remove/edit entries. Each NFT follows this shape:

```json
{
  "id": "unique-slug-here",
  "name": "Display Name",
  "image": "https://example.com/nft.jpg",
  "collection": "Collection Name",
  "description": "Plain-text description shown in the modal.",
  "external_link": "https://opensea.io/assets/.../123",
  "attributes": [
    {"trait_type": "Background", "value": "Galaxy"},
    {"trait_type": "Rarity", "value": "Legendary"}
  ]
}
```

**Recognized rarity values** (color-coded in the UI): `Common`, `Rare`,
`Epic`, `Legendary`, `Mythic`. Any value with `trait_type: "Rarity"` will
be highlighted with the matching tier color.

**Image hosting** — works with any public URL. Common sources:
- IPFS gateway: `https://ipfs.io/ipfs/<CID>` or `https://cloudflare-ipfs.com/ipfs/<CID>`
- Arweave: `https://arweave.net/<txid>`
- Direct hosting on your own CDN / S3 / GitHub

## Run locally

Open `docs/index.html` directly in a browser — but for `fetch()` to work
on `nfts.json`, you need an HTTP server (browsers block `file://` fetches):

```bash
cd docs && python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

The repo uses GitHub Pages with `legacy` build type, source `/docs` on
`main`. Edit `docs/nfts.json`, commit, push — the live site updates
within ~30 seconds.

```bash
git add docs/nfts.json
git commit -m "feat: add Cosmic Ape #002"
git push
```

## Roadmap

- [ ] On-chain fetch mode (read directly from an ERC-721 contract via public RPC)
- [ ] Wallet-gated "owned by me" filter
- [ ] Per-collection theme override
- [ ] Multi-chain support (Solana, Polygon, Base)

## License

MIT
