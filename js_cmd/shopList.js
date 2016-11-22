/**
 * Created by Administrator on 2016/10/20 0020.
 */
define(function (require, exports, module) {
    var $ = require("lib_cmd/zepto.js"),
        myDialog = require("lib_cmd/myDialog.js"),
        iTemplate = require("lib_cmd/iTemplate.js"),
        historyEvent = require("lib_cmd/historyEvent.js"),
        iScroll = require("lib_cmd/iScroll.js"),
        $eles = null, eles = null;console.log(historyEvent)

    //设置cookies
    window.setCookie = function setCookie(name,value)
    {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        document.cookie = name + "="+ encodeURIComponent(value) + ";expires=" + exp.toGMTString();
    }

    //读取cookies
    window.getCookie = function getCookie(name)
    {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

        if(arr=document.cookie.match(reg))

            return decodeURIComponent((arr[2]));
        else
            return null;
    }

    window.clear = function(){
        setCookie("last_locaton","");
    }

    function searchPage(wrap){
        this.show=function(){
            wrap.addClass("on");
        };
        this.hide=function(){
            wrap.removeClass("on")
        }
    }

    $(function () {
        $eles = {
            currPosi:$("#currPosi"),
            shopList:$("#shopList"),
            locationSelect:$("#locationSelect"),
            goodsList:$("#goodsList"),
            tabs:$("#tabs")
        };

        eles = function () {
            function Ele() {
                var currPosi={},
                    shopList=[],
                    resultList=[];

                this.deliveryType=0;

                Object.defineProperties(this, {
                    currPosi:{
                        get:function(){return currPosi;},
                        set:function(posi){
                            currPosi=posi;console.log(currPosi)
                            $eles.currPosi.html(currPosi.address);
                            eles.getShopList();
                        }
                    },
                    shopList:{
                        set:function(v){
                            var html="",
                                tpl='<li class="shop_item border" data-shopId="{id}" data-fee="{serverFee}">\
                                    <div class="wrap_img"><img style="background-image: url({imgUrl});"></div>\
                                <div class="wrap_info">\
                                <div class="title">\
                                <h2 class="text_ellipsis">{name}</h2>\
                            <p>{address}</p>\
                            </div>\
                            <div class="location"><span class="distence">{distence}</span><span class="to_the_shop">'+(this.deliveryType==0?"外卖":"到店自取")+'</span></div>\
                                </div>\
                                </li>';

                            shopList=v;console.log(shopList)

                            html+=iTemplate.makeList(tpl,shopList);

                            $eles.shopList.html(html);
                        }
                    }
                });

                this.getShopList=function(){
                    var url="";
                    if(this.deliveryType==0){
                        url=APP.urls.getShopList;
                    }else {
                        url=APP.urls.GetShopListContainOutRange;
                    }
                    $.ajax({
                        url:url,
                        type:"POST",
                        data:currPosi,
                        dataType:"json",
                        success:function(res){

                            if(!res.Status==0){
                                tip(res.Message, { classes: "otip", t: 2000 });
                                return "";
                            }
                            eles.shopList=res.Data;
                        },
                        error:function(){
                            alert("Ajax error!")
                        }
                    })
                };

            };

            return new Ele();
        }();

        _initPage();
    })

    function _initPage() {
        var location=getCookie("last_locaton");

        if(!location){
            getLastAddress();
            //getCurrLocation();
        }else{
            eles.currPosi=JSON.parse(location);
        }

        initEvent();
        function initEvent(){
            /*$eles.locationSelect.on("click",function(){

            });*/

            $eles.shopList.on("click",".shop_item",function(){
                var self=$(this),
                    shopId=self.attr("data-shopId"),
                    serverFee=self.attr("data-fee");
                window.location.href=[APP.urls.goodsDetailUrl,"?","shopId=",shopId,"&serverFee=",serverFee,"&type=",eles.deliveryType].join("");
            })

            $eles.tabs.on("click","li",function(){
                var self=$(this),
                    type=self.attr("data-type")-0;
                if(self.hasClass("on")){
                    return "";
                }
                $eles.tabs.find(".on").removeClass("on");
                self.addClass("on");
                eles.deliveryType=type;
                eles.getShopList();

            })

            /*$eles.shopList.on("click",".to_the_shop",function(){
                var self=$(this),
                    shopId=self.attr("data-shopId"),
                    serverFee=self.attr("data-fee"),
                    infoStr="";
                infoStr=["shopId=",shopId,"&serverFee=",serverFee,"&type=",eles.deviveryType].join("");
                window.location.href=[APP.urls.goodsDetailUrl,"?",encodeURIComponent(infoStr)].join("");
            })*/

        }

        //初始化浏览记录对象
        historyEvent.init();
    }

    function getLastAddress(){
        var _l=window.loading();
        $.ajax({
            url:APP.urls.getLastAddress,
            type:"POST",
            dataType:"json",
            success:function(res){
                _l.destroy();
                var data=res.Data;
                if(res.Status==0&&data){
                    eles.currPosi=data;
                    setCookie("last_locaton",JSON.stringify(data));
                }else{
                    getCurrLocation();
                }
            },
            error:function(){
                _l.destroy();
                getCurrLocation();
            }
        })
    }

    function getCurrLocation(){
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                lat = r.point.lat;
                lng = r.point.lng;
                if (lat && lng) {
                    /*获取到手机location地址*/
                    $.ajax({
                        type: "POST",
                        //http://api.map.baidu.com/place/v2/search?query=%E5%92%96%E5%95%A1&page_size=10&page_num=0&scope=1&region=%E4%B8%8A%E6%B5%B7&output=json&ak=rMaOcUnbX2a63hgKiceE4ESWgeu0qAG5
                        url: "https://api.map.baidu.com/geocoder/v2/?ak=rMaOcUnbX2a63hgKiceE4ESWgeu0qAG5&location=" + lat + "," + lng + "&output=json&pois=1",
                        data: {},
                        async: true,
                        success: function (res) {
                            if(res.status!==0){
                                tip('获取定位失败，请手动定位。', { classes: "otip", t: 2000 });
                                return false;
                            }
                            var result=res.result,
                                location={
                                    id:"",
                                    address:result.formatted_address,
                                    city:result.addressComponent.city,
                                    district:result.addressComponent.district,
                                    latitude:result.location.lat,
                                    longitude:result.location.lng
                                };
                            setCookie("last_locaton",JSON.stringify(location));
                            eles.currPosi=location;console.log(result);

                        },
                        dataType: "jsonp"
                    });
                } else {
                    alert("获取定位失败");
                }
            }
        })
    }

})