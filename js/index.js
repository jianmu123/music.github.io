$(function(){
    // 0:自定义滚动条
    $(".content_list").mCustomScrollbar();
    

    var $audio=$("audio");//获取audio
    //根据audio创建一个player对象
    var player=new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;
   
    //1:定义一个方法,加载歌曲列表,使用ajax
    getPlayerList();//调用加载歌曲列表
    function getPlayerList(){
        $.ajax(
            // 获取一个对象,里面的键值对告诉它一些信息
            {
                url:"./source/musiclist.json",//告诉他获取歌曲地址
                dataType:"json",//告诉他文本格式
                success:function(data){//成功获取执行这个函数
                    player.musicList=data;
                   //3.1遍历获取的数据,创建每一条音乐
                     var $musiclist=$(".content_list ul");
                   $.each(data,function(index,ele){
                     var $item=createMusicItem(index,ele);//调用创建歌曲列表方法
                    //为ul添加歌曲信息列表
                    $musiclist.append($item);
                    // console.log(ele.name);
                   });
                // 成功获取信息后初始化页面歌曲信息,初始化的时候是第0首的信息，所以给data[0]
                // 调用iniMusicInfo方法
                initMusicInfo(data[0]);
                // 成功获取信息后初始化页面歌词信息,初始化的时候是第0首的信息，所以给data[0]
                initMusicLyric(data[0]);
                
                },
                error:function(e){//失败的时候执行
                    console.log(e);
                }
                
            }
        )
    }
    
    //2:初始化页面歌曲信息
    function initMusicInfo(music){//拿到第0首music
        // 获取到对象信息
        var $musicImage=$(".song_info_pic img");
        var $musicName=$(".song_info_name a");
        var $musicSinger=$(".song_info_singer a");
        var $musicAlbum=$(".song_info_album a");
        var $musicProgressName=$(".music_progress_name ");
        var $musicProgressTime=$(".music_progress_time ");
        var $maskBg=$(".mask_bg");
       // 给获取到的元素赋值
        $musicImage.attr("src",music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name+"/"+music.singer);
        $musicProgressTime.text("00:00"+"/"+music.time);
        $maskBg.css("background","url('"+music.cover+"')");
        return music.time;
    };
  
    //3初始化歌词信息
    function initMusicLyric(music){
         lyric=new Lyric(music.link_lrc);
          // 获取歌词容器
          var $lyricContainer=$(".song_lyric");
        // 创建之前清空界面上一首歌词信息
         $lyricContainer.html("");
        // 调用这个方法获取歌词
        lyric.loadLyric(function(){
            // 创建歌词列表
          $.each(lyric.lyrics,function(index,ele){
              var $item=$("<li>"+ele+"</li>");
              $lyricContainer.append($item);
          })

        });
    }

    //4:初始化进度条
    initProgress();
    function initProgress(){
    //获取歌曲进度条对象
    var $progressBar=$(".music_progress_bar");
    var $progressLine=$(".music_progress_line");    
    var $progressDot=$(".music_progress_dot");
    // 然后创建Progress对象
     progress=Progress($progressBar,$progressLine,$progressDot)
     progress.progressClick(function(value){
        player.musicSeekTo(value);
    });
    progress.processMove(function(value){
        player.musicSeekTo(value);
    });

     //获取音量进度条对象
     var $voiceBar=$(".music_voice_bar");
     var $voiceLine=$(".music_voice_line");    
     var $voiceDot=$(".music_voice_dot");
     // 然后创建Progress对象
      voiceProgress=Progress($voiceBar,$voiceLine,$voiceDot)
     voiceProgress.progressClick(function(value){
        player.musicVoiceSeekTo(value);
     });
     voiceProgress.processMove(function(value){
        player.musicVoiceSeekTo(value);
     });

    }   
    //5:初始化事件监听
    initEvents();  
    function initEvents(){
/*
注意:之前的显示/隐藏是静态编写的效果,但是之后歌曲信息是动态创建的,所以他们鼠标经过不会显示/隐藏.
动态创建的需要借助事件委托,委托的执行条件:在入口函数执行之前,就已经存在的元素content_list
hover()是mouseenter和mouseleave事件
delegate() 方法为指定的元素（属于被选元素的子元素）添加一个或多个事件处理程序，并规定当这些事件发生时运行的函数。
使用 delegate() 方法的事件处理程序适用于当前或未来的元素（比如由脚本创建的新元素）。
*/

     //5.1:监听歌曲栏鼠标的移入和移出
     $(".content_list").delegate(".list_music","mouseenter",function(){
        //显示子菜单
        $(this).find(".list_menu").stop().fadeIn(100);
        // //隐藏时长
        // $(this).find(".list_time span").hide();
        // //显示删除按钮
        // $(this).find(".list_time a").stop().fadeIn(5);
    })
    $(".content_list").delegate(".list_music","mouseleave",function(){
       //隐藏子菜单
       $(this).find(".list_menu").stop().fadeOut(100);
       //显示时长
       $(this).find(".list_time span").show();
       //隐藏删除按钮
       $(this).find(".list_time a").stop().fadeOut(5);
    })
    //5.2:监听复选框的点击事件
    $(".content_list").delegate(".list_check","click",function(){
        //点击复选框后切换它的一个list_checked类（显示/隐藏对勾）
        $(this).toggleClass("list_checked");
    });
    
    var $musicPlay=$(".music_play");//获取底部播放按钮
    //5.3:监听子菜单播放按钮list_menu_play，这里实现播放功能，歌曲信息切换功能
    $(".content_list").delegate(".list_menu_play", "click", function () {
        // 优化：代码，因为使用了很多 $(this).parents(".list_music")，所以在这里用变量存一下
        var $item= $(this).parents(".list_music");
        // 获取到点击的音乐索引和音乐信息，然后再player中播放
        // console.log($item.get(0).index);
        // console.log($item.get(0).music);
        // 5.3.1切换播放图标
        $(this).toggleClass("list_menu_play2");
        //5.3.2复原其他播放图标
        $item.siblings().find(".list_menu_play").removeClass("list_menu_play2");
        //5.3.3同步底部播放图标,同时文字高亮
        if($(this).attr("class").indexOf("list_menu_play2")!=-1){//判断当前点击的按钮的类是否包含这个类名
            //包含这个类则底部按钮同步添加:
            $musicPlay.addClass("music_play2");
            // 让这个歌曲的文字高亮
            $item.find("div").css("color","#fff");
            // 取消其他歌曲的文字高亮
            $item.siblings().find("div").css("color","rgba(255,255,255,0.5)");
        }else{
            //不包含则底部按钮同步移除:
            $musicPlay.removeClass("music_play2")
            // 让文字不高亮
            $item.find("div").css("color"," rgba(255,255,255,0.5)");
        }
        //5.3.4:点击播放使前面的序号变成播放动画
        $item.find(".list_number").toggleClass("list_number2");
        $item.siblings().find(".list_number").removeClass("list_number2");
        //5.3.5:点击播放实现播放功能
        player.playerMusic($item.get(0).index,$item.get(0).music);
        //5.3.6:实现歌曲信息的切换
        initMusicInfo($item.get(0).music);
        //5.3.7:实现歌词信息的切换
        initMusicLyric($item.get(0).music);
        
    })
      
    //5.4:监听底部播放
    $musicPlay.click(function(){
            //如果当前没有音乐播放，点击底部播放按钮默认播放第一首音乐,使用currentList判断有没有播放过音乐
            if(player.currtenIndex==-1){
                //触发第一首的播放事件,使用trigger() 方法触发被选元素的指定事件类型。
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            }else{
                //否则，表示已经播放过其他音乐，则底部按钮控制已经播放的音乐
                $(".list_music").eq(player.currtenIndex).find(".list_menu_play").trigger("click");
            }

        })
    
    //5.5.监听底部控制区域上一首按钮的点击
        $(".music_pre").click(function () {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        });

    //5.6监听底部控制区域下一首按钮的点击
        $(".music_next").click(function () {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });
   
    //5.7监听播放的进度(只有audio自己知道播放进度)
    player.musicTimeUpdate(function(duration,currentTime,timeStr){
        // 同步时间
         $(".music_progress_time").text(timeStr);
        //  同步进度条（先计算比例）,到进度条的封装中去设置
         var value=currentTime/duration*100;
         progress.setProgress(value); 
        //  实现歌词同步
        var index= lyric.currentIndex(currentTime);
        var $item= $(".song_lyric li").eq(index);
        $item.addClass("cur");
        $item.siblings().removeClass("cur");
        // 实现歌词滚动（ul滚,改变top）
        if(index<=2) return;
        $(".song_lyric").css({
            marginTop:(-index+2)*30
        });
        // 实现播放结束自动切换下一首播放
        if(currentTime==duration){
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        }
    })
    
    //5.8监听喜欢按钮的点击
    $(".musci_fav").click(function(){
        $(".musci_fav").toggleClass("musci_fav2");
    })
    // 5.9:实现声音点击切换的功能
    $(".music_voice_icon").click(function(){
        // 图标切换
        $(this).toggleClass("music_voice_icon2");
        // 实现声音的禁止/播放
        if($(this).attr("class").indexOf("music_voice_icon2") !=-1){//有这个类则会不等于 -1,满足这个条件
            // 有这个类则变为静音状态
            player.musicVoiceSeekTo(0);//设为0则静音
        }else{
            // 没有这个类上面的条件值会是-1,变为有声音状态
            player.musicVoiceSeekTo(1);//设为1则声音最大
           
        }

    })
    }
    // 定义一个方法动态创建一条音乐
        function createMusicItem(index,music){
            var $item=$(`             
             <li class="list_music">
            <div class="list_check"><i></i></div>
            <div class="list_number">`+(index + 1)+`</div>
            <div class="list_name">
              `+music.name+`
              <div class="list_menu">
                <a href="javascript:;" title="播放" class='list_menu_play'></a>  
              </div>
            </div>
            <div class="list_singer">`+music.singer+`</div>
            <div class="list_time">
              <span>`+music.time+`</span>
            </div>
         `);
        //  把创建的信息绑定到原生的li上
         $item.get(0).index=index;
         $item.get(0).music=music;
         return $item;
        }

});