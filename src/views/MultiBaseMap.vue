<template>
    <!-- 多地图模式 -->
    <div id="mapMulti" class="mapMulti"></div>
    <el-button type="primary" class="homeBtn" @click="backHome()">
        首页
    </el-button>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import * as olProj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import {intersects} from 'ol/extent';
import {defaults} from 'ol/control';

export default defineComponent({
    setup() {
        const router = useRouter();
        const backHome = () => {
            router.push('/home');
        };
        const TileURL = {
            'NAV': 'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
            'OSM': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
        const options = {
            tileUrl: TileURL.NAV,
            center: [105.943468, 38.08155],
            zoom: 3.5,
            minZoom: 0,
            maxZoom: 18
        };
        // 经纬度转瓦片编号
        const lon2tile = (lon:number,zoom:number) => { 
            return (Math.floor((lon+180)/360*Math.pow(2,zoom))); 
        }
        const lat2tile = (lat:number,zoom:number) => { 
            return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); 
        }
 
        // 瓦片编号转经纬度
        // 计算的是瓦片左上角的经纬度坐标，即西北方向，如果要计算东南方向的坐标则x和y各加1就行了
        // 即计算左上角和右下角的经纬度
        const tile2lon = (x:number, z:number) =>{
            return (x/Math.pow(2,z)*360-180);
        };
        const tile2lat = (y:number, z:number) => {
            const n = Math.PI-2*Math.PI*y/Math.pow(2,z);
            return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
        };
        const getExtentFromZxy = (z:number,x:number,y:number) => {  
            return [tile2lon(x,z),tile2lat(y+1,z),tile2lon(x+1,z),tile2lat(y,z)]
        };
        const isInChina = (zxy:any) => {
            const [z, x, y] = zxy
            const tileExtent = getExtentFromZxy(z,x,y)
            const chinaExtent = [72.69154385120196, 2.1456019648604325, 136.8205912282765, 54.22089456253397]
            return intersects(tileExtent, chinaExtent)
        };
        const baseLayer = new TileLayer({
            visible: true,
            source : new XYZ({
                tileUrlFunction: (zxy:any) => {
                    const [z, x, y] = zxy
                    let url  = isInChina(zxy) ? TileURL.NAV : TileURL.OSM
                    url = url.split('{z}').join(z)
                    url = url.split('{x}').join(x)
                    url = url.split('{y}').join(y)
                    return url
                }
            })
        })
        const initMap = () => {
            let map = new Map({
                controls: defaults({
                    attribution: false
                }).extend([]),
                target: 'mapMulti',
                layers:[baseLayer],
                view: new View({
                    center: olProj.fromLonLat(options.center),
                    zoom: options.zoom,
                    minZoom: options.minZoom,
                    maxZoom: options.maxZoom
                })
            })
        };
        onMounted(() => {
            initMap()
        })
        return{
            backHome,
        }
    },
})
</script>


<style scoped lang="scss">
.mapMulti{
     width: 100%;
    height:100vh;
}
.homeBtn{
    position: absolute;
    top: 10px;
    left: 10px;
}
</style>
<style>
/* 隐藏地图许可证信息 */
.ol-attribution li{
    display: none;
}
/* 修改放大缩小按钮位置：左上角-->右下角 */
.ol-zoom,.ol-rotate {
   display: none;
}
</style>