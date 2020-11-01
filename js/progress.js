// 实现播放和音量进度条的功能

(function(window){
    function Progress($progressBar,$progressLine,$progressDot){
        return new Progress.prototype.init($progressBar,$progressLine,$progressDot);
    }
    Progress.prototype={
        constructor:Progress,
       init:function($progressBar,$progressLine,$progressDot){
        this.$progressBar=$progressBar;
        this.$progressLine=$progressLine;
        this.$progressDot=$progressDot;
       },
    //isMove用于判断是否在拖拽,因为拖拽的时候进度条有回调函数,会在拖拽时一直回弹,利用这个标志位,来取消这个bug
    isMove:false,
    // 实现进度条点击   
    progressClick:function(callBack){
        // 谁调用这个方法，this就是谁，这里在index.js中是progress调用的
        //这里$this保存了三个对象$progressBar、Line、Got
        var $this=this;
        // 监听背景的点击
        $this.$progressBar.click(function(event){
        //现在this是指向背景($progressBar)
        var normalLeft=$(this).offset().left;//获取背景距离窗口左边的距离
        // 获取在点击点距离左边窗口的距离
        // 点击事件有一个pageX属性,event.pageX 属性返回鼠标指针的位置，相对于文档的左边缘。
        var eventLeft=event.pageX;
        //然后他们的差值设为前景的宽度，这里面this是指向背景，所以使用前面在外面存取的前景的this
        $this.$progressLine.css("width", eventLeft - normalLeft);
        $this.$progressDot.css("left", eventLeft - normalLeft);

        // 实现点击跳转进度播放,首先获取点击的位置(eventLeft - normalLeft)在整个背景中的比例
        var value=(eventLeft - normalLeft)/$(this).width();
        callBack(value);
        })
    },
    // 实现进度条拖拽
    processMove:function(callBack){
        var $this=this; 
        // 获取背景距离窗口距离
        var normalLeft=$this.$progressBar.offset().left;
        var barWidth=$this.$progressBar.width();
        var eventLeft;// 获取点击位置距离窗口的距离
        // 1：监听鼠标点击事件
        $this.$progressBar.mousedown(function(){
            $this.isMove=true;
        // 2：监听鼠标移动事件,这里要做出在进度条一直按下鼠标后，可以页面任何位置拖拽进度的功能，使用document完成
        $(document).mousemove(function(event){ 
            // 获取点击位置距离窗口的距离
            eventLeft=event.pageX;
            var offset=eventLeft - normalLeft;
        if(offset>=0 && offset<=barWidth){
            // 设置前景宽度
            $this.$progressLine.css("width", offset);
            $this.$progressDot.css("left", offset);
            // 实现拖拽跳转进度播放,计算拖拽的位置(eventLeft - normalLeft)在整个背景中的比例
             var value=offset/$(this).width();
             callBack(value);
          }
        })
        })
         // 3：监听鼠标松开事件
         $(document).mouseup(function(){
             $(document).off("mousemove");//off() 方法通常用于移除通过 on() 方法添加的事件处理程序
             $this.isMove=false; 
            //  var value=(eventLeft - normalLeft)/$this.$progressBar.width();
            //  callBack(value);
         })
    },
    // 实现进度条同步
    setProgress:function(value){
        // 默认情况下没有拖拽,如果有拖拽则会执行return
        if(this.isMove) return;
        // 下面这种情况不符合要求,直接返回
        if(value< 0 || value>100) return;
        this.$progressLine.css({
            width:value+"%"
        });
        this.$progressDot.css({
            left:value+"%"
        });
    },

    }
    Progress.prototype.init.prototype=Progress.prototype;
    window.Progress=Progress;
})(window);