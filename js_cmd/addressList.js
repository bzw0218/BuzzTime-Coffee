/**
 * Created by Administrator on 2016/10/24 0024.
 */
define(function (require, exports, module) {
    var $ = require("lib_cmd/zepto.js"),
        myDialog = require("lib_cmd/myDialog.js"),
        iTemplate = require("lib_cmd/iTemplate.js"),
        historyEvent = require("lib_cmd/historyEvent.js"),
        iScroll = require("lib_cmd/iScroll.js"),
        $eles = null, eles = null;

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

    function GetQueryString(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }

    window.clear = function(){
        setCookie("last_locaton","");
    }

    function slidePage(wrap){
        this.show=function(){
            wrap.addClass("on");
        };
        this.hide=function(){
            wrap.removeClass("on")
        }
    }

    $(function () {
        $eles = {
            addressList:$("#addressList"),
            addAddress:$("#addAddress"),
            addressPage:$("#addressPage"),
            name:$("#name"),
            addressId:$("#addressId"),
            sex1:$("#sex1"),
            sex2:$("#sex2"),
            telephone:$("#telephone"),
            city:$("#city"),
            address:$("#address"),
            addressShow:$("#addressShow"),
            latitude:$("#latitude"),
            longitude:$("#longitude"),
            houseNumber:$("#houseNumber"),
            tag1:$("#tag1"),
            tag2:$("#tag2"),
            submitBtn:$("#submitBtn"),
            toSearchPage:$("#toSearchPage"),
            searchPage:$("#searchPage"),
            currLocation:$("#currLocation"),
            search:$("#search"),
            searchBtn:$("#searchBtn"),
            resultList:$("#resultList"),
            addressForm:$("#addressForm")
        };

        eles = function () {
            function Ele() {

                var addressList=[];
                var currLocation=null;
                var resultList=null;


                Object.defineProperties(this, {
                    addressList:{
                        get:function(){
                            return addressList;
                        },
                        set:function(v){
                            if(!v){
                                eles.addressPage.show();
                                historyEvent.push({
                                    title:"新增收货地址",
                                    url:"#addAddress"
                                },function(){
                                    eles.addressPage.hide();
                                })
                            }else{
                                addressList=v;
                                eles.makeAddressList(v);
                            }
                        }
                    },
                    editAddress:{
                        set:function(index){
                            var address=addressList[index];
                            $eles.name.val(address.name);
                            $eles.addressId.val(address.id);
                            $eles["sex"+(address.sex=="先生"?1:2)].prop("checked",true);
                            $eles.telephone.val(address.telephone);
                            $eles.address.val(address.address);
                            $eles.addressShow.html(address.address);
                            $eles.latitude.val(address.latitude);
                            $eles.longitude.val(address.longitude);
                            $eles.houseNumber.val(address.houseNumber);
                            $eles["tag"+(address.label=="家"?1:2)].prop("checked",true);

                            eles.addressPage.show();
                            historyEvent.push({
                                title:"编辑收货地址",
                                url:"#addAddress"
                            },function(){
                                eles.addressPage.hide();
                            })
                        }
                    },
                    resultList:{
                        set:function(v){
                            resultList=v;console.log(v)
                            var tpl='<li data-index="{index}">\
                                        <div class="result_item border">\
                                            <h3>{name}</h3>\
                                            <p>{address}</p>\
                                        </div>\
                                    </li>',
                                html="";

                            html=iTemplate.makeList(tpl,resultList,function(index,v){
                                return {
                                    index:index,
                                    name: v.name,
                                    address: v.address|| v.addr||""
                                }
                            });

                            $eles.resultList.html(html);
                            setTimeout(function(){
                                eles.searchIScroll.refresh();
                            },200);
                        }
                    },
                    currLocation:{
                        get:function(){return currLocation;},
                        set:function(address){
                            currLocation=address;
                            $eles.currLocation.html(address.address);
                            /*$eles.address.val(address.address);
                            $eles.addressShow.html(address.address);
                            $eles.latitude.val(address.latitude);
                            $eles.longitude.val(address.longitude);*/
                        }
                    }
                });

                this.makeAddressList=function(addressList){
                    var tpl='<li class="address_item border">\
                                <a data-index="{index}">\
                                    <h3>{name}&nbsp;{sex}&nbsp;&nbsp;{telephone}</h3>\
                                    <p><label class="tag">{label}</label>{address}{houseNumber}</p>\
                                </a>\
                                <i class="icon icon_edit" data-index="{index}"></i>\
                            </li>',
                        html="";
                    html=iTemplate.makeList(tpl,addressList,function(index,v){
                        v.url=[APP.urls.shopListUrl,"?addressId=", v.id].join("");
                        v.index=index;console.log(v)
                        return v;
                    });

                    $eles.addressList.html(html);

                }

                this.selectAddress=function(index){
                    var address=addressList[index];
                    setCookie("last_locaton",JSON.stringify(address));

                    if(APP.isFromOrder){

                        history.go(-1);
                        return ;
                    }

                    window.location.href=APP.urls.shopListUrl;
                }

                this.addressPage=new slidePage($eles.addressPage);

                this.addAddress=function(){
                    $eles.name.val("");
                    $eles.addressId.val("");
                    //$eles["sex"+(address.sex=="先生"?1:2)].prop("checked",true);
                    $eles.sex1.prop("checked",false);
                    $eles.sex2.prop("checked",false);
                    $eles.telephone.val("");
                    $eles.address.val("");
                    $eles.addressShow.html("小区");
                    $eles.latitude.val("");
                    $eles.longitude.val("");
                    $eles.houseNumber.val("");
                    //$eles["tag"+(address.sex=="label"?1:2)].prop("checked",true);
                    $eles.tag1.prop("checked",false);
                    $eles.tag2.prop("checked",false);

                    eles.addressPage.show();
                    historyEvent.push({
                        title:"新增收货地址",
                        url:"#addAddress"
                    },function(){
                        eles.addressPage.hide();
                    })
                }

                this.searchPage=new slidePage($eles.searchPage);
                this.searchIScroll=new iScroll("scrollCon");

                this.searchPageInit=function(){
                    if(!currLocation){
                        getCurrLocation();
                    }
                }

                this.selectResult=function(index){
                    var address=resultList[index];

                    $eles.address.val(address.address);
                    $eles.addressShow.html(address.address||"&nbsp;");
                    $eles.latitude.val(address.location.lat);
                    $eles.longitude.val(address.location.lng);

                }

                this.selectCurrLocation=function(){
                    $eles.address.val(currLocation.address);
                    $eles.addressShow.html(currLocation.address);
                    $eles.latitude.val(currLocation.latitude);
                    $eles.longitude.val(currLocation.longitude);

                    window.history.go(-1);
                }

                this.addressSubmit=function(){
                    var obj={};
                    obj.name=$eles.name.val();
                    obj.id=$eles.addressId.val();
                    if($eles.sex1.prop("checked")){
                        obj.sex=$eles.sex1.val();
                    }else if($eles.sex2.prop("checked")){
                        obj.sex=$eles.sex2.val();
                    }
                    obj.telephone=$eles.telephone.val();
                    obj.addres=$eles.address.val();
                    obj.latitude=$eles.latitude.val();
                    obj.longitude=$eles.longitude.val();
                    obj.houseNumber=$eles.houseNumber.val();
                    if($eles.tag1.prop("checked")){
                        obj.label=$eles.tag1.val();
                    }else if($eles.tag2.prop("checked")){
                        obj.label=$eles.tag2.val();
                    }

                    if(!obj.name){
                        alert("请填写联系人姓名");
                        return null;
                    }
                    if(!obj.sex){
                        alert("请选择称谓");
                        return null;
                    }
                    if(!obj.telephone){
                        alert("请填写联系电话");
                        return null;
                    }
                    if(!obj.addres){
                        alert("请选择地址");
                        return null;
                    }
                    if(!obj.houseNumber){
                        alert("请输入详细地址");
                        return null;
                    }

                    var _l=window.loading();

                    $.ajax({
                        url:APP.urls.submitAddress,
                        type:"POST",
                        dataType:"json",
                        data:obj,
                        success:function(res){
                            _l.destroy();
                            var data=res.Data;
                            if(res.Status!==0){
                                tip('添加地址失败，请稍后再试。', { classes: "otip", t: 2000 });
                                return null
                            }
                            window.history.go(-1);
                            eles.addressList=data;
                        }
                    })

                }




            };

            return new Ele();
        }();

        _initPage();
    })

    function _initPage() {

        var _l=window.loading();

        APP.isFromOrder=GetQueryString("isFromOrder");

        $.ajax({
            url:APP.urls.getAddressList,
            type:"POST",
            dataType:"json",
            data:{},
            success:function(res){
                _l.destroy();
                if(res.Status==0){
                    eles.addressList=res.Data;
                }
            },
            error:function(){
                _l.destroy();
                alert("网络异常，请重试！");
            }

        })

        initEvent();
        function initEvent(){

            $eles.addressList.on("click","a",function(){
                var self=$(this),
                    index=self.attr("data-index");
                eles.selectAddress(index);
            })

            $eles.addressList.on("click",".icon_edit",function(){
                var self=$(this),
                    index=self.attr("data-index");
                eles.editAddress=index;
                return false;
            })

            $eles.addAddress.on("click",function(){
                eles.addAddress();
            })

            $eles.toSearchPage.on("click",function(){
                eles.searchPage.show();
                historyEvent.push({
                    title:"搜索地址",
                    url:"#search"
                },function(){
                    eles.searchPage.hide();
                })

                eles.searchPageInit();
            })

            $eles.searchBtn.on("click",function(){
                getResult();
            });

            $eles.search.on("input",function(){
                var self=$(this),
                    v=self.val();

                if(v){
                    getResult();
                }

            })

            $eles.resultList.on("click","li",function(){
                var self=$(this),
                    index=self.attr("data-index");
                eles.selectResult(index);
                history.go(-1);
            })

            $eles.currLocation.on("click",function(){
                eles.selectCurrLocation();
            })

            $eles.submitBtn.on("click",function(){
                eles.addressSubmit();
            })
        }

        //初始化浏览记录对象
        historyEvent.init();
    }

    function getResult(){
        var v=$eles.search.val();
        //var _l=window.loading();
        var url="http://api.map.baidu.com/place/v2/search?query="+v+"&page_size=20&page_num=0&scope=1&region=%E4%B8%8A%E6%B5%B7&output=json&ak=rMaOcUnbX2a63hgKiceE4ESWgeu0qAG5&callback=BMap.setResult";
        load_script(url);

        BMap.setResult=function(res){
            //_l.destroy();
            if(!res.status==0){
                tip('获取定位失败，请稍后再试。', { classes: "otip", t: 2000 });
                return null
            }
            eles.resultList=res.results;
        }


    }

    function load_script(xyUrl, callback){
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = xyUrl;
        //借鉴了jQuery的script跨域方法
        script.onload = script.onreadystatechange = function(){
            if((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){
                callback && callback();
                // Handle memory leak in IE
                script.onload = script.onreadystatechange = null;
                if ( head && script.parentNode ) {
                    head.removeChild( script );
                }
            }
        };
        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
        head.insertBefore( script, head.firstChild );
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
                                    address:result.formatted_address,
                                    latitude:result.location.lat,
                                    longitude:result.location.lng
                                };

                            eles.currLocation=location;


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