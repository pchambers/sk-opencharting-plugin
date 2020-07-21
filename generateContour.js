const async = require("async");
const fs = require("fs");
var geo = require("geojson");
var contours = require("d3-contour").contours;

//resolution in degrees for lat and long
const inc = 0.00001;

var contour = {
  limits: {
    lat: {
      min: 360,
      max: -360
    },
    long: {
      min: 360,
      max: -360
    }
  },
  size: {},
  depth: [],
  coordinates: [],
  geoJsonContour:{}
};

var generateContour = {};

//takes basic <lat>.<long>.depth object as arguement
//returns rectangular formatted data to be used as input to d3-contour.contours()
generateContour.formatPlot = plot => {
  for (lat in plot) {
    lat = Number.parseFloat(lat).toFixed(5);
    for (long in plot[lat]) {
      long = Number.parseFloat(long).toFixed(5);
      //contour.depth.push = plot[lat][long].depth;
      //contour.coordinates.push([lat,long]);
      contour.limits = generateContour.updateLimits(contour.limits, lat, long);
    }
  }
  contour.size = generateContour.setSize(contour.limits);

  contour = generateContour.squareContour(contour, plot);

  return contour;
};

//iterates from top left corner and moves right then down.
generateContour.squareContour = (contour, plot) => {
  //console.log(JSON.stringify(contour, null, 2));

  for (var y = 0; y < contour.size.height; y++) {
    lat = parseFloat(contour.limits.lat.max - y * inc).toFixed(5);
    for (var x = 0; x < contour.size.width; x++) {
      long = parseFloat(contour.limits.long.max - x * inc).toFixed(5);
      //console.log(long + ", " + lat);
      contour.coordinates.push([long, lat]);

      try {
        contour.depth.push(plot[lat][long].depth);
      } catch {
        contour.depth.push(null);
      }
    }
  }
  return contour;
};

//takes our contour object and creates a new file with the uuid in './contours' directory
//
generateContour.renderContour = (contour, uuid,thresholds) => {
  let polygons = contours()
  .size([contour.size.width, contour.size.height])
  //.thresholds(thresholds)
  (contour.depth);
  contour.geoJsonContour = {
    type: "FeatureCollection",
    features: []
  };
  for (let polygon of polygons) {
    if (polygon.coordinates.length === 0) continue;
    let coords = convertCoords(polygon.coordinates, contour);
    contour.geoJsonContour.features.push({
      type: "Feature",
      properties: {
        value: polygon.value
      },
      geometry: {
        type: polygon.type,
        coordinates: coords
      }
    });
  }

  fs.writeFileSync(
    "./contours/" + uuid + ".json",
    JSON.stringify(contour.geoJsonContour, null, 2)
  );

  return contour;
};

generateContour.updateLimits = (limits, lat, long) => {
  if (parseFloat(lat) > parseFloat(limits.lat.max)) limits.lat.max = parseFloat(lat);
  if (parseFloat(lat) < parseFloat(limits.lat.min)) limits.lat.min = parseFloat(lat);
  if (parseFloat(long) > parseFloat(limits.long.max)) limits.long.max = parseFloat(long);
  if (parseFloat(long) < parseFloat(limits.long.min)) limits.long.min = parseFloat(long);

  return limits;
};

generateContour.setSize = limits => {
  var size = {
    width: null,
    height: null
  };
  size.width = Math.round(
    Math.abs(
      contour.limits.long.max * (1 / inc) - contour.limits.long.min * (1 / inc)
    )
  );
  size.height = Math.round(
    Math.abs(
      contour.limits.lat.max * (1 / inc) - contour.limits.lat.min * (1 / inc)
    )
  );
  size.arrayLength = size.width * size.height;
  return size;
};

module.exports = generateContour;

function convertCoords(coords, { limits, size }) {
  var result = [];
  for (let poly of coords) {
    var newPoly = [];
    for (let ring of poly) {
      if (ring.length < 4) continue;
      var newRing = [];
      let i = 0;
      for (let p of ring) {
        newRing.push([
           parseFloat((limits.long.min -(limits.long.max - limits.long.min) * (p[0] / size.width)).toFixed(5)),
           parseFloat((limits.lat.max +(limits.lat.max - limits.lat.min) * (p[1] / size.height)).toFixed(5))
        ]);
        i++;
    }
      newPoly.push(newRing);
    }
    result.push(newPoly);
  }
  return result
}
