# Third-Party Sources

- D3 7.9.0: https://github.com/d3/d3 (ISC; see D3-LICENSE).
- topojson-client 3.1.0: https://github.com/topojson/topojson-client (ISC; see TOPOJSON-LICENSE).
- world-atlas 2.0.2: https://github.com/topojson/world-atlas (ISC; see WORLD-ATLAS-LICENSE).
- Underlying land geometry: Natural Earth, public domain, https://www.naturalearthdata.com/about/terms-of-use/.

Pinned distributions were downloaded from jsDelivr npm package mirrors. They are served locally; browsing this site does not contact those CDNs.

`assets/data/land-110m.json` is the unchanged world-atlas land dataset. `assets/data/land-110m.js` wraps the same parsed TopoJSON in `window.triathlonLand` for offline / file-based use.

The 1:110m coastline is a simplified geographic overview, not a cadastral map or an accurate city-site evaluation. Country boundaries, city locations, detailed rivers and elevation are not included. Candidate points are planning references, not canon cities or terrain-derived recommendations.
