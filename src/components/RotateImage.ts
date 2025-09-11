//图片旋转
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import * as olProj from 'ol/proj';
import * as mapStyle from './Style'
import { Feature } from 'ol'
import { map } from "./BaseMap";
import GeoImageLayer from 'ol-ext/layer/GeoImage'
import GeoImageSource from 'ol-ext/source/GeoImage'
import { boundingExtent, getCenter } from 'ol/extent'

let imgUrl = '/src/assets/4.png';

//获取图片像素
const getImageXY = (callback:any) => {
  // 创建canvas
  const canvas = document.createElement('canvas');
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
  //将图片加载到canvas中
  const image = new Image();
  image.src = imgUrl;
  image.onload = () => {
    ctx.drawImage(image, 0, 0);
    //获取像素矩阵 
    let myImageData = ctx.getImageData(0, 0, image.width, image.height);
    callback(myImageData)
  }
}

//计算polygon中心点坐标
const computedCenter = (coord: number[][][]) => {
  let extent = boundingExtent(coord[0]); //获取多边形外接矩形坐标--[minX,minY,maxX,maxY]
  let center = getCenter(extent);
  return center;
}

//计算图片旋转角度--旋转线段--first为固定点，second为旋转后的点
const setAngle = (first: number[], second: number[]) => {
  let y = second[1] - first[1];
  let x = second[0] - first[0];
  let radAngle = Math.atan2(y, x);
  if (x > 0) {
    radAngle = -radAngle;
  } else {
    radAngle = Math.PI - radAngle;
  }
  return radAngle
}

//显示图片
let geoImg:any = null;
const addGeoImage = (coord: number[][][]) => {
  let centerPoint = computedCenter(coord);
  let rotate = setAngle(coord[0][1], coord[0][0]);

  let imageCrop;
  getImageXY((res: any) => {
    imageCrop = [0, 0, res.width, res.height];
  });
  
  geoImg = new GeoImageLayer({
    name: "geoImage",
    opacity: 1,
    source: new GeoImageSource({
        url: imgUrl,
        imageRotate: rotate,
        imageScale: [1500,1900],
        imageCenter: olProj.fromLonLat(centerPoint),
        // imageCrop: imageCrop, //图片像素矩阵
    }),
    zIndex: 2
  });
  map.addLayer(geoImg)
}

const clearGeoImage = () => {
  if (geoImg) {
    map.removeLayer(geoImg);
    geoImg = null;
  }
}

export {
  addGeoImage,
  clearGeoImage
}