<!--卷帘--自定义滑动样式--底图隐藏，容器背景透明-->
<template>
    <div class="mapDiv">
        <div id="mapSwipe" 
            class="mapSwipe" 
            @drop='onDrop($event)'
            @dragover.prevent
            @dragenter.prevent
            > 
        </div>
        <!-- 左右卷帘 -->
        <div id="swipeContainer" @mousemove="move"></div>
        <!-- 上下卷帘 -->
        <div id="swipeContainerTop" @mousemove="moveTop"></div>
        <el-button type="primary" class="swipeBtn" @click="changeSwipe()">
            <span v-if="isLeft">上下卷帘</span>
            <span v-else>左右卷帘</span>
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
            @dragend="isDown = false" 
            :class="(leftImgID == item.id || rightImgID == item.id) ? 'dragged': ''"
            >
            <img :src="item.src" />
            <span>{{item.name}}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent,onMounted,ref,reactive,toRefs } from 'vue'
import { useRouter } from 'vue-router';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import * as olProj from 'ol/proj';
import {addImage,addImageR,imageLayerR,imageLayerL} from '@/components/AddImage'

export default defineComponent({
    setup() {
        const router = useRouter();
        let map = <any>null;
        let rightLayer = <any>null;
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
        const backHome = () => {
            router.push('/home');
        };
        let maxWidth = 0;
        let maxHeight = 0;
        let coord = [122.24,43.65,127.30,46.48];
        let leftSrc = '';
        let rightSrc = '';
        onMounted(async() => {
            initMap("mapSwipe");
            maxWidth = document.body.clientWidth - 2;
            move();
            maxHeight = document.body.clientHeight - 2;   
            await addImage(map, '/src/assets/4.png', coord);
            LayerSwipesLeft(imageLayerL);
            leftSrc = '/src/assets/4.png';
        });
        const initMap = (mapId: string) => {
            let leftURL = 'http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7'; // 高德矢量图
            let rightURL = 'http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6';//影像路图（含路网，含注记）
            let leftLayer = new TileLayer({
                source: new XYZ({
                    url: leftURL
                }),
                visible:false
            });
            rightLayer = new TileLayer({
                source: new XYZ({
                    url: rightURL
                }),
                zIndex: 2,
                visible:false
            });
            map = new Map({
                layers: [leftLayer,rightLayer],
                target: mapId,
                view: new View({
                    center: olProj.fromLonLat([124.40, 45.12]),
                    zoom: 7,
                    maxZoom:20
                })
            })
        };
        let swipe = <any>null;
        const move = () => {
            swipe = <HTMLElement>document.getElementById("swipeContainer");
            let obj = <any>{};
            LayerSwipes(rightLayer);
             if(imageLayerR){
                LayerSwipes(imageLayerR);
            }
            //重新渲染图层
            map.render();
            swipe.onmousedown = (event:any) => {
                let e = event || window.event;
                // 鼠标点击元素那一刻相对于元素左侧边框的距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
                obj.diffX = e.clientX - swipe.offsetLeft;
                document.onmousemove = function (event) {
                    let e = event || window.event;
                    let moveX = e.clientX - obj.diffX;
                    if (moveX < 0) {
                        moveX = 0;
                    } else if (moveX > maxWidth) {
                        moveX = maxWidth;
                    }
                    swipe.style.left = moveX + "px";
                    LayerSwipes(rightLayer);
                    //重新渲染图层
                    map.render();
                };
                document.onmouseup = function () {
                    this.onmousemove = null;
                    this.onmouseup = null;
                };
            };
        };
        const LayerSwipes = (layer:any) => {
            layer.on('prerender', (event:any) => {
                let ctx = event.context;
                //计算图层在canvas画布上需要显示的范围
                let mapSize = map.getSize();
                let height = event.context.canvas.height;
                let width = event.context.canvas.width;
                let swipeWidth = swipe.offsetLeft * width / mapSize[0];
                let tl = [swipeWidth,0];
                let tr = [width,0];
                let bl = [swipeWidth,height];
                let br = [width,height];

                ctx.save();
                //绘制裁剪路
                ctx.beginPath();
                //1、一个moveTo和三个lineTo
                ctx.moveTo(tl[0], tl[1]);
                ctx.lineTo(bl[0], bl[1]);
                ctx.lineTo(br[0], br[1]);
                ctx.lineTo(tr[0], tr[1]);
                //2.rect相当于"一个moveTo和三个lineTo"
                // ctx.rect(swipeWidth, 0,width - swipeWidth,height)
                ctx.closePath();
                //裁剪，裁剪路径以外的部分不会绘制在canvas上下文中
                ctx.clip();
            });

            layer.on('postrender', (event:any) => {
                // 在地图渲染之后触发
                let ctx = event.context;
                ctx.restore();
            });
        };
        const LayerSwipesLeft = (layer:any) => {     
            layer.on('prerender', (event:any) => {
                let ctx = event.context;
                //计算图层在canvas画布上需要显示的范围
                let mapSize = map.getSize();
                let height = event.context.canvas.height;
                let width = event.context.canvas.width;
                let swipeWidth = swipe.offsetLeft * width / mapSize[0];
                ctx.save();
                //绘制裁剪路
                ctx.beginPath();
                ctx.rect(0, 0,swipeWidth,height)
                ctx.closePath();
                //裁剪，裁剪路径以外的部分不会绘制在canvas上下文中
                ctx.clip();
            });
            layer.on('postrender', (event:any) => {
                // 在地图渲染之后触发
                let ctx = event.context;
                ctx.restore();
            });
        };
        const changeSwipe = async() => {
            isLeft.value = ! isLeft.value;
            if(isLeft.value){
                document.getElementById("swipeContainerTop")!.style.display = 'none';
                document.getElementById("swipeContainer")!.style.display = 'block';
                if(leftSrc){
                    await addImage(map, leftSrc, coord);
                    LayerSwipesLeft(imageLayerL);
                }
                move();
            }else{
                document.getElementById("swipeContainerTop")!.style.display = 'block';
                document.getElementById("swipeContainer")!.style.display = 'none';
                if(leftSrc){
                    await addImage(map, leftSrc, coord);
                    LayerSwipesTop(imageLayerL);
                }
                moveTop();
            }
        };
        const moveTop = () => {
            swipe = <HTMLElement>document.getElementById("swipeContainerTop");
            let obj = <any>{};
            LayerSwipesButtom(rightLayer);
            if(imageLayerR){
                LayerSwipesButtom(imageLayerR);
            }
            //重新渲染图层
            map.render();
            swipe.onmousedown = (event:any) => {
                let e = event || window.event;
                // 鼠标点击元素那一刻相对于元素上侧边框的距离=点击时的位置相对于浏览器最上边的距离-物体上边框相对于浏览器最上边的距离
                obj.diffY = e.clientY - swipe.offsetTop;
                document.onmousemove = function (event) {
                    let e = event || window.event;
                    let moveY = e.clientY - obj.diffY;
                    if (moveY < 0) {
                        moveY = 0;
                    } else if (moveY > maxHeight) {
                        moveY = maxHeight;
                    }
                    swipe.style.top = moveY + "px";
                    LayerSwipesButtom(rightLayer);
                    //重新渲染图层
                    map.render();
                };
                document.onmouseup = function () {
                    this.onmousemove = null;
                    this.onmouseup = null;
                };
            };
        };
        const LayerSwipesButtom = (layer:any) => {
            layer.on('prerender', (event:any) => {
                let ctx = event.context;
                //计算图层在canvas画布上需要显示的范围
                let mapSize = map.getSize();
                let height = event.context.canvas.height;
                let width = event.context.canvas.width;
                let swipeHeight = swipe.offsetTop * height / mapSize[1];
                let tl = [0,swipeHeight];
                let tr = [0,height];
                let bl = [width,swipeHeight];
                let br = [width,height];

                ctx.save();
                //绘制裁剪路
                ctx.beginPath();
                // ctx.moveTo(tl[0], tl[1]);
                // ctx.lineTo(bl[0], bl[1]);
                // ctx.lineTo(br[0], br[1]);
                // ctx.lineTo(tr[0], tr[1]);
                ctx.rect(0, swipeHeight,width,height-swipeHeight)
                ctx.closePath();
                //裁剪，裁剪路径以外的部分不会绘制在canvas上下文中
                ctx.clip();
            });

            layer.on('postrender', (event:any) => {
                // 在地图渲染之后触发
                let ctx = event.context;
                ctx.restore();
            });
        };
        const LayerSwipesTop = (layer:any) => {
            layer.on('prerender', (event:any) => {
                let ctx = event.context;
                //计算图层在canvas画布上需要显示的范围
                let mapSize = map.getSize();
                let height = event.context.canvas.height;
                let width = event.context.canvas.width;
                let swipeHeight = swipe.offsetTop * height / mapSize[1];

                ctx.save();
                //绘制裁剪路
                ctx.beginPath();
                ctx.rect(0, 0,width,swipeHeight)
                ctx.closePath();
                //裁剪，裁剪路径以外的部分不会绘制在canvas上下文中
                ctx.clip();
            });

            layer.on('postrender', (event:any) => {
                // 在地图渲染之后触发
                let ctx = event.context;
                ctx.restore();
            });
        };
        let dragItem = <any>{}
        const dragstart = (e:any,item:any) => {
            isDown.value = true;
            dragItem = item;
        };
        const onDrop = async(e:any) => {
            if(state.leftImgID == dragItem.id || state.rightImgID == dragItem.id ){
                return;
            }
            if(isLeft.value){
                if(e.offsetX <= swipe.offsetLeft){
                    //左侧
                    await addImage(map, dragItem.src, dragItem.coord);
                    LayerSwipesLeft(imageLayerL);
                    state.leftImgID = dragItem.id;
                    leftSrc = dragItem.src;
                }else{
                    state.rightImgID = dragItem.id;
                    await addImageR(map, dragItem.src, dragItem.coord);
                    LayerSwipes(imageLayerR);
                    rightSrc = dragItem.src;
                }
            }else{
                if(e.offsetY <= swipe.offsetTop){
                    // 上侧
                    await addImage(map, dragItem.src, dragItem.coord);
                    LayerSwipesTop(imageLayerL);
                    state.leftImgID = dragItem.id;
                    leftSrc = dragItem.src;
                }else{
                    state.rightImgID = dragItem.id;
                    await addImageR(map, dragItem.src, dragItem.coord);
                    LayerSwipesButtom(imageLayerR);
                    rightSrc = dragItem.src;
                }
            }
            
        };
        return {
            isLeft,
            backHome,
            move,
            changeSwipe,
            moveTop,
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
    width: calc(100% - 299px);
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(20, 55, 97, 0.8);
    border-right: 1px solid #fff;
}
.mapSwipe{
    width: 100%;
    height:100vh;
}
.homeBtn{
    position: absolute;
    top: 10px;
    left: 10px;
}
.swipeBtn{
    position: absolute;
    top: 10px;
    left: 90px;
}
// 添加滑块的dom新样式
#swipeContainer {
    position: absolute;
    opacity: 0.8;
    width: 2px;
    height: 100%;
    top: 0;
    left: 50%;
    margin-left: -1px;
    background-color: #00A0E9;
    cursor: e-resize;
    z-index: 2;
}

#swipeContainerTop{
    position: absolute;
    opacity: 0.8;
    width: 100%;
    height: 2px;
    top: 50%;
    left: 0;
    margin-top: -1px;
    background-color: #00A0E9;
    cursor: n-resize;
    z-index: 2;
    display: none;
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