<!-- 时间尺度 -->
<template>
	<div class="time">
		<div class="time_menu" v-show="timeList.length != 0">
			<template v-if="playState">
				<el-tooltip class="item" effect="dark" content="暂停" placement="top-end">
					<img src="@/assets/start.svg" @click="playState = false,stopInterval()" />
				</el-tooltip>
			</template>
			<template v-if="!playState">
				<el-tooltip class="item" effect="dark" content="播放" placement="top-end">
					<img src="@/assets/start.svg" @click="playState = true,startInterval()" />
				</el-tooltip>
			</template>
			<el-tooltip class="item" effect="dark" content="上一天" placement="top-end">
				<img src="@/assets/start.svg" @click="upTime()" style="transform: rotate(180deg);" />
			</el-tooltip>
			<el-tooltip class="item" effect="dark" content="下一天" placement="top-end">
				<img src="@/assets/start.svg" @click="nextTime()" />
			</el-tooltip>
		</div>
		<div style="width: 80%;height: 100%;position: relative;display: flex;align-items: flex-end;overflow: auto;">
			<div style="height: 40%;display: flex;flex-shrink: 0;flex-flow: row nowrap;align-items: flex-end;">
				<template v-for="(item,index) in timeList" :key="index">
					<el-tooltip class="item" effect="dark" :content="item" placement="top-end">
						<div class="keDuXian" :style="index%5 == 0 ? 'height:100%;':'height:60%;'" :id="item"
							@click="timeClick(item)">
							<template v-if="index > 0">
							<div v-if="index%5 == 0" style="position: relative;top: -20px;left:-30px;color: #FFF;width: 70px;font-size: 0.75rem;">
								{{item}}
							</div>
							</template>
							</div>
					</el-tooltip>
				</template>
			</div>
			<div v-show="timeList.length != 0" class="progress" :style="'width:'+progresswidth+'px;'">
				<div style="width: 100%;height: 40%;background-color: rgb(20,170,255);">
				</div>
			</div>
			<img v-show="timeList.length != 0" src="@/assets/start.svg" class="progressImg" :style="'left:'+(progresswidth == 0 ? -7 : (progresswidth-8))+'px;'" />
		</div>
	</div>
</template>
 
<script>
	export default {
		data() {
			return {
				timeList:[],
				thisTime: '',
				progresswidth: 0,
				playState: false,
				Interval:'',
			}
		},
		beforeDestroy(){
			clearInterval(this.Interval)
		},
		methods: {
			startInterval(){
				this.Interval = setInterval(() => {
					if(this.timeList.indexOf(this.thisTime)+1 == this.timeList.length){
						this.playState =  false
						this.stopInterval()
					}else{
						this.thisTime = this.timeList[this.timeList.indexOf(this.thisTime) + 1]
					}
					this.setProgressWidth()
				}, 4000)
			},
			stopInterval(){
				clearInterval(this.Interval)
			},
			init(time,start,end) {
				this.timeList = this.getScopeTime(start,end,2)
				this.thisTime = time
				this.$nextTick(()=>{
					this.setProgressWidth()
				})
			},
			timeClick(time) {
				this.thisTime = time
				this.setProgressWidth()
			},
			setProgressWidth(){
				this.progresswidth = document.getElementById(this.thisTime).offsetLeft
				// this.$emit('schedule',this.thisTime)
			},
			upTime(){
				if(this.thisTime == this.timeList[0]){
					this.$message({
						message: '已经是第一天了',
						type: 'warning'
					});
				}else{
					this.thisTime = this.timeList[this.timeList.indexOf(this.thisTime)-1]
					this.setProgressWidth()
				}
			},
			nextTime(){
				if(this.thisTime == this.timeList[this.timeList.length-1]){
					this.$message({
						message: '已经是最后一天了',
						type: 'warning'
					});
				}else{
					this.thisTime = this.timeList[this.timeList.indexOf(this.thisTime)+1]
					this.setProgressWidth()
				}
			},
            getScopeTime(startTime, endTime, type){
                let start = new Date(startTime).getTime()
                let end = new Date(endTime).getTime()
                let time = []
                if (type == 2) {
                    for (var i = 0; i < 1; i--) {
                        start += 86400000
                        if (start == end) {
                            time.unshift(startTime.split(' ')[0])
                            break
                        } else {
                            time.push(this.unixTimeToDateTime(start).split(' ')[0])
                        }
                    }
                } else if (type == 1) {
                    for (var i = 0; i < 1; i--) {
                        start += 3600000
                        if (start == end) {
                            time.unshift(startTime.split(' ')[0])
                            break
                        } else {
                            time.push(this.unixTimeToDateTime(start))
                        }
                    }
                }
            
                return time
            },
            unixTimeToDateTime(unix_time){
                //创建一个指定的日期对象
                var temp_time = new Date(unix_time);
                //取得4位数的年份
                var year = temp_time.getFullYear();  
                //取得日期中的月份，其中0表示1月，11表示12月
                var month = temp_time.getMonth()+1;  
                //小于10月的月份补全0 例如1月补全为01月
                month = month < 10 ? "0"+month:month;
                //返回日期月份中的天数（1到31）
                var day = temp_time.getDate();  
                day = day < 10 ? "0"+day:day;
                //返回日期中的小时数（0到23）
                var hour = temp_time.getHours(); 
                hour = hour < 10 ? "0"+hour:hour;
                //返回日期中的分钟数（0到59）
                var minute = temp_time.getMinutes(); 
                minute = minute < 10 ? "0"+minute:minute;
                //返回日期中的秒数（0到59）
                var second = temp_time.getSeconds(); 
                second = second < 10 ? "0"+second:second;

                //拼接需要的时间格式
                var  result_time = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
                return result_time;
            }
		},
        mounted () {
            console.log('组件已挂载');
            // this.init('1662998400000','1661961600000','1664467200000')
        },
	}
</script>
 
<style lang="scss" scoped>
	.time {
		width: 100%;
		height: 100%;
		background: rgba(10, 34, 66, 0.65);
		box-shadow: inset 0px 1px 12px 0px rgba(75, 137, 255, 0.5);
		border-radius: 4px;
		border: 1px solid #57C8EE;
		display: flex;
		align-items: flex-end;
		position: relative;
	}
 
	.time_menu {
		width: 20%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		padding: 0 3%;
		box-sizing: border-box;
 
		img {
			width: 20px;
			height: 20px;
			cursor: pointer;
			transition-duration: 0.5s;
		}
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
	.keDuXian{
		width: 2px;
		background-color: #FFF;
		cursor: pointer;
		margin-right:25px;
	}
	.progressImg{
		width: 1.125rem;
		height: 1.125rem;
		position: absolute;
		z-index:9;
	}
</style>