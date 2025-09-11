//添加gif
import { map } from "./BaseMap";
import Overlay from 'ol/Overlay';
import * as olProj from 'ol/proj';

//单个点
let gifLayer:any = null;
let gifUrl = '/src/assets/test.gif';
let gifUrls = '/src/assets/gif.gif';
const addGif = (id:string) => {
    let gifDiv = <HTMLElement>document.getElementById(id);
    gifLayer = new Overlay({
        id: "overlay",
        position: [0, 0],//默认空
        positioning: 'center-bottom',
        element: gifDiv,//绑定上面添加的元素
        //stopEvent: false,
        offset: [-13.5, 40]//图片偏移量
    });
    map.addOverlay(gifLayer);
    let src = gifUrl;//拼接图片地址
    gifDiv.style.backgroundImage = 'url(' + src + ')';
    gifLayer.setPosition([12970694.29785, 4743563.564]); //显示  
};
const clearGif = () => {
    // gifLayer.setPosition(undefined);
    if(gifLayer){
        map.removeOverlay(gifLayer);
        gifLayer = null;
    }
};
/**
 * @description 撒点（以overlay的element方式，解决openlayers无法加载gif图片等问题）
 * @param {Map} _map 地图对象
 * @param {Array} _points 点集，格式[{attributes:{long:129.76694,lat:47.43563}}]
 * @param {Object} _imgParam 图片名称，格式{src:图片url,width:图片宽,height:图片高}
 * @param {String} _elementId overlay添加的容器Id
 * @param {Function} _clickFunc 点击图片回调函数
*/
//多个点
let gifLayers:any = [];
const addGifs = (points:any[],elementId:string) => {
    let marker = null;
    let imgParam = {
        width: '300px',
        height: '300px',
        src: gifUrls
    }
    //循环点集
    for(let i=0; i<points.length;i++){
        // 新增放置overlayer的div
        let overlay = <HTMLElement>document.getElementById(elementId);
        overlay.id = elementId;
        if(document.getElementById('overlay' + i)){
            let removeLayer = map.getOverlayById('overlay' + i);
            map.removeOverlay(removeLayer);
        }
        let sElement = <any>document.createElement('div');
        let xy = olProj.fromLonLat([points[i].attributes.long, points[i].attributes.lat]);
        sElement.id = 'overlay' + i;
        sElement.style.width = imgParam.width;
        sElement.style.height = imgParam.height;
        sElement.attr = points[i].attributes;
        sElement.x = xy[0];
        sElement.y = xy[1];
        overlay.appendChild(sElement);

        //新增overlayer
        let gifElement = <HTMLElement>document.getElementById('overlay' + i)
        let layer = new Overlay({
            id: 'overlay' + i,
            positioning: 'center-center',
            //属性
            // attributes: points[i].attributes,
            //overly放置的div
            element: gifElement,
            stopEvent: false,
        })

        //逐个把overlayer添加到地图上
        map.addOverlay(layer);
        let src = imgParam.src;//拼接图片地址
        gifElement.style.backgroundImage = 'url(' + src + ')';
        layer.setPosition(xy); //显示  
        gifLayers.push(layer);
    }
};
const clearGifs = () => {
    console.log("here!")
    // gifLayer.setPosition(undefined);
    if(gifLayers.length > 0){
        for(let i=0; i<gifLayers.length; i++){
            map.removeOverlay(gifLayers[i]);
        }  
        gifLayers = [];
    }
};
export {
    addGif,
    clearGif,
    addGifs,
    clearGifs
}