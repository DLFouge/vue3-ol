//webgl方式实现海量数据加载
import { map } from "./BaseMap";
import * as mapStyle from './Style'
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Circle as CircleGeom, LineString, MultiPolygon, Point, Polygon } from "ol/geom";
import * as olProj from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
let pointLayer:any = null;
//循环遍历数组
const addWebglPoint1 = (array:any) => {
    clearWebglPoint();
    let source:any = new VectorSource({}); 
    array.forEach((item:any) => {
        let point = new Point(olProj.fromLonLat(item.coord));
        let featurePoint = new Feature({
        geometry: point,
        name: 'point'
        });
        source.addFeature(featurePoint);
    })
    const newLiteralStyle:any =  mapStyle.predefinedStyles["point"];
    pointLayer = new WebGLPointsLayer({
        source: source,
        style: newLiteralStyle,
        className: 'marker',
        zIndex: 3,
        disableHitDetection: true,	//是否开启碰撞检测
    });
    map.addLayer(pointLayer);
};
const clearWebglPoint = () => {
    if (pointLayer) {
      map.removeLayer(pointLayer);
      pointLayer = null;
    }
};
//直接获取geojson数据
const addWebglPoint = () => {
    clearWebglPoint();
    let source:any = new VectorSource({
        url: '/data.geojson',
        format: new GeoJSON(),
        wrapX: true
    });
    const newLiteralStyle:any =  mapStyle.predefinedStyles["point"];
    pointLayer = new WebGLPointsLayer({
        source: source,
        style: newLiteralStyle,
        disableHitDetection: true,	//是否开启碰撞检测
    });
    map.addLayer(pointLayer);
};
export {
    addWebglPoint,
    clearWebglPoint
}