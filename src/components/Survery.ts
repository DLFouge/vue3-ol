// 测量--测距、测面积（多边形）
import { map } from "./BaseMap";
import { getArea, getLength } from 'ol/sphere';
import { Modify,Snap ,Draw} from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Overlay from 'ol/Overlay';
import {LineString, Polygon} from 'ol/geom';
import * as mapStyle from './Style';
import '../styles/Survery.css'



let sketch:any;
let measureTooltipElement:any;
let measureTooltip:any;

const formatLength = (line:any) => {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

const formatArea = (polygon:any) => {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

let draw: any;
// 创建源
const source = new VectorSource();
//通过动态创建div来显示测量数据
const surveryDraw = (type: string) => {
  map.removeInteraction(draw);
  //创建图层
  let layer = new VectorLayer({
    source: source,
    style: mapStyle.drawStyle,
    zIndex: 1
  });
  map.addLayer(layer);

  draw = new Draw({
    source: source,
    type: type
    // style: 
  });
  map.addInteraction(draw);
  createMeasureTooltip();
  let listener: any;
  draw.on('drawstart', (event:any) => {
    sketch = event.feature;
    let tooltipCoord = event.coordinate;
    listener = sketch.getGeometry().on('change', (e: any) =>{
      const geom = e.target;
      // console.log("geom", geom);
      let output;
      if (geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });
  draw.on('drawend', () => {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
  });
};

const createMeasureTooltip = () => {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
};

const clearSurvery = () => {
  source.clear();
  map.removeInteraction(draw);
  let domList = document.getElementsByClassName('ol-tooltip-static');
  for (let i = 0; i < domList.length; i++){
    (domList[i] as HTMLElement).style.display = 'none';
  }
  // map.removeInteraction(snap);
};

//通过设置vectorStyle来显示测量数据
const surveryDrawOther = (type: string) => {

};


export {
  surveryDraw,
  clearSurvery,
  surveryDrawOther
}