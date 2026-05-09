// GymCat — Client-side gym listing with instant filtering
(function() {
  var el = document.getElementById('gymcat-data');
  if (!el) return;
  var G = {
    gyms: JSON.parse(el.getAttribute('data-gyms') || '[]'),
    chains: JSON.parse(el.getAttribute('data-chains') || '[]'),
    facilities: JSON.parse(el.getAttribute('data-facs') || '[]'),
    facSVGs: JSON.parse(el.getAttribute('data-facsvgs') || '{}'),
  };

  var gyms = G.gyms;
  var facs = G.facilities;
  var svgs = G.facSVGs;
  var selectedFacs = [];
  var searchText = '';
  var show24h = false;
  var sortBy = 'relevance';
  var maxPrice = null;
  var selectedProvince = '';

  // Provinces for city matching
  var provinceMap = {
    'barcelona': 'Barcelona', 'badalona': 'Barcelona', 'terrassa': 'Barcelona',
    'sabadell': 'Barcelona', 'mataro': 'Barcelona', 'mataró': 'Barcelona',
    'hospitalet': 'Barcelona', "l'hospitalet": 'Barcelona', 'cornellà': 'Barcelona', 'cornella': 'Barcelona',
    'granollers': 'Barcelona', 'manresa': 'Barcelona', 'vic': 'Barcelona',
    'sitges': 'Barcelona', 'castelldefels': 'Barcelona', 'prat': 'Barcelona',
    'sant cugat': 'Barcelona', 'sants': 'Barcelona',
    'tarragona': 'Tarragona', 'reus': 'Tarragona',
    'lleida': 'Lleida',
    'girona': 'Girona', 'figueres': 'Girona', 'blanes': 'Girona',
  };

  // Read URL params
  try {
    var p = new URLSearchParams(location.search);
    if (p.get('fac')) selectedFacs = p.get('fac').split(',').filter(Boolean);
    if (p.get('q')) { searchText = p.get('q'); document.getElementById('search-input').value = searchText; }
    if (p.get('24h') === '1') { show24h = true; document.getElementById('filter-24h').checked = true; }
    if (p.get('sort')) { sortBy = p.get('sort'); document.getElementById('sort-select').value = sortBy; }
    if (p.get('max')) maxPrice = parseFloat(p.get('max'));
    if (p.get('city')) {
      var cn = p.get('city').toLowerCase();
      selectedProvince = provinceMap[cn] || '';
      if (selectedProvince) document.getElementById('city-select').value = selectedProvince;
      updateTitle();
    }
  } catch(e) {}

  function updateURL() {
    var u = new URL(location);
    u.searchParams.delete('q'); u.searchParams.delete('fac');
    u.searchParams.delete('24h'); u.searchParams.delete('sort'); u.searchParams.delete('max');
    if (searchText) u.searchParams.set('q', searchText);
    if (selectedFacs.length) u.searchParams.set('fac', selectedFacs.join(','));
    if (show24h) u.searchParams.set('24h', '1');
    if (sortBy !== 'relevance') u.searchParams.set('sort', sortBy);
    if (maxPrice) u.searchParams.set('max', maxPrice.toString());
    history.replaceState(null, '', u.toString());
  }

  function filter() {
    var results = gyms.slice();

    // Text search
    if (searchText) {
      var q = searchText.toLowerCase();
      results = results.filter(function(g) {
        return (g.name && g.name.toLowerCase().indexOf(q) !== -1) ||
               (g.address && g.address.toLowerCase().indexOf(q) !== -1) ||
               (g.chain && g.chain.toLowerCase().indexOf(q) !== -1);
      });
    }

    // 24h filter
    if (show24h) {
      results = results.filter(function(g) { return g.is24h; });
    }

    // Price filter
    if (maxPrice) {
      results = results.filter(function(g) { return g.price && g.price <= maxPrice; });
    }

    // Province / City filter
    if (selectedProvince) {
      results = results.filter(function(g) {
        if (!g.address) return false;
        var addr = g.address.toLowerCase();
        for (var city in provinceMap) {
          if (provinceMap[city] === selectedProvince && addr.indexOf(city) !== -1) return true;
        }
        return false;
      });
    }

    // Facility filter (AND logic)
    if (selectedFacs.length) {
      results = results.filter(function(g) {
        return selectedFacs.every(function(f) { return g.facilities.indexOf(f) !== -1; });
      });
    }

    // Sort
    if (sortBy === 'price_asc') {
      results.sort(function(a, b) { return (a.price || 999) - (b.price || 999); });
    } else if (sortBy === 'price_desc') {
      results.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
    }

    render(results);
    updateURL();
  }

  function updateTitle() {
    var title = document.getElementById('page-title');
    if (title) {
      title.textContent = selectedProvince ? 'Gimnasios en ' + selectedProvince : 'Gimnasios en Catalu\u00f1a';
    }
  }

  function render(gymList) {
    var grid = document.getElementById('gym-grid');
    var count = document.getElementById('result-count');
    count.textContent = gymList.length + ' gimnasios';
    updateTitle();

    if (gymList.length === 0) {
      grid.innerHTML = '<div style="text-align:center;padding:60px 0;grid-column:1/-1;"><p style="font-size:16px;font-weight:300;color:var(--color-mid-gray);">No se encontraron gimnasios.</p><a href="/gimnasios" style="font-size:14px;color:var(--color-link-blue);margin-top:12px;display:inline-block;">Limpiar filtros</a></div>';
    } else {
      grid.innerHTML = gymList.map(cardHTML).join('');
    }

    // Render filter chips
    renderFilterChips();
    renderActiveFilters();
  }

  function cardHTML(g) {
    var priceHTML = g.price ? '<span class="mono" style="font-size:16px;">' + g.price.toFixed(0) + '&euro;</span><span style="font-size:12px;font-weight:300;color:var(--color-mid-gray);">/mes</span>' : '<span style="font-size:12px;color:var(--color-mid-gray);">Precio no disponible</span>';
    var imageHTML = g.image
      ? '<div style="width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:8px;margin-bottom:12px;background:var(--color-off-white);"><img src="' + g.image + '" alt="' + esc(g.name) + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy" /></div>'
      : '<div style="width:100%;aspect-ratio:16/9;background:var(--color-off-white);border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M6 9l-3 3 3 3"/><path d="M18 9l3 3-3 3"/><path d="M12 5v14"/></svg></div>';
    var chainBadge = g.chain ? '<span style="display:inline-block;font-size:11px;font-weight:500;color:var(--color-mid-gray);padding:2px 8px;border-radius:var(--radius-pill);box-shadow:var(--shadow-ring-border);margin-bottom:8px;">' + esc(g.chain) + '</span>' : '';
    var addressHTML = g.address ? '<p style="font-size:13px;color:var(--color-mid-gray);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:2px;"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg> ' + esc(g.address) + '</p>' : '';
    var badges = [];
    if (g.is24h) badges.push('<span style="font-size:10px;font-weight:500;padding:2px 6px;border-radius:var(--radius-pill);background:var(--color-off-white);">24h</span>');
    if (g.matricula === 0) badges.push('<span style="font-size:10px;font-weight:500;color:#22c55e;padding:2px 6px;border-radius:var(--radius-pill);background:rgba(34,197,94,0.1);">Sin matr&iacute;cula</span>');

    return '<a href="/gimnasios/' + g.slug + '" class="card" style="display:block;text-decoration:none;color:inherit;transition:box-shadow 0.15s;">' +
      imageHTML + chainBadge +
      '<h3 style="font-size:17px;margin-bottom:4px;">' + esc(g.name) + '</h3>' +
      addressHTML +
      '<div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px;">' + priceHTML + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px;">' + badges.join('') + '</div>' +
      '</a>';
  }

  function renderFilterChips() {
    var container = document.getElementById('filter-chips');
    container.innerHTML = facs.map(function(f) {
      var sel = selectedFacs.indexOf(f.slug) !== -1;
      var svg = svgs[f.slug] || '';
      return '<span onclick="window._toggleFac(\'' + f.slug + '\')" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:6px 12px;border-radius:var(--radius-pill);cursor:pointer;transition:all 0.15s;border:1px solid ' + (sel ? 'var(--color-charcoal)' : 'rgba(34,42,53,0.12)') + ';background:' + (sel ? 'var(--color-charcoal)' : 'rgba(34,42,53,0.03)') + ';color:' + (sel ? 'white' : 'rgba(36,36,36,0.45)') + ';">' +
        svg + '<span style="font-weight:' + (sel ? '500' : '400') + '">' + esc(f.name) + '</span>' +
        (sel ? '<span style="font-size:14px;line-height:1;margin-left:2px;">&times;</span>' : '') +
        '</span>';
    }).join('');
  }

  function renderActiveFilters() {
    var container = document.getElementById('active-filters');
    var parts = [];
    var cp = new URLSearchParams(location.search).get('city');
    if (selectedFacs.length) {
      facs.forEach(function(f) {
        if (selectedFacs.indexOf(f.slug) !== -1) {
          parts.push('<span style="font-size:11px;padding:3px 10px;border-radius:var(--radius-pill);background:var(--color-charcoal);color:white;display:inline-flex;align-items:center;gap:4px;">' + esc(f.name) + ' <a href="#" onclick="window._toggleFac(\'' + f.slug + '\');return false" style="color:white;text-decoration:none;font-weight:bold;margin-left:2px;">&times;</a></span>');
        }
      });
    }

    if (show24h) parts.push('<span style="font-size:11px;padding:3px 10px;border-radius:var(--radius-pill);background:var(--color-charcoal);color:white;display:inline-flex;align-items:center;gap:4px;">24h <a href="#" onclick="document.getElementById(\'filter-24h\').checked=false;show24h=false;filter();return false" style="color:white;text-decoration:none;font-weight:bold;margin-left:2px;">&times;</a></span>');
    if (maxPrice) parts.push('<span style="font-size:11px;padding:3px 10px;border-radius:var(--radius-pill);background:var(--color-charcoal);color:white;display:inline-flex;align-items:center;gap:4px;">Hasta ' + maxPrice + '&euro; <a href="#" onclick="maxPrice=null;document.getElementById(\'price-filter\').value=\'\';filter();return false" style="color:white;text-decoration:none;font-weight:bold;margin-left:2px;">&times;</a></span>');
    if (cp) parts.push('<span style="font-size:11px;padding:3px 10px;border-radius:var(--radius-pill);background:var(--color-charcoal);color:white;display:inline-flex;align-items:center;gap:4px;">' + esc(cp) + ' <a href="#" onclick="var u=new URL(location);u.searchParams.delete(\'city\');history.replaceState(null,\'\',u.toString());location.reload();return false" style="color:white;text-decoration:none;font-weight:bold;margin-left:2px;">&times;</a></span>');

    if (parts.length) {
      container.style.display = 'flex';
      container.innerHTML = '<span style="font-size:11px;color:var(--color-mid-gray);">Filtros:</span> ' + parts.join(' ') + ' <a href="/gimnasios" style="font-size:11px;color:var(--color-link-blue);">Limpiar</a>';
    } else {
      container.style.display = 'none';
    }
  }

  window._toggleFac = function(slug) {
    var idx = selectedFacs.indexOf(slug);
    if (idx === -1) selectedFacs.push(slug);
    else selectedFacs.splice(idx, 1);
    filter();
  };

  window.toggleFilters = function() {
    var p = document.getElementById('filter-panel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
  };

  // Event listeners
  document.getElementById('search-input').addEventListener('input', function() {
    searchText = this.value.trim();
    filter();
  });

  document.getElementById('sort-select').addEventListener('change', function() {
    sortBy = this.value;
    filter();
  });

  document.getElementById('filter-24h').addEventListener('change', function() {
    show24h = this.checked;
    filter();
  });

  document.getElementById('city-select').addEventListener('change', function() {
    selectedProvince = this.value;
    updateTitle();
    filter();
  });

  function esc(s) { return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

  // Initial render
  renderFilterChips();
  filter();
})();
