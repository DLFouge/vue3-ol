//风场粒子效果
import { WindLayer } from 'ol-wind';
import gfs from '/public/gfs.json'
import { map } from "./BaseMap";
import * as olProj from 'ol/proj';

let windLayer: any;
let allGrid = <any>[];
const addWindLayer = () => {
  windLayer = new WindLayer(gfs, {
    foceRender: true,
    windOptions: {
      globalAlpha: 0.9,  // 粒子透明度
      maxAge: 90,  // 存活最大帧数
      // velocityScale: 1/100,  // 粒子速度
      frameRate: 20,  // 每20贞绘制一次
      paths: 5000,  // 粒子数量
      velocityScale: 1 / 30,
      // colorScale: () => {
      //   return "#00b3ef"
      // },
      colorScale: ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"],
      width: 3,
    }
  })
  analysisWindyData(gfs);
  map.addLayer(windLayer)
}
const clearWindLayer = () => {
  if (windLayer) {
    map.removeLayer(windLayer);
    windLayer = null;
  }
};

const  analysisWindyData = (windyData:any) =>{
  let p = 0;
  let east, north;
  if (windyData[0].header.parameterNumberName == "eastward_wind") {
    east = windyData[0];
    north = windyData[1];
  } else {
    east = windyData[1];
    north = windyData[0];
  }
  for (let j = 0; j < north.header.ny; j++) {
    let row = [];
    for (let i = 0; i < north.header.nx; i++, p++) {
      row[i] = [east.data[p], north.data[p]];
    }
    allGrid[j] = row;
  }
}

const getWindyDetail = (position: number[]) => {
  let coord = olProj.toLonLat(position);
  let lng = coord[0];
  let lat = coord[1];
  // 与格网序列的数据转换
  if (lng >= 0) {
    lng = Math.floor(lng);
  } else {
    lng = 360 + Math.floor(lng)
  }
  lat = 90 - Math.floor(lat);
  // 获取对应的格网序列
  let xLength = lng;
  let yLength = lat;
  let xData, yData;
  xData = allGrid[Math.abs(yLength)][Math.abs(xLength)][0];
  yData = allGrid[Math.abs(yLength)][Math.abs(xLength)][1];
  if (typeof xData != "number" || typeof yData != "number") {
    console.error("暂无该区域风向数据！");
    return;
  }
  let v = Math.sqrt(Math.pow(xData, 2) + Math.pow(yData, 2));
  let angle = getWindyAngle(xData, yData);
  let result = {
    "direction": getWindyDirection(angle),
    "level": getWindyLevel(v),
    "speed": v.toFixed(2)
  };
  return result;
}

const getWindyDirection = (angle:number) => {
  if ((angle >= 0 && angle <= 22.5) || (angle <= 360 && angle > 337.5)) {
    return "北风";
  }
  if (angle <= 337.5 && angle > 292.5) {
    return "西北风";
  }
  if (angle <= 292.5 && angle > 247.5) {
    return "西风";
  }
  if (angle <= 247.5 && angle > 202.5) {
    return "西南风";
  }
  if (angle <= 202.5 && angle > 157.5) {
    return "南风";
  }
  if (angle <= 157.5 && angle > 112.5) {
    return "东南风";
  }
  if (angle <= 112.5 && angle > 67.5) {
    return "东风";
  }
  if (angle <= 67.5 && angle > 22.5) {
    return "东北风";
  }
}

const getWindyAngle = (u:number, v:number) =>{
  var fx = 0;
  if (u > 0 && v > 0) {
    fx = 270 - Math.atan(v / u) * 180 / Math.PI;
  } else if (u < 0 && v > 0) {
    fx = 90 - Math.atan(v / u) * 180 / Math.PI;
  } else if (u < 0 && v < 0) {
    fx = 90 - Math.atan(v / u) * 180 / Math.PI;
  } else if (u > 0 && v < 0) {
    fx = 270 - Math.atan(v / u) * 180 / Math.PI;
  } else if (u == 0 && v > 0) {
    fx = 180;
  } else if (u == 0 && v < 0) {
    fx = 0;
  } else if (u > 0 && v == 0) {
    fx = 270;
  } else if (u < 0 && v == 0) {
    fx = 90;
  } else if (u == 0 && v == 0) {
    fx = 999.9;
  }
  return fx;
}

const getWindyLevel = (v:number) => {
  if (v < 0.3) {
    return 0;
  }
  if (v >= 0.3 && v < 1.6) {
    return 1;
  }
  if (v >= 1.6 && v < 3.4) {
    return 2;
  }
  if (v >= 3.4 && v < 5.5) {
    return 3;
  }
  if (v >= 5.5 && v < 8.0) {
    return 4;
  }
  if (v >= 8.0 && v < 10.8) {
    return 5;
  }
  if (v >= 10.8 && v < 13.9) {
    return 6;
  }
  if (v >= 13.9 && v < 17.2) {
    return 7;
  }
  if (v >= 17.2 && v < 20.8) {
    return 8;
  }
  if (v >= 20.8 && v < 24.5) {
    return 9;
  }
  if (v >= 24.5 && v < 28.5) {
    return 10;
  }
  if (v >= 28.5 && v < 32.7) {
    return 11;
  }
  if (v >= 32.7 && v < 37.0) {
    return 12;
  }
  if (v >= 37.0 && v < 41.5) {
    return 13;
  }
  if (v >= 41.5 && v < 46.2) {
    return 14;
  }
  if (v >= 46.2 && v < 51.0) {
    return 15;
  }
  if (v >= 51.0 && v < 56.1) {
    return 16;
  }
  if (v >= 56.1 && v < 61.2) {
    return 17;
  }
  if (v >= 61.2) {
    return 18;
  }
}

export {
  addWindLayer,
  clearWindLayer,
  getWindyDetail
}