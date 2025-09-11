
export default class timeLine{
    isShow:boolean;
    packId:string;
    myDate;
    oneDate;
    hour;
    dayslength;
    date_start;
    left_length;
    l_length;
    timer;

    constructor(val:any){
        this.isShow = false;  //时间线工具是否在页面中显示
        this.packId = val.id; //时间线图标容器

        this.myDate = +new Date();
        this.oneDate = 1000 * 60 * 60 * 24;
		this.hour = new Date().getHours(); //当前时间
        this.dayslength = (document.body.clientWidth - 45) / 6;
		this.date_start = this.dayslength + 45;
        this.left_length = this.date_start + (this.hour/ 3) * this.dayslength / 7;
        //进度条前进
        this.l_length = "";
        this.timer = 1; //定时器

    }
}