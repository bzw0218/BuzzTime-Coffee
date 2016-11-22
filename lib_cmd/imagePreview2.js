define(function(require, exports, module){
	//(function(){
		var imgsObj = {}, groupObj = {} , groupId = 1000, et = null;
		$('*[data-widget="img_prev_view"]').each(function(idx, dw){
			groupObj = {};
			groupId += 1;
			imgsObj[groupId] = [];
			(function(groupId){
				$(dw).on("click", function(evt){
					et = evt.target;
					if("IMG" == et.tagName){
						
						if("A" ==et.parentNode.tagName && et.parentNode.href != ""){
						  //location.href=et.parentNode.href;
						  return true;					
					    }else{						  
							if(typeof window.WeixinJSBridge != 'undefined') {
								imgsObj[groupId].length&&WeixinJSBridge.invoke('imagePreview',{ 'current':et.src, 'urls':imgsObj[groupId]} );   
							}else{
								alert("请使用微信预览");
							}
						}
					}
				}).find("img").each(function(jdx, v){
					groupObj[v.src] = v.src;
				});
				//数组去重复
				imgsObj[groupId] = Object.keys(groupObj);
			})(groupId);
		});
	//})();
	console.log(imgsObj);
});