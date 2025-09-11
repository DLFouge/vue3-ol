<!--官方卷帘-->
<template>
    <div id="mapDiv" class="mapDiv"></div>
    <input id="swipe" type="range" style="width: 99.6%;" />
    <el-button type="primary" class="homeBtn" @click="backHome()">
        首页
    </el-button>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive,toRefs} from 'vue'
import { useRouter } from 'vue-router';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { getRenderPixel } from 'ol/render';

export default defineComponent({
    setup() {
        const router = useRouter();
        const state = reactive({
            map: <any>null,
            rightLayer: <any>null,
            swipe: <any>null,
        })
        onMounted(() => {
            initMap("mapDiv");
            mapSwipe("swipe");
        });
        const backHome = () => {
            router.push('/home');
        };
        const initMap = (mapId: string) => {
            let leftURL = 'http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7'; // 高德矢量图
            let rightURL = 'http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6';//影像路图（含路网，含注记）
            let leftLayer = new TileLayer({
                source: new XYZ({
                    url: leftURL
                })
            });
            state.rightLayer = new TileLayer({
                source: new XYZ({
                    url: rightURL
                })
            });
            state.map = new Map({
                layers: [leftLayer,state.rightLayer],
                target: mapId,
                view: new View({
                center: [0,0],
                zoom: 4,
                maxZoom:20
                })
            })
        };
        const mapSwipe = (swipeId: string) => {
            state.swipe = document.getElementById(swipeId);
            swipeRender();
            state.swipe.addEventListener('input', () => {
                state.map.render();
            }, false);
        };
        const swipeRender = () => {
            state.rightLayer.on('prerender', (event:any) => {
                let ctx = event.context;
                let mapSize = state.map.getSize();
                let width = mapSize[0] * (state.swipe.value / 100);
                let tl = getRenderPixel(event, [width, 0]);
                let tr = getRenderPixel(event, [mapSize[0], 0]);
                let bl = getRenderPixel(event, [width, mapSize[1]]);
                let br = getRenderPixel(event, mapSize);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(tl[0], tl[1]);
                ctx.lineTo(bl[0], bl[1]);
                ctx.lineTo(br[0], br[1]);
                ctx.lineTo(tr[0], tr[1]);
                ctx.closePath();
                ctx.clip();
            });

            state.rightLayer.on('postrender', (event:any) => {
                let ctx = event.context;
                ctx.restore();
            });
        }
        return{
            backHome,
            ...toRefs(state)
        }
    },
})
</script>

<style scoped lang="scss">
.mapDiv{
    width: 100%;
    height:97vh;
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
.ol-zoom{
    top: unset;
    left: unset;
    bottom:0.5em;
    right:0.5em;
}
</style>