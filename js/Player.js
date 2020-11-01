// 播放功能
(function(window){
    function Player($audio){
        return new Player.prototype.init($audio);
    }
    Player.prototype={
        constructor:Player,
        musicList: [],
        init:function($audio){
            this.$audio=$audio;//jquery对象
            this.audio=$audio.get(0);//原生对象
        },
        currtenIndex:-1,
         //实现播放/暂停
        playerMusic:function(index,music){
           
            //判断是否是同一首音乐，定义一个标志符currtenIndex=-1，记录当前播放的音乐

            //如果是同一首：
            if(this.currtenIndex==index){
                //判断当前状态是播放还是暂停
                if(this.audio.paused){
                    //如果是暂停，则点击后播放
                    this.audio.play();
                }else{
                    //否则是播放，则点击后暂停
                    this.audio.pause();
                }
            }else{//否则不是同一首
                //获取到点击的音乐地址
               this.$audio.attr("src",music.link_url);
                //然后播放
                this.audio.play();
                this.currtenIndex=index; 
            }
        },
        // 实现上一首，下一首的切换
        preIndex: function () {
            let index = this.currtenIndex - 1;
            if(index < 0){//如果小于0则播放最后一首
            index = this.musicList.length - 1;
            }
            return index;
        },
        nextIndex:function(){
            let index =this.currtenIndex+1;
            if(index>this.musicList.length - 1){//如果大于最后一首索引则播放第一首
                index=0;
            }
            return index;
        },
        // 实现播放时间的走动
        musicTimeUpdate:function(callBack){
            var $this=this;//保留player的this
            // console.log($this);
            this.$audio.on("timeupdate",function(){
                var duration= $this.audio.duration;//总时长
                var currentTime=$this.audio.currentTime//播放时长
                //下面需要将时间格式化，因为上面的时间都是秒,调用创建的formatDate方法
                var timeStr=$this.formatDate(currentTime,duration);     
                callBack(duration,currentTime,timeStr);
             })
        },
        // 实现播放时间的格式化
        formatDate:function(currentTime,duration){
        var endMin=parseInt(duration/60);//获取总时长分钟
        var endSec=parseInt(duration%60);//获取总时长秒钟
        if(endMin<10){
        // 在分钟前面添零
         endMin="0"+endMin;
        }
        if(endSec<10){
        // 在秒前面添零
         endSec="0"+endSec;
        }
        var currentMin=parseInt(currentTime/60);//获取总时长分钟
        var currentSec=parseInt(currentTime%60);//获取总时长秒钟
        if(currentMin<10){
        // 在分钟前面添零
        currentMin="0"+currentMin;
        }
        if(currentSec<10){
        // 在秒前面添零
        currentSec="0"+currentSec;
        }
        
        return currentMin+":"+currentSec+"/"+ endMin+":"+ endSec;
        },
        // 实现点击/拖拽的进度条的播放
        musicSeekTo:function(value){
            // console.log(value);//有时候是NaN会报错
            if(isNaN(value)) return;
            this.audio.currentTime=this.audio.duration*value;
        },
        // 实现点击音量图标,完成静音与有声音的改变功能
        musicVoiceSeekTo:function(value){
            // 音量的value的有效值是0~1
            // console.log(value);//有时候是NaN会报错
            if(isNaN(value)) return;
            if(value<0||value>1) return;
           
            // audio.volume是原生js中的方法,设置音量,它的取值是0~1,0是静音
            this.audio.volume=value;
        },
      
    }
    Player.prototype.init.prototype=Player.prototype;
    window.Player=Player;
})(window);