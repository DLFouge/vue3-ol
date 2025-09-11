//水波纹
import Feature from 'ol/Feature';
import {Point} from 'ol/geom';
import {Style, Fill, Stroke, Circle as CircleStyle} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {fromLonLat} from 'ol/proj';
import {unByKey} from 'ol/Observable';
import {getVectorContext} from 'ol/render';
import {easeOut} from 'ol/easing';

import { map } from "./BaseMap";
//动态添加图层完成水波纹效果--start
 /**
  * 通过图层名称获取图层
  * @param {String}
  * @returns {Layer}
 */
const getLayerByName = (name:string) =>{
    let allLayers = map.getLayers().getArray();
    let layer = undefined;
    if (allLayers.length) {
      for (let i = 0; i < allLayers.length; i++) {
        if (allLayers[i].className_ == name) {
          layer = allLayers[i];
          break;
        }
      }
    }
    return layer;
  };
 /** 
  * 添加水波纹点图层到地图 
  * @param lonlat EPSG:4326
  * */
let dynamicPointLayer:any = null;
let listenerKey:any;
const addDynamicLayerToMap = (lonlat:any) => {
  lonlat = fromLonLat(lonlat); // 将4326的坐标转换为3857的坐标
  let pointFeature = new Feature({
    geometry: new Point(lonlat, 'XY'),
  });
  if(getLayerByName('dynamicLayer')) {
    getLayerByName('dynamicLayer').getSource().clear();
    getLayerByName('dynamicLayer').getSource().addFeature(pointFeature);
    return;
  };
  dynamicPointLayer = new VectorLayer({
    source: new VectorSource({
        features: [pointFeature],
    }),
    className: 'dynamicLayer',
    zIndex: 2,
  });
  map.addLayer(dynamicPointLayer);
  let radius = 4; // radius一定要放在监听事件外面
  let opacity = 1;
  listenerKey  = map.on('postcompose', (event:any) => {
    let dynamicFeatures = getLayerByName('dynamicLayer').getSource().getFeatures();
    opacity = (25 - radius) * (1 / 25) ; // 不透明度 radius为0时，不透明；radius为25时，透明
    dynamicFeatures.forEach((item:any) => {
      item.setStyle(new Style({
        image: new CircleStyle({
          radius: radius,
          stroke: new Stroke({
            color: 'rgba(255, 0, 0, '+ opacity +')',
            width: 2,
          }),
        })
      }));
    });
    radius = radius + 0.3;
    radius = radius >= 25 ? 4 : radius;
    map.render(); // 重要
  });
  setTimeout(() => {
    clearDynamicLayer();
  },15000)
};
const clearDynamicLayer = () => {
    if(dynamicPointLayer){
        unByKey(listenerKey);
        map.removeLayer(dynamicPointLayer);   
    }
};
//动态添加图层完成水波纹效果--end

//animate动画实现水波纹--start
let animateLayer:any = null;
const addAnimateFeature = async(pos:any) => {
  const source = new VectorSource({
    wrapX: false,
  });
  animateLayer = new VectorLayer({
    source: source
  });
  await map.addLayer(animateLayer);  
  source.on('addfeature', function(e) {
    flash(e.feature);
  });
  let point = new Point(fromLonLat(pos));
  let feature = new Feature({
    geometry: point,                                      
  });
  let style1 = new Style({
    image: new CircleStyle({
        radius: 0,
        fill: new Fill({
            color: '#00479d',
        }),
    }), 
  });
  feature.setStyle(style1);         
  source.addFeature(feature);
};
const duration = 3000;
let listenerAnimate:any = null;
const flash = (feature:any) => {
  let start = Date.now();
  //添加一个OpenLayers.Geometry几何对象
  const flashGeom = feature.getGeometry().clone();
  listenerAnimate = animateLayer.on('postrender',animate);
  function animate(event:any){
    //获取当前渲染帧状态
    const frameState = event.frameState;
    //渲染帧状已占时间
    const elapsed = frameState.time - start;
    if (elapsed >= duration) {
      start = frameState.time ;
    }
    //获取几何图形
    const vectorContext = getVectorContext(event);
    //已占比率
    const elapsedRatio = elapsed / duration;
    // radius半径为5结束为30
    const radius = easeOut(elapsedRatio) * 25 + 5;
    //不透渐变消失
    const opacity = easeOut(1 - elapsedRatio);
    //Circle样式
    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, ' + opacity + ')',
          width: 0.25 + opacity,
        }),
      }),
    });
    //给几何图形添加样式
    vectorContext.setStyle(style);
    //将几何体渲染到画布中
    vectorContext.drawGeometry(flashGeom);
    //请求地图渲染（在下一个动画帧处）
    map.render();
    setTimeout(() => {
      clearAnimateFeature();
    },15000)
  }
};
const clearAnimateFeature = () => {
  if(dynamicPointLayer){
    unByKey(listenerAnimate);
    map.removeLayer(animateLayer);   
  }
};
//animate动画实现水波纹--end
 
export{
  addDynamicLayerToMap,
  addAnimateFeature
}