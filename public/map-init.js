// Gymcat map initializer — reads coordinates from data attributes
(function() {
  var containers = document.querySelectorAll('[data-map-lat][data-map-lng]');
  containers.forEach(function(el) {
    var lat = parseFloat(el.getAttribute('data-map-lat') || '0');
    var lng = parseFloat(el.getAttribute('data-map-lng') || '0');
    var name = el.getAttribute('data-map-name') || '';

    if (!lat || !lng) return;

    var map = L.map(el).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(name);
  });
})();
