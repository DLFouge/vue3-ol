//基础地图
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import * as olProj from 'ol/proj';
import OSM from 'ol/source/OSM';
import {tdtVecMap, tdtVecLabelMap,} from './MapServer'

const initCenter = [114.5, 38];
let map: any;

const initMap = (mapId: string) => {
  let center = olProj.fromLonLat(initCenter);
  let layer = new TileLayer({
    source: new OSM(),
  })
  map = new Map({
    layers: [layer],
    target: mapId,
    view: new View({
      center: center,
      zoom: 4,
      maxZoom:20
    })
  })
  tdtVecMap();
  tdtVecLabelMap();
};
export {
  map,
  initMap
}