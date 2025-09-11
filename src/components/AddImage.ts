// 显示图片
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import * as olProj from 'ol/proj';


let imageLayerL: any;
const addImage = (map:any, url: string, coord: number[]) => {
  clearImage(map);
  let source = new Static({
    url: url,
    imageExtent: olProj.transformExtent(coord, 'EPSG:4326', 'EPSG:3857')
  });
  imageLayerL = new ImageLayer({
    // source: new Static({
    //   url: url,
    //   imageExtent: olProj.transformExtent(coord, 'EPSG:4326', 'EPSG:3857')
    // }),
    source: source,
    zIndex: 1
  });
  map.addLayer(imageLayerL);
  source.on("imageloadstart",() => {
    console.log("图片开始加载")
  })
  source.on("imageloadend",() => {
    console.log("图片加载完成")
  })
};

const clearImage = (map:any) => {
  if (imageLayerL) {
    map.removeLayer(imageLayerL);
    imageLayerL = null;
  }
};

let imageLayerR: any;
const addImageR = (map:any, url: string, coord: number[]) => {
  clearImageR(map);
  imageLayerR = new ImageLayer({
    source: new Static({
      url: url,
      imageExtent: olProj.transformExtent(coord, 'EPSG:4326', 'EPSG:3857')
    }),
    zIndex: 3
  });
  map.addLayer(imageLayerR);
};

const clearImageR = (map:any) => {
  if (imageLayerR) {
    map.removeLayer(imageLayerR);
    imageLayerR = null;
  }
}
export {
  addImage,
  clearImage,
  addImageR,
  clearImageR,
  imageLayerR,
  imageLayerL
}