//卫星云图
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import TileLayer from 'ol/layer/Tile';
import { map } from "./BaseMap";

//1、使用.xml格式--本地xml文件--特定格式xml
// let wmtsString = '/public/WMTSCapabilities.xml';

//2、直接使用.tif格式--推荐使用
//tif地址：https://tb-1256849727.cos.ap-beijing.myqcloud.com/CLOUDIMAGE/GEOS_IMAGR_GBAL_L2_MOS_IRX_GLL_20220715_0300_10KM_MS.tif
//服务器地址：http://192.168.3.42:8000
let identifier = 'cogeo'
let wmtsString = "http://192.168.3.42:8000/cog/WMTSCapabilities.xml?tile_format=png&tile_scale=1&TileMatrixSetId=WebMercatorQuad&url=https://tb-1256849727.cos.ap-beijing.myqcloud.com/CLOUDIMAGE/GEOS_IMAGR_GBAL_L2_MOS_IRX_GLL_20220715_0300_10KM_MS.tif&bidx=1&bidx=2&bidx=3&expression=b1%3Bb2%3Bb3&unscale=false&resampling=nearest&rescale=0%2C255&rescale=0%2C255&rescale=0%2C255&return_mask=true";
let wmtsLayer:any;
const addWmtsCapabilities = () => {
  let parser = new WMTSCapabilities();
  fetch(wmtsString).then( response => {
      return response.text();
  }).then(data => {
      addWmts(identifier, parser.read(data))
  }).catch(() => {})
};
const addWmts = (identifier:string,results:any) => {
  clearWmts();
  let options = <any>optionsFromCapabilities(results, {
    layer: identifier,
    matrixSet: 'WebMercatorQuad',
  });
  options.wrapX = true
  const wmtsSource = new WMTS(options);
  wmtsLayer = new TileLayer({
      source: wmtsSource,
      zIndex: 3,
      opacity: 0.7,
  })
  map.addLayer(wmtsLayer)
};

const clearWmts = () => {
  if(wmtsLayer){
    map.removeLayer(wmtsLayer);
    wmtsLayer = null;
  }
};
export {
  addWmtsCapabilities,
  clearWmts
}