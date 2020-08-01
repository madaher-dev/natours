/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFkYWhlciIsImEiOiJja2RiYnd5eHgxbTZpMnBzY2xwaGNoMTBqIn0.Z6vwWcnI0dTtNM0mvPxiOg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/madaher/ckdbc93tc21181ipuxf5n3orj',
    scrollZoom: false,
    // center: [-118.1407587, 34.176268],
    // zoom: 4,
    // interactive: false;
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    // Create a marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    // Extends map bounds to include current locations
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
