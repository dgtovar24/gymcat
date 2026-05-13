// Gymcat map initializer — uses Google Maps
(function() {
  function initMaps() {
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
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
        var position = { lat: lat, lng: lng };
        var map = new google.maps.Map(el, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        var marker = new google.maps.Marker({
          position: position,
          map: map,
          title: name,
        });

        if (name) {
          var infoWindow = new google.maps.InfoWindow({ content: name });
          marker.addListener('click', function() {
            infoWindow.open(map, marker);
          });
        }
      } catch (e) {
        console.error('Map init failed for', name, e);
      }
    });
  }

  initMaps();
})();
