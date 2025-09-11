//加载各种地图服务
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import WMTS from 'ol/source/WMTS';
import TileWMS from 'ol/source/TileWMS';
import TileImage from "ol/source/TileImage";
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileGrid from "ol/tilegrid/TileGrid";

import { get as getProjection } from 'ol/proj';
import { getTopLeft, getWidth } from 'ol/extent';

import { map } from "./BaseMap";

//定义一些常量
const projection = getProjection('EPSG:3857');
const projectionExtent = projection!.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(18);
const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
}
//底图图层和注记图层
let baseLayer: any = null;
let labelLayer: any = null;
// 天地图的tk
const tk = '7786923a385369346d56b966bb6ad62f';

// 百度地图参数
const resolutions2 = [];
for (let z = 0; z < 19; ++z) {
    resolutions2[z] = Math.pow(2, 18 - z);
}
let tilegrid = new TileGrid({
    origin: [0, 0],
    resolutions: resolutions2
});

const addTdtWmtsLayer = (url:string, layerName:string, matrixSet:string, format:string,flag:string) => {
  let source = new WMTS({
    url: `${url}?tk=${tk}`,
    layer: layerName,
    matrixSet: matrixSet,
    format: format,
    projection: projection!,
    tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
    }),
    style: 'default',
    wrapX: true,
    crossOrigin: 'anonymous'
  })
  if (flag === "base") {
    baseLayer = new TileLayer({
      source: source
    });
    map.addLayer(baseLayer);
  } else {
    labelLayer = new TileLayer({
      source: source
    });
    map.addLayer(labelLayer);
  }
};

// 天地图卫星影像地图服务
const tdtImageMap = () => {
  addTdtWmtsLayer('http://t0.tianditu.gov.cn/img_w/wmts', 'img', 'w', 'tiles', 'base');
}
// 天地图影像注记地图服务
const tdtImageLabelMap = () => {
  addTdtWmtsLayer('http://t0.tianditu.gov.cn/cia_w/wmts', 'cia', 'w', 'tiles', 'label');
};

// 天地图矢量底图地图服务
const tdtVecMap = () => {
  addTdtWmtsLayer('http://t0.tianditu.gov.cn/vec_w/wmts', 'vec', 'w', 'tiles', 'base');
};
// 天地图矢量注记地图服务
const tdtVecLabelMap = () => {
  addTdtWmtsLayer('http://t0.tianditu.gov.cn/cva_w/wmts', 'cva', 'w', 'tiles', 'label');
};
// let layer1 = new TileLayer({
//     source: new XYZ({
//         url:'http://t4.tianditu.com/DataServer?T=vec_w&tk=e3af6e89f787c2469373e3aea76f4d36&x={x}&y={y}&l={z}'
//     }),
// })
// let layer2 = new TileLayer({
//     source: new XYZ({
//         url:'http://t4.tianditu.com/DataServer?T=eva_w&tk=e3af6e89f787c2469373e3aea76f4d36&x={x}&y={y}&l={z}'
//     }),
// })

//移除图层
const removeMapLayer = () => {
  if (baseLayer) {
    map.removeLayer(baseLayer);
    baseLayer = null;
  }
  if (labelLayer) {
    map.removeLayer(labelLayer);
    labelLayer = null;
  }
  // map.removeLayer(layer);
};

const addXYZLayer = (url: string) => {
  let source = new XYZ({
    url: url,
    wrapX: true,
    crossOrigin: 'anonymous'
  })
  baseLayer = new TileLayer({
    source: source
  });
  map.addLayer(baseLayer);
}

// arcgis卫星影像地图服务
const arcgisImageMap = ()=> {
  addXYZLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
}
// arcgis矢量底图+注记地图服务
const arcgisVecMap = ()=> {
  addXYZLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}');
}

// 高德卫星影像地图服务
const gdImageMap = ()=> {
  addXYZLayer('https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}');
}
// 高德矢量底图地图服务
const gdVecMap = () => {
  addXYZLayer('https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}');
};

// 百度影像地图服务
const bdImageMap = () => {
  let source = new TileImage({
      projection: projection!,
      tileGrid: tilegrid,
      tileUrlFunction: (tileCoord, pixelRatio, proj) =>{
          if (!tileCoord) {
              return "";
          }
          let z:number = tileCoord[0];
          let x:number|string = tileCoord[1];
          let y:number|string = -tileCoord[2]-1;
          if (x < 0) {
            x = "M" + (-x);
          }
          if (y < 0) {
              y = "M" + (-y);
          }
          return "http://shangetu1.map.bdimg.com/it/u=x="+x+";y="+y+";z="+z+";v=009;type=sate&fm=46";
      },
      crossOrigin: 'anonymous'
  })
  baseLayer = new TileLayer({
    source: source
  });
  map.addLayer(baseLayer);
}
// 百度影像注记地图服务
const bdImageLabelMap = () => {
  let source = new TileImage({
      projection: projection!,
      tileGrid: tilegrid,
      tileUrlFunction: function(tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
              return "";
          }
          let z = tileCoord[0];
          let x:number|string = tileCoord[1];
          let y:number|string = -tileCoord[2]-1;
          if (x < 0) {
              x = "M" + (-x);
          }
          if (y < 0) {
              y = "M" + (-y);
          }
          return "http://online1.map.bdimg.com/tile/?qt=tile&x="+x+"&y="+y+"&z="+z+"&styles=sl&v=020";
      },
      crossOrigin: 'anonymous'
  })
  labelLayer = new TileLayer({
    source: source
  });
  map.addLayer(labelLayer);
}
// 百度矢量底图地图服务
const bdVecMap = () => {
  let source = new TileImage({
      projection: projection!,
      tileGrid: tilegrid,
      tileUrlFunction: function(tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
              return "";
          }
          let z = tileCoord[0];
          let x:number|string = tileCoord[1];
          let y:number|string = -tileCoord[2]-1;
          if (x < 0) {
              x = "M" + (-x);
          }
          if (y < 0) {
              y = "M" + (-y);
          }
          return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z +
              "&styles=pl&udt=20151021&scaler=1&p=1";
      },
      crossOrigin: 'anonymous'
  })
  // let layer = new TileLayer({
  //     source: source
  // })
  // map.addLayer(layer);
  baseLayer = new TileLayer({
    source: source
  });
  map.addLayer(baseLayer);
}

//谷歌地图
const googleMap = () => {
  baseLayer = new TileLayer({
    source: new XYZ({
      // url: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0';
      url: 'https://gac-geo.googlecnapps.cn/maps/vt?lyrs=s,m&gl=CN&x={x}&y={y}&z={z}'
    })
  });
  map.addLayer(baseLayer);
};



// 增加WMS格式的地图服务图层
const addWMSLayer = (url:string, layerName:string) => {
  let source = new TileWMS({
      url: url,
      params: {
          'LAYERS': layerName,
          'TILED': true
      },
      crossOrigin: 'anonymous'
  })
  let layer = new TileLayer({
      source: source
  })
  map.addLayer(layer);
}



export {
  tdtImageMap,
  tdtImageLabelMap,
  tdtVecMap,
  tdtVecLabelMap,
  removeMapLayer,
  arcgisImageMap,
  arcgisVecMap,
  gdImageMap,
  gdVecMap,
  bdImageMap,
  bdImageLabelMap,
  bdVecMap,
  googleMap
}