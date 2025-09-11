<!--弹出框样式-->
<template>
  <div class="popup">
    <div class="popup-title">{{props.title}}</div>
    <a href="#" id="popup-closer" class="popup-closer"></a>
    <div class="popup-img">
      <img :src="props.img" />
    </div>
    <div class="popup-dec">
      <div>
        <span class="">项目描述：</span>
        <span class="">{{props.dec}}</span>
      </div>
      <div>
        <span class="">项目状态：</span>
        <span class="">{{props.status}}</span>
      </div>
    </div>
    <a href="#" class="popup-btn">查看详情></a>
  </div>
</template>

<script lang="ts">
import { defineComponent} from 'vue'

export default defineComponent({
  props:{
    title:{
      type: String,
      default: "标题",
    },
    img:{
      type: String,
      default: "",
    },
    dec:{
      type: String,
      default: "",
    },
    status:{
      type: String,
      default: "",
    },
    popupId:{
       type: String,
      default: "",
    },
    closeId:{
       type: String,
      default: "",
    }
  },
  setup(props,ctx) {
      return {
        props
      }
  },
})
</script>

<style lang="scss" scoped>
.popup{
  width:340px;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  border: 1px solid #cccccc;
  &-title{
    font-size:10px;
    color:#fff;
    margin-top:5px;
    margin-bottom:5px;
  }
  &-img{
    width:300px;
    height:240px;
    margin-bottom: 5px;
    margin-left: 20px;
    img{
      margin:0;
      object-fit:cover;
      width:100%;
      height:100%;
      cursor: pointer;
    }
  }
  &-dec{
    width:300px;
    margin-left: 20px;
    margin-bottom:10px;
    div{
      margin-top:10px;
    }
    span{
      font-size:10px;
      color:#fff;
      display:block;
      text-align:left;
    }
  }
  &-btn{
    text-decoration: none;
    position: absolute;
    right: 10px;
    bottom: 5px;
    font-size:10px;
    color:#fff;
    display: block;
  }
  &-closer{
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
    transition: 0.5s;
    color: #fff;
  }
}
.popup:after,.popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.popup:after {
  border-top-color: #57606f;
  border-width: 10px;
  left: 50%;
  margin-left: -10px;
}
.popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 50%;
  margin-left: -11px;
}
.popup-closer:after {
  content: "✖";
  color: #f1f2f6;
}
.popup-closer:hover {
  transform: rotate(360deg);
}
</style>>

