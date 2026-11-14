# Cultural Variation in Gender

An interactive map of how societies past and present have organized sex and gender, with sources for every entry. By Gwen Sharp, as part of the instructor resources for *A Sociology Experiment*.

The page has three parts:

- a map with colored pins (one color for each kind of variation; pins that fit two kinds are split in half)
- filters and a search box that control both the map and the list
- a sortable list of all places with the same information as the map, for screen reader users and anyone who prefers a list

## Files

| File | What it is |
|---|---|
| `data/places.geojson` | **All of the map’s content.** Every place, its text, links, sources, and kinds of variation. This is the only file you need to edit to change the map. |
| `index.html` | The page itself |
| `css/style.css` | Colors, fonts, and layout |
| `js/app.js` | Builds the map, filters, and list from the data file |
| `LICENSE` | CC BY 4.0 license for the map’s text and data |
| `vendor/leaflet/` | The map library ([Leaflet](https://leafletjs.com/) 1.9.4), included so the site doesn’t depend on another server |

## Live site

https://gsharpokie.github.io/gendermap/

To turn the site on (one time): go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the **main** branch and the **/ (root)** folder, and select **Save**. The site goes live a minute or two later.

The page’s “Suggest a correction or addition” link opens a new issue in this repository, so keep Issues turned on (Settings → General → Features).

## Editing the map

Open `data/places.geojson` on GitHub, select the pencil icon to edit, make your change, and select **Commit changes**. The live site updates within a few minutes. GitHub also shows `.geojson` files as a map, so you can check pin locations by opening the file.

Each place looks like this:

```json
{
  "type": "Feature",
  "id": 7,
  "geometry": { "type": "Point", "coordinates": [-175.24292, -21.1556] },
  "properties": {
    "title": "Tonga",
    "term": "Fakaleitī",
    "categories": ["multiple"],
    "text": ["First paragraph.", "Second paragraph (optional)."],
    "links": [{ "label": "More information and photos", "url": "https://example.org" }],
    "sources": ["Besnier, Niko. 1997. “Sluts and Superwomen: …” Ethnos 62 (1–2): 5–31."]
  }
}
```

Things to know:

- **Coordinates are longitude first, then latitude** (the opposite of Google Maps). To get them, right-click a spot in Google Maps; it shows latitude, longitude, so swap them.
- **`categories`** uses these short names: `multiple` (Third and multiple genders), `crossing` (Taking on another gender’s role), `intersex` (Intersex variation), `defining` (What makes someone a man or a woman), `law` (Law and legal recognition). A place can have more than one. The display names are in `"categories"` near the top of the data file; the colors are at the top of `js/app.js`.
- **`text`** is a list of paragraphs. Write plain text (no HTML). Use curly quotes and apostrophes.
- **`links`** can be an empty list: `[]`.
- **`sources`**: a URL at the end of a citation becomes a link automatically.
- Separate places with a comma, and don’t leave a comma after the last one. If the map stops loading after an edit, a missing or extra comma is the usual cause; GitHub’s file view will show an error.
- Update `"updated"` near the top of the data file when you make changes; the page shows it.

## Previewing on your own computer

Opening `index.html` directly won’t load the data (browsers block that for security). Instead, open a terminal in this folder and run `python -m http.server`, then go to http://localhost:8000.

## License

The map’s text and data are © 2026 Gwen Sharp and licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/); see `LICENSE`. Anyone may share and adapt them with credit. Leaflet (`vendor/leaflet/`) keeps its own BSD 2-Clause License.

## Credits

Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Map display by [Leaflet](https://leafletjs.com/) (BSD 2-Clause License; see `vendor/leaflet/LICENSE`).
