
define(function(require, exports, module){

    $.fn.picLazyLoad = function(settings){
        var $this = $(this),          
		    _winScrollTop = $(window).scrollTop(),	  		
            _winHeight = $(window).height();
			
			setTimeout(function(){
			  _winScrollTop = pageYOffset;
			   lazyLoadPic();			 
			},100)
		
 
        settings = $.extend({
            threshold: 0, // 提前高度加载
            placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII='
        }, settings||{});

        // 执行懒加载图片
       

        // 滚动触发换图
        $(window).on('scroll',function(){
            _winScrollTop = $(window).scrollTop();
            lazyLoadPic();
			// alert(_winScrollTop)
        });

        // 懒加载图片
        function lazyLoadPic(){
            $this.each(function(){
                var $self = $(this);                
				  if($self.attr('data-original')){
					  // 默认占位图片
					  if($self.css('background-image') == 'none'){
						  $self.css('background-image','url('+settings.placeholder+')');
					  }
					  var _offsetTop = $self.offset().top;
					  if((_offsetTop - settings.threshold) <= (_winHeight + _winScrollTop)){
						  $self.css('background-image','url('+$self.attr('data-original')+')');
						  $self.removeAttr('data-original');
					  }
				  }               
            });
        }
    }
   module.exports = $.fn.picLazyLoad;

});