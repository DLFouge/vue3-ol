<!--双屏对比-->
<template>
    <div class="mapDiv">
        <div id="mapContainerL" class="mapContainerL" 
            :style="{width:isLeft ? '50%': '100%', height:isLeft ? '100%': '50%'}"
            @drop='onDrop($event, "left")'
            @dragover.prevent
            @dragenter.prevent>
        </div>
        <div id="mapContainerR" class="mapContainerR"
            :style="{width:isLeft ? '50%': '100%', height:isLeft ? '100%': '50%'}"
            @drop='onDrop($event, "right")'
            @dragover.prevent
            @dragenter.prevent>
        </div>
        <el-button type="primary" class="screenBtn" @click="changeScreen()">
            <span v-if="isLeft">上下分屏</span>
            <span v-else>左右分屏</span>
        </el-button>
        <el-button type="primary" class="homeBtn" @click="backHome()">
            首页
        </el-button>
    </div>
    <div class="imgDiv">
        <div class="imgBox" 
            v-for="(item,index) in imgList" 
            :key="index"
            @dragstart="dragstart($event,item)" 
            @dragend="isDown=false" 
            :class="(leftImgID == item.id || rightImgID == item.id) ? 'dragged': ''"
            >
            <img :src="item.src" />
            <span>{{item.name}}</span>
        </div>
    </div>

</template>

<script lang="ts">
import { defineComponent, onMounted,ref , nextTick, reactive,toRefs} from 'vue'
import { useRouter } from 'vue-router';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import * as olProj from 'ol/proj';
import {addImage} from '@/components/AddImage'

export default defineComponent({
    setup() {
        const router = useRouter();
        const isLeft = ref(true);
        const isDown = ref(false);
        const state = reactive({
            imgList: [
                {
                    id: 1,
                    src: "/src/assets/4.png",
                    name: '图片1',
                    coord: [122.24,43.65,127.30,46.48],
                },
                {
                    id: 2,
                    src: "/src/assets/5.jpg",
                    name: '图片2',
                    coord: [122.24,43.65,127.30,46.48],
                },
                {
                    id: 3,
                    src: "/src/assets/6.png",
                    name: '图片3',
                    coord: [122.24,43.65,127.30,46.48],
                }
            ],
            leftImgID: 1,
            rightImgID: 0
        })
        let mapL = <any> null;
        let mapR =  <any>null;
        let leftLayer = <any>null;
        let view = <any>null;
        const initMap = () => {
            let center = olProj.fromLonLat([124.40, 45.12]);
            view = new View({
                center: center,
                zoom: 7,
                maxZoom:20
            })
            let leftURL = 'http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7'; // 高德矢量图
            let rightURL = 'http://t4.tianditu.com/DataServer?T=vec_w&tk=e3af6e89f787c2469373e3aea76f4d36&x={x}&y={y}&l={z}';//天地图底图
            let rightURLLabel ='http://t4.tianditu.com/DataServer?T=cva_w&tk=e3af6e89f787c2469373e3aea76f4d36&x={x}&y={y}&l={z}'; //天地图注记
            let leftLayer = new TileLayer({
                source: new XYZ({
                    url: leftURL
                })
            });
            let rightLayer = new TileLayer({
                source: new XYZ({
                    url: rightURL
                })
            });
            let rightLayerLabel = new TileLayer({
                source: new XYZ({
                    url: rightURLLabel
                })
            });
            mapL = new Map({
                target: 'mapContainerL',
                layers: [leftLayer],
                view : view
            });
            mapR = new Map({
                target: 'mapContainerR',
                layers: [rightLayer,rightLayerLabel],
                view : view
            })
        };
        let coord = [122.24,43.65,127.30,46.48];
        const addPicture = () => {
            addImage(mapL, '/src/assets/4.png', coord);
            // addImage(mapR, '/src/assets/5.jpg', coord)
        };
        const backHome = () => {
            router.push('/home');
        };
        const changeScreen = () => {
            isLeft.value = !isLeft.value;
            //更新地图--关键
            nextTick(() => {
                console.log('--- DOM更新了 ---');
                mapL.updateSize();
                mapR.updateSize();
            })
            // setTimeout(() => {
            //     mapL.updateSize();
            //     mapR.updateSize();
            // },0);
        };
        let dragItem = <any>{}
        const dragstart = (e:any,item:any) => {
            isDown.value = true;
            dragItem = item;
        };
        const onDrop = (e:any,loc: string) => {
            if(state.leftImgID == dragItem.id || state.rightImgID == dragItem.id ){
                return;
            }
            if(loc == 'left'){
                addImage(mapL, dragItem.src, dragItem.coord);
                state.leftImgID = dragItem.id;
            }else{
                addImage(mapR, dragItem.src, dragItem.coord);
                state.rightImgID = dragItem.id;
            }
        };
       
        onMounted(async() => {
            await initMap();
            addPicture()
        })
        return{
            isLeft,
            backHome,
            changeScreen,
            dragstart,
            onDrop,
            isDown,
            ...toRefs(state)
        }
    },
})
</script>


<style lang="scss" scoped>
.mapDiv{
    width: calc(100% - 300px);
    height: 100%;
    position: absolute;
    left: 0;
}
.mapContainerL {
  left: 0;
  top: 0;
  position: absolute;
}
.mapContainerR {
  right: 0;
  bottom: 0;
  position: absolute;
}
.screenBtn{
    position: absolute;
    top: 10px;
    left: 90px;
}
.homeBtn{
    position: absolute;
    top: 10px;
    left: 10px;
}
.imgDiv{
    width: 300px;
    height: 100%;
    background: rgba(20, 55, 97, 0.7);
    position: absolute;
    right: 0;
    color: #fff;
    .imgBox{
        width: 260px;
        height: 40px; 
        margin-top: 20px;
        margin-left: 20px;
        display: flex;
        padding: 5px;
        img{
            width: 60px;
            height: 40px;
            cursor: move;
        }
        span{
            line-height: 40px;
            margin-left: 10px;
        }
    }
    .dragged {
        background-color: rgba(20, 55, 97, 0.5);
    }
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