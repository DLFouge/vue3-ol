// 绘制点线面图层
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { map } from "./BaseMap";
import { Modify,Snap ,Draw} from 'ol/interaction';
import { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import {Polygon} from 'ol/geom';
import * as olProj from 'ol/proj';
import * as mapStyle from './Style'

// 点、线、多边形、圆、矩形、正方形、五角星
//'Point' =='MultiPoint', 'LineString', 'Polygon','GeometryCollection', 'Circle'
let draw: any, snap: any;
const source = new VectorSource();
const drawShape = (shape: string) => {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  let value = shape;
  let geometryFunction;
  //创建源及图层
  // const source = new VectorSource();
  let layer = new VectorLayer({
    source: source,
    style: mapStyle.drawStyle,
    zIndex: 1
  });
  map.addLayer(layer);

  //绘制图形可拖拽变形
  const modify = new Modify({ source: source});
  map.addInteraction(modify);

  if (shape === 'Square') {
    value = 'Circle';
    geometryFunction = createRegularPolygon(4);
  } else if (shape === 'Rectangle') {
    value = 'Circle';
    geometryFunction = createBox();
  } else if (shape === 'Star') {
    value = 'Circle';
    geometryFunction = createStar();
  }
  draw = new Draw({
    source: source,
    type: value,
    geometryFunction: geometryFunction,
  });
  //绘制结束时获取绘制图形经纬度
  draw.on('drawend', (e: any) => {
    const geometry = e.feature.getGeometry();
    let coordinates: any;
    let radius: number;
    if (shape === 'Circle') {
      coordinates = geometry.getCenter();  //获取圆的圆心坐标和半径
      radius = geometry.getRadius();
    } else {
      coordinates = geometry.getCoordinates(); //获取绘制图形顶点坐标
    }
    let coord = getLngLat(shape, coordinates);
    console.log('drawend2', coord);
  });
  map.addInteraction(draw);

  //撤回绘制
  draw.on('drawstart',(evt:any)=>{
    document.onkeydown = (event:any) =>{
      if(event.keyCode === 27){ //当按下ESC时执行removeLastPoint()去除画的上一个点
        draw.removeLastPoint();
      }
    }
  })

  // 鼠标捕捉--当修改和绘制矢量要素时，鼠标距离某个要素一定距离之内，自动吸附到要素
  snap = new Snap({source: source});
  map.addInteraction(snap);

};
const createStar = () => {
  return function (coordinates: any, geometry: any) {
    const center = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const dx = center[0] - last[0];
    const dy = center[1] - last[1];
    const radius = Math.sqrt(dx * dx + dy * dy);
    const rotation = Math.atan2(dy, dx);
    const newCoordinates = [];
    const numPoints = 12;
    for (let i = 0; i < numPoints; ++i) {
      const angle = rotation + (i * 2 * Math.PI) / numPoints;
      const fraction = i % 2 === 0 ? 1 : 0.5;
      const offsetX = radius * fraction * Math.cos(angle);
      const offsetY = radius * fraction * Math.sin(angle);
      newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
    }
    newCoordinates.push(newCoordinates[0].slice());
    if (!geometry) {
      geometry = new Polygon([newCoordinates]);
    } else {
      geometry.setCoordinates([newCoordinates]);
    }
    return geometry;
  }
};
const calibrateOpenLayerLngLat = (lngLat: number[]) => {
  let longitude = lngLat[0];
  // 这里由于openLayers 会得到越过-180 到 180 的经度值
  const posLng = Math.abs(longitude) + 180
  const divisor = Math.floor(posLng / 360)
  if (longitude < 0) {
    longitude = longitude + divisor * 360
  } else if (longitude > 0) {
    longitude = longitude - divisor * 360
  }
  return [longitude,lngLat[1]]
};
//坐标转换
const getCoordinatesLngLat = (coordinates: number[]) => {
  const coordinatesNew: any = [];
  coordinates.forEach((coordinate: any) => {
    const lngLatOrigin = olProj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    const coord = calibrateOpenLayerLngLat(lngLatOrigin);
    coordinatesNew.push(coord)
  })
  return coordinatesNew
};
const getLngLat = (type: string, coord: any[]) => {
  let farmerGeoJson:any;
  switch (type) {
    case 'Point':
    case 'Circle':
      farmerGeoJson = olProj.transform(coord, 'EPSG:3857', 'EPSG:4326');
      break;
    case 'LineString':
      farmerGeoJson = getCoordinatesLngLat(coord);
      break;
    case 'Polygon':
    case 'Square':
    case 'Rectangle':
    case 'Star':
      farmerGeoJson = getCoordinatesLngLat(coord[0]);
      break;
    default:
      farmerGeoJson = null;
      break;
  }
  return farmerGeoJson;
};

const clearDraw = () => {
  source.clear();
  map.removeInteraction(draw);
  map.removeInteraction(snap);
}


export {
  drawShape,
  clearDraw
}