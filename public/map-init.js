// Gymcat map initializer — reads coordinates from data attributes
(function() {
  function initMaps() {
    if (typeof L === 'undefined') {
      // Retry after 500ms if Leaflet hasn't loaded yet
      setTimeout(initMaps, 500);
      return;
    }

    var containers = document.querySelectorAll('[data-map-lat][data-map-lng]');
    containers.forEach(function(el) {
      var lat = parseFloat(el.getAttribute('data-map-lat') || '0');
      var lng = parseFloat(el.getAttribute('data-map-lng') || '0');
      var name = el.getAttribute('data-map-name') || '';

      if (!lat || !lng) return;

      try {
        var map = L.map(el).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        L.marker([lat, lng]).addTo(map).bindPopup(name);

        // Invalidate size after a short delay (fixes rendering in hidden/tab containers)
        setTimeout(function() { map.invalidateSize(); }, 200);
      } catch (e) {
        console.error('Map init failed for', name, e);
      }
    });
  }

  // Start initialization — with retry if L isn't loaded yet
  initMaps();
})();
