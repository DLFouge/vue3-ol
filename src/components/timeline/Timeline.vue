<!--时间轴样式-->
<template>
    <div class="timeBox">
        <!--左侧时间显示-->
        <div class="time_left">
            <div class="time_circle">
                <div class="time_circle_date">{{props.date}}</div>
                <div class="time_circle_time">{{props.time}}</div>
                <div class="time_circle_check">
                    <img v-if="playState" src="@/assets/start.svg" title="暂停" @click="playState = false,stopInterval()"/>
                    <img v-if="!playState" src="@/assets/stop.svg" title="播放" @click="playState = true,startInterval()"/>
                    <img src="@/assets/left.svg" title="前一天" @click="upTime()" />
                    <img src="@/assets/right.svg" title="后一天" @click="nextTime()" />
                </div>
            </div>   
        </div>
        <div class="time_div">      
            <div v-for="(item,index) in timeList" :key="index">
                <el-tooltip class="item" effect="dark" :content="item" placement="top-end">
                    <div class="scalMark" :style="index%5 == 0 ? 'height:10%;':'height:60%;'" :id="item" @click="timeClick(item)">
                        <template v-if="index > 0">
                        <div v-if="index%5 == 0" style="position: relative;top: -20px;left:-30px;color: #FFF;width: 70px;font-size: 0.75rem;">
                            {{item}}
                        </div>
                        <div v-else style="position: relative;top: -20px;left:-10px;color: red;width: 30px;font-size: 0.5rem;">
                            {{item}}
                        </div>
                        </template>
                    </div>
				</el-tooltip>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive,toRefs,nextTick,defineExpose, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import moment from 'moment';

export default defineComponent({
    props:{
        date:{
            type: String,
            default: "2022-09-05",
        },
        time:{
            type: String,
            default: "15:52:01",
        },
        isStart:{
            type: Boolean,
            default: false,
        },
        timeList:{
            type: Array,
		    default: () => <any>[]
        },
    }, 
    setup(props,ctx) {
        const state = reactive({
            timeList:<any>[],
            thisTime:'',
            progresswidth: 0,
            playState: false,
            interval:<any>null,
        })
        const stopInterval = () => {
			clearInterval(state.interval)
		};
        const startInterval = () => {
            state.interval = setInterval(() => {
                if(state.timeList.indexOf(state.thisTime)+1 == state.timeList.length){
                    state.playState =  false
                    stopInterval()
                }else{
                    state.thisTime = state.timeList[state.timeList.indexOf(state.thisTime) + 1]
                }
                setProgressWidth()
            }, 1000)
        };
        const setProgressWidth = () =>{
            state.progresswidth = document.getElementById(state.thisTime)!.offsetLeft
            // state.$emit('schedule',state.thisTime)
        };
        const upTime = () => {
            if(state.thisTime == state.timeList[0]){
                ElMessage({
                    message: '已经是第一天了',
                    type: 'warning'
                });
            }else{
                state.thisTime = state.timeList[state.timeList.indexOf(state.thisTime)-1]
                setProgressWidth()
            }
        };
        const nextTime = () =>{
            if(state.thisTime == state.timeList[state.timeList.length-1]){
                ElMessage({
                    message: '已经是最后一天了',
                    type: 'warning'
                });
            }else{
                state.thisTime = state.timeList[state.timeList.indexOf(state.thisTime)+1]
                setProgressWidth()
            }
        };
        const init = (time:string,start:string,end:string) => {
            console.log("1111")
            // state.timeList = getScopeTime(start,end,2)
            state.timeList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
            state.thisTime = time
            nextTick(()=>{
                setProgressWidth()
            })
        };
        const timeClick = (time:string) =>{
            state.thisTime = time
            setProgressWidth()
        };
        // type：1按日返回小时 2按月返回每天 
        const getScopeTime = (startTime:string, endTime:string, type:number) =>{
            console.log("2222")
            let start = new Date(startTime).getTime()
            let end = new Date(endTime).getTime()
            let time = [];
            console.log("3333",start,end,new Date('2022-09-13').getTime())
            if (type == 2) {
                for (let i = 0; i < 1; i--) {
                    start += 86400000
                    if (start == end) {
                        time.unshift(startTime.split(' ')[0])
                        break
                    } else {
                        time.push(unixTimeToDateTime(start).split(' ')[0])
                    }
                }
            } else if (type == 1) {
                for (let i = 0; i < 1; i--) {
                    start += 3600000
                    if (start == end) {
                        time.unshift(startTime.split(' ')[0])
                        break
                    } else {
                        time.push(unixTimeToDateTime(start))
                    }
                }
            }
            console.log("tiem",time)
            return time
        };
        const unixTimeToDateTime = (unix_time:number) => {     
            return moment(unix_time).format("YYYY-MM-DD hh:mm:ss");
        };
        // defineExpose({init})
        onMounted(() => {
            init('2022-09-13 15:31:42','2022-09-01 00:00:00','2022-09-30 23:59:59')
        })
        return {
            ...toRefs(state),
            props,
            stopInterval,
            startInterval,
            upTime,
            nextTime,
            timeClick,
            init
        }
    },
})
</script>


<style lang="scss" scoped>
.timeBox{
    position: absolute;
    width: 100%;
    z-index: 10;
    bottom: 0;
    display: flex;
}
/*左侧时间显示*/
.time_left{
    width: 136px;
    height: 90px;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    .time_circle{
        width: 136px;
        height: 136px;
        border-radius: 50%;
        background: rgba(51,51,51,.8);
        color: #fff;
        font-size: 14px;
        &_date{
            padding-top: 18px;
        }
        &_time{
            padding-top: 2px;
        }
        &_check{
            img{
                cursor: pointer;
            }
        }
    }
}

/* 时间线样式 */
.time_div{
	position: absolute;
    height: 42px;
    width: calc(100% - 136px);
    left: 136px;
    bottom: 10px;
	background: rgba(51,51,51,.8);
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    flex-flow: row nowrap;
    align-items: flex-end;
}

.scalMark{
    width: 2px;
    background-color: #FFF;
    cursor: pointer;
    margin-right:25px;
}

.progress {
    height:100%;
    position: absolute;
    display: flex;
    align-items: flex-end;
    z-index: -1;
    transition-duration: 0.5s;
}

.triangle {
    width: 0px;
    height: 0px;
    border: 20px solid transparent;
    border-top-color: #00FFFF;
    // opacity: 1;
    position: absolute;
    left: -20px;
    top: 20px;
}
</style>