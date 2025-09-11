import { Map, Overlay } from 'ol'
import popup from './Popup.vue'
import {createApp} from 'vue'

export default class DivPopup{
  openLayersHandler: Map;
  openLayerOverlay: any;
  mapDomContainer;
  overlayInstance: any;
  instance;
  parent;
  instanceReal;
  constructor(val:any) {
    this.openLayersHandler = val.mapHandler;
    this.mapDomContainer = this.openLayersHandler.getTargetElement()
    let position = val.position;
    let title = val.title;
    let img = val.img;
    let dec = val.dec;
    let status = val.status;
    this.instance = createApp(popup, {
      title,
      img,
      dec,
      status,
    })
    this.parent = document.createElement('div')
    this.instanceReal = this.instance.mount(this.parent) //根据模板创建一个面板
    this.mapDomContainer?.appendChild(this.parent); //将字符串模板生成的内容添加到DOM上
    let closer = document.getElementById("popup-closer");
    this.makeOverLayer(position,closer);
  }
  makeOverLayer(point: any, closer: any) {
    // 关闭事件
    closer.onclick = () => {
      closer.blur();
      this.close();
      return false
    }
    this.openLayerOverlay = new Overlay({
      element: this.parent,//传递的Dom结构
      positioning: 'bottom-center',// 对齐方式
      stopEvent: false,
      offset: [-10, -20], //偏移[左右，上下],
      autoPan: true, // 定义弹出窗口在边缘点击时候可能不完整 设置自动平移效果
      autoPanAnimation: {
        duration: 250 //自动平移效果的动画时间 9毫秒）
      }
    });
    this.openLayersHandler.addOverlay(this.openLayerOverlay);
    this.openLayerOverlay.setPosition(point);
  }

  close() {
    this.openLayerOverlay.setPosition(undefined);
    this.openLayersHandler.removeOverlay(this.openLayerOverlay);
    this.parent.style.display = "none";
  }
}