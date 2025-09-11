// 添加点线面图层
import { Feature } from "ol";
import { Circle as CircleGeom, LineString, MultiPolygon, Point, Polygon } from "ol/geom";
import * as olProj from 'ol/proj';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { map } from "./BaseMap";
import * as mapStyle from './Style'


//点--[]
let pointLayer: any = null;
const addPoint = (coord: number[]) => {
  clearPoint();
  let point = new Point(olProj.fromLonLat(coord));
  let featurePoint = new Feature({
    geometry: point,
    name: 'point'
  });
  pointLayer = new VectorLayer({
    source: new VectorSource({
      features: [featurePoint]
    }),
    className: 'pointLayer',
    style: mapStyle.pointStyle,
    zIndex: 1
  })
  map.addLayer(pointLayer);
};
const clearPoint = () => {
  if (pointLayer) {
    map.removeLayer(pointLayer);
    pointLayer = null;
  }
};


//图标--[]
let iconLayer: any = null;
const addIcon = (coord: number[]) => {
  clearIcon();
  let icon = new Point(olProj.fromLonLat(coord));
  let featureIcon = new Feature({
    geometry: icon,
    name: 'icon'
  });
  iconLayer = new VectorLayer({
    source: new VectorSource({
      features: [featureIcon]
    }),
    className: 'iconLayer',
    style: mapStyle.iconStyle,
    zIndex: 1
  })
  map.addLayer(iconLayer);
};
const clearIcon = () => {
  if (iconLayer) {
    map.removeLayer(iconLayer);
    iconLayer = null;
  }
};

//线--[[],[]]
let lineLayer: any = null;
const addLine = (coord: number[][]) => {
  clearLine();
  let line = new LineString(coord);
  line.applyTransform(olProj.getTransform("EPSG:4326", "EPSG:3857"));
  let lineFeature = new Feature({
    geometry: line,
    name: 'line'
  });
  lineLayer = new VectorLayer({
    source: new VectorSource({
      features: [lineFeature]
    }),
    className: 'lineLayer',
    style: mapStyle.lineStyles,
    zIndex: 1
  });
  map.addLayer(lineLayer);
};
const clearLine = () => {
  if (lineLayer) {
    map.removeLayer(lineLayer);
    lineLayer = null;
  }
};

//圆--半径以米为单位
let circleLayer: any = null;
const addCircle = (coord: number[], radius: number) => {
  clearCircle();
  let circle = new CircleGeom(coord, radius).clone().transform("EPSG:4326", "EPSG:3857");
  let circleFeature = new Feature({
    geometry: circle,
    name: 'circle'
  });
  circleLayer = new VectorLayer({
    source: new VectorSource({
      features: [circleFeature]
    }),
    className: 'circleLayer',
    style: mapStyle.circleStyle,
    zIndex: 1
  });
  map.addLayer(circleLayer);
};
const clearCircle = () => {
  if (circleLayer) {
    map.removeLayer(circleLayer);
    circleLayer = null;
  }
};
//多边形--[[[],[],[]...,[]]]
let polygonLayer: any = null;
const addPolygon = (coord: number[][][]) => {
  clearPolygon();
  let polygon = new Polygon(coord).transform("EPSG:4326", "EPSG:3857");
  let polygonFeature = new Feature({
    geometry: polygon,
    name: 'polygon'
  });
  polygonLayer = new VectorLayer({
    source: new VectorSource({
      features: [polygonFeature]
    }),
    className: 'polygonLayer',
    style: mapStyle.circleStyle,
    zIndex: 1
  });
  map.addLayer(polygonLayer);
};
const clearPolygon = () => {
  if (polygonLayer) {
    map.removeLayer(polygonLayer);
    polygonLayer = null;
  }
};
//复杂多边形--[polygon1,polygon2,...,polygonN]
let multiPolygonLayer: any = null;
const addMultiPolygon = (coord: number[][][][]) => {
  clearMultiPolygon();
  let multiPolygon = new MultiPolygon(coord).transform("EPSG:4326", "EPSG:3857");
  let multiPolygonFeature = new Feature({
    geometry: multiPolygon,
    name: 'multiPolygon'
  });
  multiPolygonLayer = new VectorLayer({
    source: new VectorSource({
      features: [multiPolygonFeature]
    }),
    className: 'multiPolygonLayer',
    style:mapStyle.polygonStyle,
    zIndex: 1
  });
  map.addLayer(multiPolygonLayer);
};
const clearMultiPolygon = () => {
  if (multiPolygonLayer) {
    map.removeLayer(multiPolygonLayer);
    multiPolygonLayer = null;
  }
};
//五角星
let starLayer: any = null;
const addStar = (coord: number[]) => {
  clearStar();
  let star = new Point(olProj.fromLonLat(coord));
  let featureStar = new Feature({
    geometry: star,
    name: 'star'
  });
  starLayer = new VectorLayer({
    source: new VectorSource({
      features: [featureStar]
    }),
    className: 'starLayer',
    style: mapStyle.starStyle,
    zIndex: 1
  })
  map.addLayer(starLayer);
};
const clearStar = () => {
  if (starLayer) {
    map.removeLayer(starLayer);
    starLayer = null;
  }
};

const clearAddAll = () => {
  clearPoint();
  clearIcon();
  clearLine();
  clearCircle();
  clearPolygon();
  clearMultiPolygon();
  clearStar();
};

export {
  addPoint,
  addIcon,
  addLine,
  addCircle,
  addPolygon,
  addMultiPolygon,
  addStar,
  clearAddAll,
  clearPoint,
  clearIcon,
  clearLine,
  clearCircle,
  clearPolygon,
  clearMultiPolygon,
  clearStar
}