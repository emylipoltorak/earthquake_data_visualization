import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';
import XYZSource from 'ol/source/xyz';
import VectorSource from 'ol/source/vector';
import proj from 'ol/proj';
import Style from 'ol/style/style';
import IconStyle from 'ol/style/icon';
import Circle from 'ol/style/circle';
import Overlay from 'ol/overlay';
import coordinate from 'ol/coordinate';
import GeoJSON from 'ol/format/geojson';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import colormap from 'colormap';


function earthquakeLocations() {
  $.ajax({
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
    type: 'GET',
    success: function(r) {
      console.log(r);
    },
    error: function(e) {
      console.log(e);
    }
  });
}

earthquakeLocations();

const map = new Map ({
  target: 'map-container',
  layers: [
    new TileLayer({
      source: new XYZSource({
        url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
      })
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

const magToColor = colormap({
  colormap: 'jet',
  nshades: 100,
  format: 'rgbaString'
});

function getColor(feature) {
  const magnitude = Math.floor(feature.get('mag') * 10);
  console.log(magToColor[magnitude]);
  return magToColor[magnitude];
}

const vector = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
  }),
  style: function(feature) {
    return new Style({
      fill: new Fill({
        color: getColor(feature)
      }),
      stroke: new Stroke({
        color: 'rgba(0,0,0,1)'
      })
    });
  }
});


map.addLayer(vector);

navigator.geolocation.getCurrentPosition(function(pos) {
  const coords = proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]);
  map.getView().animate({center: coords, zoom: 8});
});

let overlay = new Overlay({
  element: document.getElementById('popup-container'),
  positioning: 'bottom-center',
  offset: [0, -10]
});

map.addOverlay(overlay);

map.on('click', e => {
  overlay.setPosition();
  let features = map.getFeaturesAtPixel(e.pixel);
  if (features) {
    let coords = features[0].getGeometry().getCoordinates();
    overlay.getElement().innerHTML = coordinate.toStringHDMS(proj.toLonLat(coords));
    overlay.setPosition(coords);
  }
});
