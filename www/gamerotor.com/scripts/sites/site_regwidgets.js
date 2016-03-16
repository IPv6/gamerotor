var regwidgets = {};
window.regwidgets = regwidgets;

regwidgets.showScreenshotsLure = function(overloads){
	overloads = core_coalesce(overloads,{});
	var id_viewport_superroot = core_coalesce(overloads.id_viewport_superroot,'viewport-superroot');
	var post_title = overloads.post_title;
	var post_text = overloads.post_text;
	var slides = overloads.slides;
	
	head.js("/css/box-slider.css","/css/shadowbox.css");
	head.js("http://static.gamerotor.com/scripts/sites/jquery/jquery.box-slider.js"
		,"http://static.gamerotor.com/scripts/sites/jquery/jquery.box-slider-fx-fade.js"
		,"http://static.gamerotor.com/scripts/sites/jquery/shadowbox.js",function(){
		head.ready(function () {
			$('#'+id_viewport_superroot).css('z-index',window.CONST_ZINDEX_LOGIN+100);
			
			var viewport_content = '<div style="position:relative; left: -50%;">';
			if(slides != null){
				viewport_content += '<div id="dg-viewport" class="box-slider-viewport"><div id="dg-content-box" class="box-slider-wrapper">';
				for(var i=0;i<slides.length;i++){
					viewport_content+='<figure class="box-slider-slide"><a href="'+slides[i][0]+'" rel="shadowbox" class="box-slider-slide"><img src="'+slides[i][1]+'" alt="Screenshot"></a></figure>';
				}
				viewport_content +='</div></div><br><nav id="dg-controls-viewport" class="box-slider-controls-viewport"><ul class="box-slider-controls">';
				for(var i=0;i<slides.length;i++){
					viewport_content+='<li><div class="goto-slide '+(i==0?'current':'')+'" href="#" data-slideindex="'+i+'"></div></li>';
				}
				viewport_content +='</ul></nav>';
			}
			viewport_content +='<h1 id="dg-post-title"></h1><div id="dg-post-text"></div>';
			viewport_content +='</div>';
			$('#'+id_viewport_superroot).html(viewport_content);
			$('#'+id_viewport_superroot).show();
			if(slides != null){
				$indicators = $('.goto-slide');
				$box = $('#dg-content-box');
				if($box){
					$box.boxSlider({
						autoScroll: true
						, effect: "fade"
						, timeout: 3000
						, speed: 800
						, onbefore:  function ($c, $n, currIndex, nextIndex) {
						  // Highlights the next slide pagination control
						  $indicators.removeClass('current').eq(nextIndex).addClass('current');
						}});
				};
				$('.box-slider-controls').on('click', '.goto-slide', function (ev) {
				  $box.boxSlider('showSlide', $(this).data('slideindex'));
				  ev.preventDefault();
				});
			}
			Shadowbox.init();
			if(post_title != null){
				$('#dg-post-title').html(post_title);
			}
			if(post_text != null){
				$('#dg-post-text').html(post_text);
			}
		});
	});
}

regwidgets.showNoDownloadLure = function(overloads){
	overloads = core_coalesce(overloads,{});
	var id_toptext = core_coalesce(overloads.id_toptext,'dg-toptext');
	$('#'+id_toptext).css('z-index',window.CONST_ZINDEX_LOGIN+100);
	var post_title = overloads.post_title;
	var post_text = overloads.post_text;
	var post_lure = overloads.post_lure;
	if(post_lure == null){
		post_lure = $._b('Play for free');
	}
	if(post_title != null){
		$('#'+id_toptext+"-title").html(post_title);
	}
	if(post_text != null){
		$('#'+id_toptext+"-text").html(post_text);
	}
	$('#'+id_toptext+"-lure").html(post_lure);
	$('#'+id_toptext).show();
}

regwidgets.showBonusLure = function(overloads){
	overloads = core_coalesce(overloads,{});
	var id_db_main = core_coalesce(overloads.id_dailybonus,'daily-bonus');
	var id_db_main_h = core_coalesce(overloads.id_dailybonus_h,id_db_main+'-h');
	var id_db_main_t = core_coalesce(overloads.id_dailybonus_h,id_db_main+'-t');
	regwidgets.StT = function(s) {
		sec_numb    = parseInt(s);
		var hours   = Math.floor(sec_numb / 3600);
		var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
		var seconds = sec_numb - (hours * 3600) - (minutes * 60);

		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		var time = hours+':'+minutes+':'+seconds;
		return time;
	}
	regwidgets.Tmr = function(){
		regwidgets.count--;
		$('#'+id_db_main_t).html($._b("Get regitration bonus till")+" "+regwidgets.StT(regwidgets.count));
		if (regwidgets.count == 0) {
			clearInterval(regwidgets.countdown);
			$('#'+id_db_main).hide();
		}
	}
	var dt_now = new Date();
	var dt_end = new Date();
	dt_end.setHours(23,59,59,999);
	regwidgets.count = parseInt(dt_end.getTime()/1000) - parseInt(dt_now.getTime()/1000);
	regwidgets.countdown = 0;
	$('#'+id_db_main_h).html($._b("Get regitration bonus now"));
	$('#'+id_db_main).css('z-index',window.CONST_ZINDEX_LOGIN+100);
	regwidgets.Tmr();
	regwidgets.countdown = setInterval(regwidgets.Tmr, 1000);
	$('#'+id_db_main).show();
}

regwidgets.cycleImagesInDiv = function(overloads){
	var divid = overloads.id_div;
	var $active = $('#'+divid+' .active');
	var $next = ($('#'+divid+' .active').next().length > 0) ? $('#'+divid+' .active').next() : $('#'+divid+' img:first');
	$next.css('z-index',2);//move the next image up the pile
	$active.fadeOut(1500,function(){//fade out the top image
		$active.css('z-index',1).show().removeClass('active');//reset the z-index and unhide the image
		$next.css('z-index',3).addClass('active');//make the next image the top one
	});
	if(regwidgets.cycleImagesInDiv_onloadinited != 1){
		regwidgets.cycleImagesInDiv_onloadinited = 1;
		//$('#'+divid).load(function(){
		//		$('#'+divid).fadeIn(1500);//fade the background back in once all the images are loaded
		// run every 7s
		setInterval(function(){regwidgets.cycleImagesInDiv(overloads)}, 7000);
		$('#'+divid).show();
		//})
	}
}