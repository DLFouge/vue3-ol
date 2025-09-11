//热力图
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Heatmap from 'ol/layer/Heatmap';
import * as olProj from 'ol/proj';
import { map } from "./BaseMap";

let center = olProj.fromLonLat([113.293956, 23.07975]);
let heatmapLayer: any;
const addHeatmapLayer = (idB: string, idR:string) => {
  // 开始做热力图相关功能
  let blur = <any>document.getElementById(idB);
  let radius = <any>document.getElementById(idR);
  //定义热力图图层
  heatmapLayer = new Heatmap({
    source: new VectorSource({
      url: "/heatmap.geojson",
      format: new GeoJSON()
    }),
    blur: parseInt(blur.value, 10),
    radius: parseInt(radius.value, 10),
    gradient:['#00f','#0ff','#0f0','#ff0','#f00'],//热图的颜色渐变
  });
  // 模糊按钮的回调函数
  let blurHandler = function (){
    heatmapLayer.setBlur(parseInt(blur.value, 10));
  };
  blur.addEventListener("input", blurHandler);
  blur.addEventListener("change", blurHandler);

  // 半径按钮的回调函数
  let radiusHandler = function () {
    heatmapLayer.setRadius(parseInt( radius.value, 10));
  };
  radius.addEventListener("input", radiusHandler);
  radius.addEventListener("change", radiusHandler);

  map.addLayer(heatmapLayer);
  let view = map.getView();
  view.setZoom(9);
  view.setCenter(center);
};

const clearHeatmapLayer = () => {
  if (heatmapLayer) {
    map.removeLayer(heatmapLayer);
    heatmapLayer = null;
    let view = map.getView();
    view.setZoom(3);
    view.setCenter(center);
  }
}

export{
  addHeatmapLayer,
  clearHeatmapLayer
}