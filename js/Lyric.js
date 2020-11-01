/* 
    实现歌词同步功能
*/
(function(window){
    function Lyric(path){
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype={
        constructor:Lyric,
        init:function(path){
            this.path=path;
        },
         times:[],//存时间
         lyrics:[],//存歌词
         index:-1,//标志歌词索引
        // 获取歌词方法,使用ajax
        loadLyric:function(callback){
            $this=this;
            // console.log($this);
            $.ajax(
                // 获取一个对象,里面的键值对告诉它一些信息
                {
                    url:$this.path,//告诉他获取歌曲地址
                    dataType:"text",//告诉他文本格式
                    success:function(data){//成功获取执行这个函数
                        // console.log(data);
                        // 调用这个方法来解析每一行歌词
                        $this.parseLyric(data);
                        callback();           
                    },
                    error:function(e){//失败的时候执行
                        console.log(e);
                    }      
                }
            )
        },
        // 创建解析歌词方法（在上面方法函数中使用了）
        parseLyric: function(data){
            $this=this;
            // 一定要清空上一首歌词信息
            $this.times=[];
            $this.lyrics=[];
            var array=data.split("\n");
            // console.log(arry);
            // 创建一个匹配时间的正则表达式  [00:00.92]
            var timeReg=/\[(\d*:\d*\.\d*)\]/
            // 遍历出每一条歌词
            $.each(array,function(index,ele){
                    //处理歌词（因为有空字符窜，所以要去掉）
                    var lyr=ele.split("]")[1];
                    // console.log(lyr);
                    if(lyr.length==1) return true;
                    $this.lyrics.push(lyr);
                // console.log(ele);
                // exec() 方法用于检索字符串中的正则表达式的匹配。该函数返回一个数组，其中存放匹配的结果。如果未找到匹配，则返回值为 null。
                var res=timeReg.exec(ele);
                // return true相当于continue ，遇到null执行下一次遍历
                if(res==null) return true;
                // console.log(res);//从这里面可以看出对象res的第一个索引的值是我们需要的时间样式
                var timeStr=res[1];
                // console.log(timeStr);//00:00.92
                var res2=timeStr.split(":");
                // 将时间转为秒钟
                var min=parseInt(res2[0])*60;
                var sec=parseFloat(res2[1]);
                var time=parseFloat((min+sec).toFixed(2));
                // console.log(time);
              // 把时间存到数组
              $this.times.push(time);
            });
        //    console.log( $this.times);
        //    console.log($this.lyrics);
        },
        // 获取播放进度的当前时间
        currentIndex:function(currentTime){
            // console.log(currentTime);
            /* 
                比如时间是0.93时满足下面条件，则index=0，然后删除时间数组最前面的（0.92），删除后4.75就是数组第0个了，并且返回index，此时index=0在歌词数组中lyrics[0]="告白气球 - 周杰伦"
            */
            if(currentTime >= this.times[0]){
                this.index++; // 0  1
                this.times.shift(); // 删除数组最前面的一个元素
            }
            return this.index; // 1
        /* 部分时间和歌词       
         [0.92，4.75，6.4,23.59,26.16,29.33,34.27,36.9];
         ["告白气球 - 周杰伦","词：方文山","曲：周杰伦","塞纳河畔 左岸的咖啡","我手一杯 品尝你的美","留下唇印的嘴","花店玫瑰 名字写错谁","告白气球 风吹到对街"]
        */
        }
    }
    Lyric.prototype.init.prototype=Lyric.prototype;
    window.Lyric=Lyric;
})(window);