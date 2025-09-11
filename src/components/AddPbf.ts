//湖北省pbf瓦片测试
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTile from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { map } from "./BaseMap";
import * as mapStyle from './Style'
let url = 'http://localhost:8880/geoserver/gwc/service/tms/1.0.0/belt%3Ahb@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf';
let vector3857:any = null;
const addHbPbf = () => {
    vector3857 = new VectorTileLayer({
        declutter: true,
        style: mapStyle.circleStyle,
        source: new VectorTile({
            format: new MVT(),
            maxZoom: 22,
            minZoom: 5,
            url: url
        })
    })
    map.addLayer(vector3857);
};
const clearHbPbf = () => {
    if (vector3857) {
      map.removeLayer(vector3857);
      vector3857 = null;
    }
};
const addHbPbf1 = () => {
    let vector4326 = new VectorTileLayer({
        style: mapStyle.circleStyle,
        source: new VectorTile({
            projection: "EPSG:4326",
            format: new MVT(),
             // 矢量切片服务地址
            tileUrlFunction: (tileCoord) => {
                const url =
                "http://localhost:8880/geoserver/gwc/service/tms/1.0.0/belt%3Ahb@EPSG%3A4326@pbf" +
                (tileCoord[0] - 1) +
                "/" +
                tileCoord[1] +
                "/" +
                (Math.pow(2, tileCoord[0] - 1) - 1 - tileCoord[2]) +
                ".pbf";
                return url;
            }
        })
    })
    map.addLayer(vector4326);
};
export{
    addHbPbf,
    clearHbPbf
}