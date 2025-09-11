

// 图层样式
import Fill from "ol/style/Fill";
import {
  Style,
  Circle as CircleStyle,
  Stroke as StrokeStyle,
  Icon,
  RegularShape,
  Stroke
} from "ol/style";
// 点
const pointStyle = new Style({
  image: new CircleStyle({
    fill: new Fill({
      // color: 'rgba(255,0,0,1)'
      color: 'rgba(24, 144, 255, 1)'
    }),
    stroke: new StrokeStyle({
      color: 'rgba(255,255,255,0.5)',
      width: 2
    }),
    radius: 6,
    displacement: [0, 0],
    scale: 1
  }),
});
// 图标
const iconStyle = new Style({
  image: new Icon({
    anchor: [1, 1],
    src: '/src/assets/logo.png',
    scale: 0.1
  })
});
//线
const lineStyle = new Style({
  stroke: new StrokeStyle({
    color: 'rgba(255,0,0,1)',
    width: 3,
    lineDash: [1, 2, 3,4,5,6], //绘制虚线，详情见有道云
  })
});
const lineStyles = [
  new Style({
    stroke: new StrokeStyle({
      color: 'rgba(0, 0, 0, 1)',
      width: 3,
      lineDash: [20,20],
      lineDashOffset: 20
    })
  }),
  new Style({
    stroke: new StrokeStyle({  
      color: "rgba(255, 255, 10, 1)",
      width: 3,
      lineDash: [20,20]
    })
  })
];
// 圆
const circleStyle = new Style({
  fill: new Fill({
    color: 'rgba(255,255,255,0.2)'
  }),
  stroke: new StrokeStyle({
    color: 'rgba(255,0,0,1)',
    width: 2
  })
});
// 多边形
const polygonStyle = new Style({
  fill: new Fill({
    color: 'rgba(255,255,255,0.2)'
  }),
  stroke: new StrokeStyle({
    color: 'rgba(24, 144, 255, 1)',
    width: 2
  })
});
//五角星
const starStyle = new Style({
  image: new RegularShape({
    fill: new Fill({
      color: 'rgba(255,0,0,1)'
    }),
    stroke: new StrokeStyle({
      color: 'black',
      width: 2
    }),
    points: 5,
    radius: 10,
    radius2: 4,
    angle: 0
  })
});
//绘制图形
const drawStyle = new Style({
  fill: new Fill({
    color: 'rgba(255,255,255,0.1)'
  }),
  stroke: new Stroke({
    color: 'rgba(115, 125, 255, 1)',
    width: 2
  }),
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({
      color: 'rgba(255,0,35,1)'
    })
  })
});

// webGL样式
const predefinedStyles = {
  'point':{
    symbol:{
      symbolType: 'circle',
      size: [
        "interpolate", //插值算法--线性,[指数， 基数]
        [ "linear" ], //线性
        [ "get", "population" ], //数据来源字段
        40000, //value最小值，
        7,  //size最小值
        2000000, //value最大值，
        10,  //size最大值
      ],
      // color:[
      //   "match",
      //   [ "get", "hover"], //匹配hover事件
      //   1, //线性
      //   "#ff3f3f", //hover颜色
      //   "#006688", //默认颜色
      // ],
      color:[
        'interpolate',
        ['linear'],
        ['get', 'latitude'], //根据纬度范围匹配颜色
        -80,
        '#ff14c3',
        -20,
        '#ff621d',
        20,
        '#ffed02',
        80,
        '#00ff67'
      ],
      offset: [0, 0],
      opacity: 0.95,
    }
  }
};

export {
  pointStyle,
  iconStyle,
  lineStyle,
  circleStyle,
  polygonStyle,
  starStyle,
  drawStyle,
  lineStyles,
  predefinedStyles
}