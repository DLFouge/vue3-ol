<template>
    <!-- 地图容器 -->
    <div id="mapBox">
        <!-- <timeline ref="timescale"/> -->
    </div>
    <!-- 进度条-->
    <!-- <div style="width: 50%;height: 4%;position: absolute;z-index: 999;bottom: 20%;left: 25%;">
        <timescale></timescale>
    </div> -->
    <!-- 上侧 -->
    <!-- 选择地图服务 -->
    <el-select 
        v-model="currentMap" 
        clearable 
        placeholder="底图" 
        class="mapSelect" 
        @change="handleChange"
    >
        <el-option
            v-for="item in maps"
            :key="item.value"
            :label="item.label"
            :value="item.value"    
        >
        </el-option>
    </el-select>
    <!-- 添加点线面图层 -->
    <el-select 
        v-model="currentShape" 
        multiple
        clearable
        placeholder="添加图形" 
        class="shapeSelect" 
        @change="shapeChange"
    >
        <el-option
            v-for="item in shapes"
            :key="item.value"
            :label="item.label"
            :value="item.value"    
        >
        </el-option>
    </el-select>
    <!-- 绘制点线面图层 -->
    <el-select 
        v-model="currentGrape" 
        clearable 
        placeholder="绘制图形" 
        class="grapeSelect" 
        @change="grapeChange"
    >
        <el-option
            v-for="item in grapes"
            :key="item.value"
            :label="item.label"
            :value="item.value"    
        >
        </el-option>
    </el-select>
    <!-- 测距、侧面积 -->
    <el-radio-group class="radioGroup" v-model="radio" @change="radioChange">
        <el-radio v-for="(item,index) in radios" :key="index" :label="item.label">{{item.name}}</el-radio>
    </el-radio-group>
    <!-- 左侧 -->
    <!-- 旋转图片 -->
    <el-button type="primary" class="imageBtn" @click="addImage()">
        <span v-if="!isImage">旋转图</span>
        <span v-else>清除</span>
    </el-button>
    <!--热力图-->
    <el-button type="primary" class="heatmapBtn" @click="addHeatmap()">
        <span v-if="!isHeatmap">热力图</span>
        <span v-else>清除</span>
    </el-button>
    <div class="heatmapBox" v-show="isHeatmap">
        <label>半径大小</label>
        <input id="radius" type="range" min="1" max="50" step="1" value="20" />
        <label>模糊大小</label>
        <input id="blur" type="range" min="1" max="50" step="1" value="25" />
    </div>
    <!--风场-->
    <el-button type="primary" class="windyBtn" @click="addWindy()">
        <span v-if="!isWindy">风场</span>
        <span v-else>清除</span>
    </el-button>
    <div class="windyBox" v-show="isWindy">
        <div>风向：{{windyInfo.direction}}</div>
        <div>风级：{{windyInfo.level}}</div>
        <div>风速：{{windyInfo.speed}}</div>
    </div>
    <!-- 卫星云图 -->
    <!-- <el-button type="primary" class="cloudBtn" @click="addCloud()">
        <span v-if="!isCloud">云图</span>
        <span v-else>云图清除</span>
    </el-button> -->
    <!-- 晨昏线 -->
    <el-button type="primary" class="terminatorBtn" @click="addTerminator()">
        <span v-if="!isTerminator">晨昏线</span>
        <span v-else>清除</span>
    </el-button>
    <!-- 显示popup -->
    <!-- <el-button type="primary" class="popupBtn" @click="showPopup()">
        <span v-if="!isPopup">popup显示</span>
        <span v-else>清除</span>
    </el-button> -->
    <!-- 显示gif -->
    <el-button type="primary" class="gifBtn" @click="showGif()">
        <span v-if="!isGif">单gif显示</span>
        <span v-else>清除</span>
    </el-button>
    <div id="gifBox" style="width:400px;height:370px;position:absolute;bottom:0px;"></div>
    <el-button type="primary" class="gifsBtn" @click="showGifs()">
        <span v-if="!isGifs">多gif显示</span>
        <span v-else>清除</span>
    </el-button>
    <div id="gifsBox"></div>
    <!-- 湖北pbf -->
    <!-- <el-button type="primary" class="pbfBtn" @click="showPbf()">
        <span v-if="!isPbf">pbf显示</span>
        <span v-else>清除</span>
    </el-button> -->
    <el-button type="primary" class="animateBtn" @click="showAnimate()">
        <span v-if="!isAnimate">历史轨迹</span>
        <span v-else>清除</span>
    </el-button>
    <Animate :dialogVisible="isAnimate" @closeDialog="closeDialog"/>
    <!-- 右侧 -->
    <!-- 卷帘 -->
    <el-button type="primary" class="swipeBtn1" @click="toSwipe(1)">
        卷帘1
    </el-button>
    <el-button type="primary" class="swipeBtn2" @click="toSwipe(2)">
        卷帘2
    </el-button>
    <el-button type="primary" class="swipeBtn3" @click="toSwipe(3)">
        卷帘3
    </el-button>
    <!-- 双屏对比 -->
    <el-button type="primary" class="splitBtn" @click="toDoubleScreen()">
        &nbsp;分屏&nbsp;
    </el-button>
    <!-- 多底图 -->
    <el-button type="primary" class="multiMapBtn" @click="toMultiBaseMap()">
        多底图
    </el-button>  
</template>


<script lang="ts">
import 'ol/ol.css'
import 'ol-ext/dist/ol-ext.min.css'
import {defineComponent, onMounted, reactive, toRefs,ref} from 'vue';
import {initMap, map} from '../components/BaseMap';
import * as mapServer from '../components/MapServer';
import * as mapAddLayer from '../components/AddGraph';
import {drawShape, clearDraw} from '../components/DrawGraph'
import {surveryDraw, clearSurvery} from '../components/Survery'
import {addGeoImage, clearGeoImage } from '../components/RotateImage'
import {addHeatmapLayer,clearHeatmapLayer} from '../components/Heatmap'
import { addWindLayer, clearWindLayer, getWindyDetail} from '../components/Windy'
import DivPopup from '@/components/popup/DivPopup';
import {addWmtsCapabilities,clearWmts} from '@/components/Cloud'
import { useRouter } from 'vue-router';
import {addDayNightTerminator,clearDayNightTerminator} from '@/components/Terminator'
import {addGif, clearGif,addGifs, clearGifs} from '@/components/AddGif'
import timeline from '@/components/timeline/Timeline.vue'
import timescale from '@/components/timeline/test.vue';
import {addWebglPoint,clearWebglPoint} from '@/components/AddWebgl'
import { addHbPbf, clearHbPbf } from '@/components/AddPbf'
import Animate from '@/components/animate/Animate.vue'
import {addDynamicLayerToMap,addAnimateFeature} from '@/components/WaterRipple'


export default defineComponent({
    components:{
        timeline,
        timescale,
        Animate
    },
    setup(){
        const timescale = ref<any>(null)
        const router = useRouter();
        const state = reactive({
            currentMap: '',
            maps: [
                {
                    value: 'tk1',
                    label: '天地图卫星影像+注记'
                },
                {
                    value: 'tk2',
                    label: '天地图矢量底图+注记'
                },
                {
                    value: 'arcGis1',
                    label: 'arcGis卫星影像'
                },
                {
                    value: 'arcGis2',
                    label: 'arcGis矢量底图+注记'
                },
                {
                    value: 'aMap1',
                    label: '高德卫星影像'
                },
                {
                    value: 'aMap2',
                    label: '高德矢量底图'
                },
                {
                    value: 'bMap1',
                    label: '百度卫星影像+注记'
                },
                {
                    value: 'bMap2',
                    label: '百度矢量底图'
                },
                {
                    value: 'googleMap',
                    label: '谷歌卫星影像+注记'
                }
            ],
            currentShape: [],
            shapes:[
                {
                    value: 'point',
                    label: '点'
                },
                {
                    value: 'icon',
                    label: '图标'
                },
                {
                    value: 'line',
                    label: '线'
                },
                {
                    value: 'polygon',
                    label: '多边形'
                },
                {
                    value: 'multiPolygon',
                    label: '复杂多边形'
                },
                {
                    value: 'circle',
                    label: '圆'
                },
                {
                    value: 'star',
                    label: '五角星'
                },
                {
                    value: 'massivePoints',
                    label: '海量点'
                }
            ],
            shapeLen: 0,
            proShape: [],
            currentGrape: '',
            grapes:[
                {
                    value: 'Point',
                    label: '点'
                },
                {
                    value: 'LineString',
                    label: '线'
                },
                {
                    value: 'Polygon',
                    label: '多边形'
                },
                {
                    value: 'Circle',
                    label: '圆'
                },
                {
                    value: 'Square',
                    label: '正方形'
                },
                {
                    value: 'Rectangle',
                    label: '矩形'
                },
                {
                    value: 'Star',
                    label: '五角星'
                }
            ],
            radio: '',
            radios:[
                {
                    label: 'len1',
                    name: '测距'
                },
                {
                    label: 'area1',
                    name: '测面积'
                },
                // {
                //     label: 'len2',
                //     name: '测距2'
                // },   
                // {
                //     label: 'area2',
                //     name: '测面积2'
                // }
                {
                    label: 'clear',
                    name: '清除'
                }
            ],
            isImage: false,
            isHeatmap: false,
            isWindy: false,
            windyInfo:<any>{},
            popupResult:<any>null,
            isCloud: false,
            isTerminator: false,
            isPopup: false,
            isGif: false,
            isGifs: false,
            isPbf: false,
            isAnimate: false
        });
        const addData = {
            point: [107.5, 34],
            line: [[113.62, 34.75],[116.98,36.67],[120.38,36.07]],
            circleCenter: [87.68, 43.77],
            circleRadius: 3,
            polygon: [[[122.24,43.65],[125.35,43.88],[127.30,45.05],[123.54,46.48],[122.24,43.65]]],
            multiPolygon: [
                [[[103.72,27.34],[102.87,25.24],[106.42,26.35],[103.72,27.34]]],
                [[[108.22,22.48],[111.28,27.14],[114.27,26.72],[118.67,24.88],[113.27,23.13],[108.22,22.48]]]
            ],
            star: [116.23,39.54],
            imagePolygon:[[[126.8749, 18.1838],[140.7265, 10.4234],[151.7656, 28.4942],[137.9843, 34.4272],[126.8749, 18.1838]]],
            gifPoints:[{attributes:{long:103.72,lat:27.34}},{attributes:{long:140.7265,lat:10.4234}},{attributes:{long:122.24,lat:46.48}}]
        };
        onMounted(() => {
            initMap("mapBox");
            addDynamicLayerToMap([108.22,27.34]);
            addAnimateFeature([104.70, 31.50]);
            //下面对鼠标点击事件进行监听
            map.on('click', (evt:any) => {
                let position = evt.coordinate; 
                if(state.isWindy){
                    //获取风场属性
                    state.windyInfo = <any>getWindyDetail(position);
                }else if(state.isPopup){
                    // 显示popup
                    if(state.popupResult){
                        state.popupResult.parent.style.display = "none";
                        state.popupResult.openLayerOverlay.setPosition(undefined)
                        map.removeOverlay(state.popupResult.openLayerOverlay);
                    }
                    let val = {
                        mapHandler: map,
                        title: 'popup标题',
                        img: '/src/assets/4.png',
                        dec: '无论是袅袅炊烟、小小村落 还是崇山沃野,大江大河 我站立的地方就是我温暖的国, 你好,生活',
                        status: '项目正常运行中',
                        position: position
                    }
                    state.popupResult  = new DivPopup(val);
                }
            });
            // timescale.value.init('2022-09-13 15:31:42','2022-09-01 00:00:00','2022-09-30 23:59:59')
        });
        //底图服务
        const handleChange = (val:string) => {
            mapServer.removeMapLayer();
            switch(val){
                case 'tk1':
                    mapServer.tdtImageMap();
                    mapServer.tdtImageLabelMap();
                    break;
                case 'tk2':
                    mapServer.tdtVecMap();
                    mapServer.tdtVecLabelMap();
                    break;
                case 'arcGis1':
                    mapServer.arcgisImageMap();
                    break;
                case 'arcGis2':
                    mapServer.arcgisVecMap();
                    break;
                case 'aMap1':
                    mapServer.gdImageMap();
                    break;
                case 'aMap2':
                    mapServer.gdVecMap();
                    break;
                case 'bMap1':
                    mapServer.bdImageMap();
                    mapServer.bdImageLabelMap();
                    break;
                case 'bMap2':
                    mapServer.bdVecMap();
                    break;
                case 'googleMap':
                    mapServer.googleMap();
                    break;
                default:
                    mapServer.tdtVecMap();
                    mapServer.tdtVecLabelMap();
                    break;
            }
        };
        // 添加图形
        const shapeChange = (val:[]) => {
            let len = val.length;
            if(len === 0){
                mapAddLayer.clearAddAll();
                clearWebglPoint();
                state.shapeLen = 0;
                state.proShape = [];
            }else if(len > state.shapeLen){
                //新增对应图层
                switch(val[len-1]){
                    case 'point':
                        mapAddLayer.addPoint(addData.point);
                        break;
                    case 'icon':
                        mapAddLayer.addIcon(addData.point);
                        break;
                    case 'line':
                        mapAddLayer.addLine(addData.line);
                        break;
                    case 'circle':
                        mapAddLayer.addCircle(addData.circleCenter,addData.circleRadius)
                        break;
                    case 'polygon':
                        mapAddLayer.addPolygon(addData.polygon);
                        break;
                    case 'multiPolygon':
                        mapAddLayer.addMultiPolygon(addData.multiPolygon);
                        break;
                    case 'star':
                        mapAddLayer.addStar(addData.star);
                        break;
                    case 'massivePoints':
                        addWebglPoint();
                        break;
                    default:
                        break;
                }
                state.shapeLen = len;
                state.proShape = val;
            }else{
                //删除对应图层
                const arr = [...state.proShape,...val];
                const newArr = arr.filter(item => {
                    return !(state.proShape.includes(item) && val.includes(item));
                });
                switch(newArr[0]){
                    case 'point':
                        mapAddLayer.clearPoint();
                        break;
                    case 'icon':
                        mapAddLayer.clearIcon();
                        break;
                    case 'line':
                        mapAddLayer.clearLine();
                        break;
                    case 'circle':
                        mapAddLayer.clearCircle()
                        break;
                    case 'polygon':
                        mapAddLayer.clearPolygon();
                        break;
                    case 'multiPolygon':
                        mapAddLayer.clearMultiPolygon();
                        break;
                    case 'star':
                        mapAddLayer.clearStar();
                        break;
                    case 'massivePoints':
                        clearWebglPoint();
                        break;
                    default:
                        break;
                }
                state.shapeLen = len;
                state.proShape = val;
            }
            
        };
        // 画图
        const grapeChange = (val: string) => {
            clearDraw();
            if(val){
                drawShape(val);
            }  
        };
        // 测量
        const radioChange = (val: string) => {
            console.log("radio", val);
            // let type = '';
            switch(val){
                case 'len1':
                    surveryDraw('LineString');
                    break;
                case 'len2':
                    break;
                case 'area1':
                    surveryDraw('Polygon');
                    break;
                case 'area2':
                    break;
                case 'clear':
                    clearSurvery();
                    break;
                default: 
                    break;
            }
        };
        //选择图片
        const addImage = () => {
            if(state.isImage){
                mapAddLayer.clearPolygon();
                clearGeoImage();
            }else{
                mapAddLayer.addPolygon(addData.imagePolygon);
                addGeoImage(addData.imagePolygon);
            }
            state.isImage = !state.isImage;
        };
        // 热力图
        const addHeatmap = () => {
            if(state.isHeatmap){
                clearHeatmapLayer();  
            }else{
                addHeatmapLayer('blur', 'radius');
            }
            state.isHeatmap = !state.isHeatmap
        };
        // 风场
        const addWindy = () => {
            if(state.isWindy){
                clearWindLayer();
            }else{
                addWindLayer();
            }
            state.isWindy = !state.isWindy;
        };
        // 云图
        const addCloud = () => {
            if(state.isCloud){
                clearWmts();
            }else{
                addWmtsCapabilities();
            }
            state.isCloud = !state.isCloud;
        };
        //卷帘
        const toSwipe = (index:number) => {
            if(index === 1){
                router.push('/swipe');
            }else if(index === 2){
                router.push('/swipeNew');
            }else{
                router.push('/swipeHide');
            }
            
        };
        //双屏对比
        const toDoubleScreen = () =>{
            router.push('/doubleScreen');
        };
        //晨昏线
        const addTerminator = () => {
            state.isTerminator = !state.isTerminator;
            if(state.isTerminator){
                addDayNightTerminator();
            }else{
                clearDayNightTerminator();
            }
        };
        //多底图
        const toMultiBaseMap = () => {
            router.push('/multiBaseMap');
        };
        //popup
        const showPopup = () => {
            state.isPopup = !state.isPopup;
        };
        //gif
        const showGif = () => {
            state.isGif = !state.isGif;
            if(state.isGif){
                addGif("gifBox");
            }else{
                clearGif();
            }
        };
        const showGifs = () => {
            state.isGifs = !state.isGifs;
            if(state.isGifs){
                addGifs(addData.gifPoints, "gifsBox");
            }else{
                clearGifs();
            }
        };
        // pbf
        const showPbf = () => {
            state.isPbf = !state.isPbf;
            if(state.isPbf){
                addHbPbf();
            } else{
                clearHbPbf();
            }
        };
        //animate
        const showAnimate = () => {
            state.isAnimate = true;
        };
        const closeDialog = (flag:boolean) => {
            state.isAnimate = flag;
        };
        return {
            ...toRefs(state),
            handleChange,
            shapeChange,
            grapeChange,
            radioChange,
            addImage,
            addHeatmap,
            addWindy,
            addCloud,
            toSwipe,
            toDoubleScreen,
            addTerminator,
            toMultiBaseMap,
            showPopup,
            showGif,
            showGifs,
            timescale,
            showPbf,
            showAnimate,
            closeDialog
        }
    }
})
</script>

<style scoped>
#mapBox{
    width: 100%;
    height:100vh;
}
.mapSelect{
    position: absolute;
    top:10px;
    left: 10px;
}
.shapeSelect{
    position: absolute;
    top:10px;
    left: 240px;
}
.grapeSelect{
    position: absolute;
    top:10px;
    left: 480px;
}
.radioGroup{
    position: absolute;
    top:10px;
    left: 720px;
    background: #fff;
    border: 1px solid #ffcc33;
    padding: 0 8px;
}
.imageBtn{
    position: absolute;
    top: 50px;
    left: 10px;
    padding: 2 10px;
}
.heatmapBtn{
    position: absolute;
    top: 100px;
    left: 0;
    padding: 2 10px;
}
.heatmapBox{
    position: absolute;
    left: 80px;
    top: 105px;
    color: blue;
}
.windyBtn{
    position: absolute;
    top: 150px;
    left: 10px;
    padding: 2 10px;
}
.windyBox{
    position: absolute;
    left: 80px;
    top: 150px;
    border:1px solid blue;
    width:150px;
    background:#fff;
    text-align:left;
    padding-left:5px;
}
.cloudBtn{
    position: absolute;
    top: 200px;
    left: 10px;
    padding: 2 10px;
}
.terminatorBtn{
    position: absolute;
    /* top: 250px; */
    top: 200px;
    left: 10px;
    padding: 2 10px;
}
.popupBtn{
    position: absolute;
    top: 300px;
    left: 0px;
    padding: 2 10px;
}
.gifBtn{
    position: absolute;
    /* top: 350px; */
    top: 250px;
    left: 0px;
    padding: 2 10px;
}
.gifsBtn{
    position: absolute;
    /* top: 400px; */
    top: 300px;
    left: 10px;
    padding: 2 10px;
}
.pbfBtn{
    position: absolute;
    top: 450px;
    left: 10px;
    padding: 2 10px;
}
.animateBtn{
    position: absolute;
    /* top: 500px; */
    top: 350px;
    left: 10px;
    padding: 2 10px;
}
.swipeBtn1{
    position: absolute;
    top: 14px;
    right:170px;
    padding: 2 10px;
}
.swipeBtn2{
    position: absolute;
    top: 14px;
    right: 90px;
    padding: 2 10px;
}
.swipeBtn3{
    position: absolute;
    top: 14px;
    right: 10px;
    padding: 2 10px;
}
.splitBtn{
    position: absolute;
    top: 64px;
    right: 90px;
    padding: 2 10px;
}
.multiMapBtn{
    position: absolute;
    top: 64px;
    right: 10px;
    padding: 2 10px;
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
    bottom:5em;
    right:0.5em;
}
</style>