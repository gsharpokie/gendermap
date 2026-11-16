/* Cultural Variation in Gender: map, filters, and list.
   All content comes from data/places.geojson. Edit that file to change the map. */
(function () {
  'use strict';

  // Colors for each kind of variation (Okabe-Ito palette, readable with common color-vision differences).
  var COLORS = {
    multiple: '#0072B2',
    crossing: '#D55E00',
    intersex: '#009E73',
    defining: '#CC79A7',
    law: '#E69F00'
  };

  var state = { data: null, markers: {}, active: {}, query: '', sortKey: 'title', sortDir: 1 };
  var map = L.map('map', { worldCopyJump: true, minZoom: 2, maxZoom: 10 }).setView([18, 20], 2);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // ---------- small DOM helpers (text is always set as text, never as HTML) ----------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function swatch(colors) {
    var s = el('span', { class: 'swatch', 'aria-hidden': 'true' });
    s.style.background = colors.length > 1
      ? 'linear-gradient(90deg, ' + colors[0] + ' 50%, ' + colors[1] + ' 50%)'
      : colors[0];
    return s;
  }

  function kindList(cats) {
    return el('ul', { class: 'kinds' }, cats.map(function (c) {
      return el('li', { class: 'kind' }, [swatch([COLORS[c]]), document.createTextNode(state.data.categories[c])]);
    }));
  }

  // Turns a URL at the end of a citation into a link.
  function citation(text) {
    var li = el('li');
    var m = text.match(/^(.*?)(https?:\/\/\S+)$/);
    if (m) {
      li.appendChild(document.createTextNode(m[1]));
      li.appendChild(el('a', { href: m[2], text: m[2] }));
    } else {
      li.textContent = text;
    }
    return li;
  }

  function linkList(links) {
    return el('ul', {}, links.map(function (l) {
      return el('li', {}, [el('a', { href: l.url, target: '_blank', rel: 'noopener', text: l.label })]);
    }));
  }

  // Full entry: used in map popups (h2/h3) and in the list (h4).
  function entryBody(p, headingTag) {
    var parts = [kindList(p.categories)];
    p.text.forEach(function (t) { parts.push(el('p', { text: t })); });
    if (p.links.length) {
      parts.push(el(headingTag, { text: 'Learn more' }));
      parts.push(linkList(p.links));
    }
    parts.push(el(headingTag, { text: p.sources.length > 1 ? 'Sources' : 'Source' }));
    parts.push(el('ol', { class: 'sources' }, p.sources.map(citation)));
    return parts;
  }

  function popupContent(p) {
    return el('div', { class: 'popup' },
      [el('h2', { text: p.title }), el('p', { class: 'term', text: p.term })].concat(entryBody(p, 'h3')));
  }

  // ---------- filtering ----------
  function matches(f) {
    var p = f.properties;
    var catOk = p.categories.some(function (c) { return state.active[c]; });
    if (!catOk) return false;
    if (!state.query) return true;
    var hay = [p.title, p.term].concat(p.text, p.sources, p.categories.map(function (c) {
      return state.data.categories[c];
    })).join(' ').toLowerCase();
    return hay.indexOf(state.query) !== -1;
  }

  function refresh() {
    var shown = 0;
    state.data.features.forEach(function (f) {
      var m = state.markers[f.id];
      var ok = matches(f);
      if (ok) { shown++; if (!map.hasLayer(m)) m.addTo(map); }
      else if (map.hasLayer(m)) { m.closePopup(); map.removeLayer(m); }
    });
    var total = state.data.features.length;
    document.getElementById('count').textContent = 'Showing ' + shown + ' of ' + total + ' places.';
    renderTable();
  }

  // ---------- list ----------
  function sortValue(f, key) {
    var p = f.properties;
    if (key === 'kind') return state.data.categories[p.categories[0]] + ' ' + p.title;
    return p[key];
  }

  function renderTable() {
    var tbody = document.querySelector('#places-table tbody');
    tbody.textContent = '';
    var rows = state.data.features.filter(matches).sort(function (a, b) {
      return sortValue(a, state.sortKey).localeCompare(sortValue(b, state.sortKey)) * state.sortDir;
    });
    if (!rows.length) {
      tbody.appendChild(el('tr', {}, [el('td', { colspan: '4', class: 'no-results', text: 'No places match. Try another search or turn on more filters.' })]));
      return;
    }
    rows.forEach(function (f) {
      var p = f.properties;
      var btn = el('button', { type: 'button', class: 'show-on-map', text: 'Show on map' });
      btn.addEventListener('click', function () { showOnMap(f.id); });
      var details = el('details', {}, [el('summary', { text: 'Read about ' + p.title })]
        .concat(entryBody(p, 'h4').slice(1)));  // kinds already shown in their own column
      tbody.appendChild(el('tr', {}, [
        el('th', { scope: 'row' }, [document.createTextNode(p.title), btn]),
        el('td', { text: p.term }),
        el('td', {}, [kindList(p.categories)]),
        el('td', {}, [details])
      ]));
    });
  }

  function showOnMap(id) {
    var m = state.markers[id];
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    map.setView(m.getLatLng(), Math.max(map.getZoom(), 4));
    m.openPopup();
    var icon = m.getElement();
    if (icon) icon.focus({ preventScroll: true });
  }

  function setupSorting() {
    document.querySelectorAll('#places-table th button').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-sort');
        state.sortDir = state.sortKey === key ? -state.sortDir : 1;
        state.sortKey = key;
        document.querySelectorAll('#places-table th[aria-sort]').forEach(function (th) {
          th.setAttribute('aria-sort', 'none');
        });
        b.parentNode.setAttribute('aria-sort', state.sortDir === 1 ? 'ascending' : 'descending');
        renderTable();
      });
    });
  }

  // ---------- page details ----------
  function setupCitationAndFeedback() {
    var url = window.location.href.split('#')[0];
    var cite = document.getElementById('citation');
    cite.appendChild(document.createTextNode(' '));
    cite.appendChild(el('a', { href: url, text: url }));
    // On GitHub Pages (user.github.io/repo/), point feedback to the repository's Issues page.
    var host = window.location.hostname.match(/^([^.]+)\.github\.io$/);
    var repo = window.location.pathname.split('/').filter(Boolean)[0];
    if (host && repo) {
      document.getElementById('feedback-link').href =
        'https://github.com/' + host[1] + '/' + repo + '/issues/new';
      document.getElementById('feedback').hidden = false;
    }
  }

  // ---------- start ----------
  fetch('data/places.geojson')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      state.data = data;
      if (data.updated) document.getElementById('updated').textContent = 'Updated ' + data.updated;

      var fs = document.getElementById('filters');
      Object.keys(data.categories).forEach(function (c) {
        state.active[c] = true;
        var box = el('input', { type: 'checkbox', checked: 'checked', value: c });
        box.addEventListener('change', function () { state.active[c] = box.checked; refresh(); });
        fs.appendChild(el('label', { class: 'filter' }, [box, swatch([COLORS[c]]), document.createTextNode(data.categories[c])]));
      });

      data.features.forEach(function (f) {
        var p = f.properties;
        var colors = p.categories.map(function (c) { return COLORS[c]; });
        var dot = swatch(colors).outerHTML.replace('class="swatch"', '');
        var icon = L.divIcon({ className: 'pin', html: dot, iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -11] });
        var c = f.geometry.coordinates;
        var label = p.title + ': ' + p.term;
        var m = L.marker([c[1], c[0]], { icon: icon, title: label, alt: label, keyboard: true, riseOnHover: true });
        m.bindPopup(function () { return popupContent(p); }, { maxWidth: 360, maxHeight: 340, autoPanPadding: [20, 20] });
        state.markers[f.id] = m;
      });

      document.getElementById('search').addEventListener('input', function (e) {
        state.query = e.target.value.trim().toLowerCase();
        refresh();
      });
      setupSorting();
      setupCitationAndFeedback();
      refresh();
    })
    .catch(function (err) {
      var msg = el('p', { class: 'notice', text: 'The map data could not be loaded (' + err.message + '). If you opened this file directly from your computer, see the README for how to preview it.' });
      document.querySelector('main').insertBefore(msg, document.getElementById('map'));
    });
})();
