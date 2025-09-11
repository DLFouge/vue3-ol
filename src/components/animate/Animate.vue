<!--历史轨迹-->
<template>
    <el-dialog
        title="历史轨迹"
        v-model="dialogVisible"
        custom-class="animate"
        append-to-body
        @close="handleClose"
        width="1200px"
        destroy-on-close
    >
        <div id="animateMap"></div>
        <div class="map-area">
            <el-card class="tool-window" style="width: 380px">
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    value-format="yyyy-MM-dd"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    style="width: 100%"
                >
                </el-date-picker>
                <div style="margin-top: 15px">
                    <el-button type="primary" @click="getList">查询</el-button>
                </div>
                <div class="speed">
                    速度：
                    <div class="speed-input">
                        <el-slider
                            v-model="speed"
                            :min="10"
                            :max="1000"
                            :step="10"
                        ></el-slider>
                    </div>
                    <el-button type="primary" @click="changeAnimation">{{
                        animationText
                    }}</el-button>
                </div>
            </el-card>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs,nextTick,watch } from 'vue'
import { Feature, Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import * as olProj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { Circle as CircleGeom, LineString, MultiPolygon, Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import {
  Style,
  Circle as CircleStyle,
  Stroke as StrokeStyle,
  Icon,
} from "ol/style";
import { getVectorContext } from "ol/render";
import { getRotation, getCenterPoint } from "./AnimateCompute";
import car from '@/assets/car.png'

export default defineComponent({
    props: {
        dialogVisible:{
            type: Boolean,
            default: false
        }
    },
    setup(props,ctx) {
        const state = reactive({
            dateRange: [],
            speed: 60,
            animationText: "开始",
            animating: false, // 动画是否进行中
        });
        let animateMap:any = null;
        let routeLayer:any = null;
        const styles:any = {
            route: new Style({
                stroke: new StrokeStyle({
                    lineDash: [2, 6, 10],
                    width: 4,
                    color: [0, 255, 0, 1],
                }),
            }),
            marker: new Style({
                image: new CircleStyle({
                    radius: 10,
                    stroke: new StrokeStyle({
                        color: "#fff",
                    }),
                    fill: new Fill({
                        color: "#3399CC",
                    }),
                }),
            }),
            carMarker: new Style({
                image: new Icon({
                    rotation: 0,
                    src: car,
                    imgSize: [20, 36],
                }),
            })
        };
        const initAnimateMap = () => {
            let center = olProj.fromLonLat([109.54724, 34.562504]);
            routeLayer = new VectorLayer({
                source: routeSource,
                style: (feature) => {
                    return styles[feature.get("type")];
                },
            });
            let baseLayer = gdVecMap();
            animateMap = new Map({
                layers: [baseLayer,routeLayer],
                target: 'animateMap',
                view: new View({
                    center: center,
                    zoom: 9,
                    maxZoom:20
                })
            })
            getList();
        };
        const gdVecMap = () => {
            let url = 'https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
            // let url = 'https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
            let source = new XYZ({
                url: url,
                wrapX: true,
                crossOrigin: 'anonymous'
            })
            let baseLayer = new TileLayer({
                source: source
            });
            return baseLayer;
        };
        const handleClose = () => {
            ctx.emit("closeDialog", false);
            animateMap.dispose();
            animateMap = null
        };
        const getList = () => {
            const points = [
                [108.945951, 34.465262],
                [109.04724, 34.262504],
                [108.580321, 34.076162],
                [110.458983, 35.071209],
                [105.734862, 35.49272],
            ];
            let routes = points.map((item) => {
                return olProj.fromLonLat(item);
            });
            getRoutesAll(routes);
            drawRoute(routes);
        };
        // 分割路径点
        let lastRouteIndex = 0;
        let routesAll:any;
        const getRoutesAll = (routes:any) => {
            let _routesAll = [
                {
                    coordinate: routes[0],
                },
            ];
            for (let i = 0, len = routes.length; i < len - 1; i++) {
                const item:any = routes[i];
                const itemNext:any = routes[i + 1];
                const rotation = getRotation(item, itemNext);
                let points = getCenterPoint(animateMap, [item, itemNext], state.speed);
                points = points.map((item) => {
                    return {
                        rotation,
                        coordinate: item,
                    };
                });
                _routesAll = [..._routesAll, ...points];
            }
            routesAll = _routesAll;
        };
        // 绘制轨迹
        let routeGeometry:any;
        let routeSource:any = new VectorSource({ wrapX: false });
        const drawRoute = (routes:any) =>{
            if (routeGeometry) {
                routeSource.clear();
            }
            routeGeometry = new LineString(routes);
            let route = new Feature({
                type: "route",
                geometry: routeGeometry,
            });
            // 绘制点
            let opints = drawPoint(routes);
            // 添加小车
            let car = drawCar();
            routeSource.addFeatures([route, ...opints, car]);
            // 按轨迹边界缩放
            mapFit();
        };
         // 画点
        const drawPoint = (routes:any) => {
            let iconFeatures:any = [];
            routes.forEach((item:any) => {
                let feature = new Feature({
                    type: "marker",
                    geometry: new Point(item),
                });
                iconFeatures.push(feature);
            });
            return iconFeatures;
        };
        // 小车
        let carGeometry:any;
        let carFeature:any;
        const drawCar = () => {
            carGeometry = new Point(routeGeometry.getFirstCoordinate());
            const carMarker = new Feature({
                type: "carMarker",
                geometry: carGeometry,
            });
            carFeature = carMarker;
            return carMarker;
        };
        const mapFit = () => {
            let view = animateMap.getView();
            view.fit(routeGeometry, {
                padding: [120, 120, 120, 120],
            });
        };
        const changeAnimation = () => {
            state.animating ? stopAnimation() : startAnimation();
        };
        // 开始动画
        const startAnimation = () => {
            state.animating = true;
            state.animationText = "停止";
            routeLayer.on("postrender", moveFeature);
            carFeature.setGeometry(null);
        };
        // 停止动画
        const stopAnimation = () => {
            state.animating = false;
            state.animationText = "开始";
            carFeature.setGeometry(carGeometry);
            routeLayer.un("postrender", moveFeature);
        };
        // 移动动画
        const moveFeature = (event:any) => {
            const len = routesAll.length;
            if (lastRouteIndex < len - 1) {
                lastRouteIndex++;
            } else {
                lastRouteIndex = 0;
            }
            const current = routesAll[lastRouteIndex];
            // console.log(this.distance, currentCoordinate);
            carGeometry.setCoordinates(current.coordinate);
            const vectorContext:any = getVectorContext(event);
            let _style = new Style({
                image: new Icon({
                    anchor: [0.5, 0.5],
                    rotation: current.rotation,
                    src: car,
                    imgSize: [20, 36],
                }),
            });
            vectorContext.setStyle(_style);
            vectorContext.drawGeometry(carGeometry);
            animateMap.render();
        };
        watch(() => props.dialogVisible,
        (n) => {
            if(n){
                nextTick(() => {
                    initAnimateMap();
                })
            }
        })
        return {
            props,
            ...toRefs(state),
            handleClose,
            getList,
            changeAnimation
        }
    },
})
</script>

<style lang="scss" scoped>
#animateMap{
    width: 100%;
    height: 60vh;
}
.animate {
  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
    .map-area {
      box-shadow: inset 5em 1em #000000;
      position: relative;
      .tool-window {
        width: 200px;
        position: absolute;
        bottom: 20px;
        right: 20px;
        .button {
          font-size: 20px;
        }
        .speed {
          margin-top: 15px;
          display: flex;
          align-items: center;
          .speed-input {
            flex: 1;
            margin: 0 10px;
          }
        }
      }
    }
  }
}
</style>
