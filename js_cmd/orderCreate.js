/**
 * Created by Administrator on 2016/11/7 0007.
 */
define(function(require,exports,module){
    var $ = require("lib_cmd/zepto.js"),
        myDialog = require("lib_cmd/myDialog.js"),
        iTemplate = require("lib_cmd/iTemplate.js"),
        historyEvent = require("lib_cmd/historyEvent.js"),
        iScroll = require("lib_cmd/iScroll.js"),
        $eles = null, eles = null;

    function slidePage(wrap){
        this.show=function(){
            wrap.addClass("on");
        };
        this.hide=function(){
            wrap.removeClass("on")
        }
    }

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


    $(function(){
        $eles={
            addrShow:$("#addrShow"),
            deliverTime:$("#deliverTime"),
            deliverTimeShow:$("#deliverTimeShow"),
            couponUse:$("#couponUse"),
            couponUseShow:$("#couponUseShow"),
            serverFee:$("#serverFee"),
            minusFee:$("#minusFee"),
            remark:$("#remark"),
            payMoney:$("#payMoney"),
            minusMoney:$("#minusMoney"),
            payBtn:$("#payBtn"),
            goodsList:$("#goodsList"),
            timeSelect:$("#timeSelect"),
            couponSelect:$("#couponSelect"),
            couponList:$("#couponList"),
            timeTabs:$("#timeTabs"),
            timeListCon:$("#timeListCon")
        };
        eles=(function(){
            function Ele(){
                var self=this,
                    address=null,
                    goodsList=null,
                    resId=null,
                    serverFee=null,
                    deliveryType=null,
                    payMoney= 0,
                    couponList=null,
                    currCoupon=null,
                    deliveryMinTime= 0,
                    deliveryMaxTime= 0;

                this.info=null;

                this.needCheckTel=false;

                Object.defineProperties(this,{
                    address:{
                        get:function(){return address;},
                        set:function(v){
                            address=v;
                            var html='<h3>'+(address.name||" ")+(address.sex||" ") +(address.telephone||" ")+'</h3>\
                                        <p><label class="tag">'+(address.label||"")+'</label>'+(address.address||"")+(address.houseNumber||"")+'</p>';

                            $eles.addrShow.html(html);
                        }
                    },
                    goodsList:{
                        get:function(){return goodsList},
                        set:function(v){
                            goodsList=v;
                            var tpl='<li><div>{chineseName}{otherStr}</div><div><span>X{num}</span><span>¥{total}</span></div></li>',
                                html="";
                            html=iTemplate.makeList(tpl,goodsList,function(index,v){
                                var otherStr=[],
                                    skuList= v.skuList;

                                [].forEach.call(skuList,function(skuItem,index){
                                    otherStr.push(skuItem.chineseName);
                                })

                                if(otherStr.length>0){
                                    otherStr=["(",otherStr.join(","),")"].join("");
                                }

                                v.otherStr=otherStr;

                                return v;
                            });
                            $eles.goodsList.html(html);
                        }
                    },
                    couponUse:{
                        set:function(v){
                            for(var i=0;i<couponList.length;i++){
                                if(couponList[i].id==v){
                                    self.currCoupon=couponList[i];
                                    return ""
                                }
                            }
                        }
                    },
                    currCoupon:{
                        get:function(){
                            return currCoupon;
                        },
                        set:function(v){
                            currCoupon=v;
                            $eles.couponUseShow.html(v.couponName);
                            var   minusMoney=0;
                            if(v.preferentialType==1){
                                minusMoney=currCoupon.preferential.toFixed(2)-0;
                            }else if(v.preferentialType==2){console.log(payMoney)
                                minusMoney=((1-(currCoupon.preferential/10))*payMoney).toFixed(2)-0;
                            }
                            $eles.minusFee.html("-¥"+(minusMoney-0).toFixed(2));
                            $eles.payMoney.html("¥"+(payMoney-minusMoney+serverFee).toFixed(2));
                            $eles.minusMoney.html("¥"+minusMoney.toFixed(2))
                        }
                    },
                    currTime:{
                        set:function(obj){console.log(obj)
                            //todo
                            deliveryMinTime=obj.sTime;
                            deliveryMaxTime=obj.eTime;

                            var str="";

                            str+=$eles.timeTabs.find(".on").html()+" ";
                            str+=obj.timeStr;

                            $eles.deliverTimeShow.html(str);
                        }
                    }
                })

                this.getAddress=function(){
                    var address=getCookie("last_locaton");
                    if(!address){
                        return null
                    }
                    address=JSON.parse(address);
                    self.address=address;
                }

                this.setInfo=function(info){console.log(info);
                    resId=info.resId;
                    serverFee=info.serverFee-0;
                    deliveryType=info.deliveryType;
                    self.goodsList=info.shopCart.commodity;

                    $eles.serverFee.html(serverFee);

                    payMoney=parseFloat(info.shopCart.total-0);

                    $eles.payMoney.html((payMoney-0+serverFee-0).toFixed(2));

                }

                this.timeSelect=new slidePage($eles.timeSelect);

                this.couponSelect=new slidePage($eles.couponSelect);

                this.timeScroller=new iScroll($eles.timeListCon[0]);

                this.getDeliveryTime=function(){
                    var now=Date.now(),
                        today=parseInt(now/86400000)*86400000-8*60*60*1000,
                        nowTime=now-today,
                        fromTime=9*60*60*1000,
                        endTime=18*60*60*1000,
                        todayFrom= 0,
                        todayEnd= 0,
                        fstDay=today,
                        sedDay=today +24*60*60*1000,
                        thrDay=sedDay +24*60*60*1000
                        fstArr=[],
                        sedArr=[],
                        thrArr=[];

                    if(nowTime<endTime &&(new Date(fstDay)).getDay()!==0&&(new Date(fstDay)).getDay()!==6 ){
                        if(nowTime<fromTime){
                            todayFrom=fromTime;
                            todayEnd=endTime;
                        }else if(nowTime<endTime){
                            todayFrom=parseInt(nowTime/(60*60*1000))*60*60*1000;

                            if(nowTime%(60*60*1000)>30*60*1000){
                                todayFrom+=60*60*1000;
                            }else{
                                todayFrom+=30*60*1000;
                            }

                            todayEnd=endTime;
                        }

                        fstArr=this.getTimeList(fstDay,todayFrom,todayEnd);
                    }

                    if((new Date(sedDay)).getDay()!==0&&(new Date(sedDay)).getDay()!==6){
                        sedArr=this.getTimeList(sedDay,fromTime,endTime);
                    }

                    if((new Date(thrDay)).getDay()!==0&&(new Date(thrDay)).getDay()!==6){
                        thrArr=this.getTimeList(thrDay,fromTime,endTime);
                    }

                    return [fstArr,sedArr,thrArr];

                }

                this.getTimeList=function(base,sTime,eTime){
                    var time= sTime,
                        timeList=[],
                        time1= 0,
                        time2= 0;

                    while (time<eTime){
                        time1=base+time;
                        time2=base+time+30*60*1000;
                        timeList.push(this.formatTimeObj({
                            sTime:time1,
                            eTime:time2
                        }))
                        time+=30*60*1000;
                    }
                    return timeList;
                }

                this.formatTimeObj=function(obj){
                    var time1=obj.sTime,
                        time2=obj.eTime,
                        timeStr1=this.getTimeStr(time1),
                        timeStr2=this.getTimeStr(time2);
                    obj.timeStr= [timeStr1,timeStr2].join("-");

                    return obj;
                }

                this.getTimeStr=function(time){
                    var h= (new Date(time)).getHours(),
                        m=(new Date(time)).getMinutes();
                    h=h<10?"0"+h:h;
                    m=m<10?"0"+m:m;

                    return [h,m].join(":");
                }

                this.getCoupons=function(){

                    var postObj={};

                    postObj.resId=resId;
                    postObj.addrssId=address.id;
                    postObj.deliveryType=deliveryType;
                    postObj.serverFee=serverFee;
                    postObj.commodity=[];
                    postObj.couponId=(currCoupon&&currCoupon.id)||"";

                    postObj.remark=$eles.remark.val();

                    postObj.deliveryMinTime=deliveryMinTime;
                    postObj.deliveryMaxTime=deliveryMaxTime;

                    [].forEach.call(goodsList,function(value,index){
                        var item={};
                        item.commodityId=value.id;
                        item.quantity=value.num;
                        item.skuList=[];
                        for(var i=0;i<value.skuList.length;i++){
                            item.skuList.push(value.skuList[i].id);
                        }
                        postObj.commodity.push(item);
                    })
                    $.ajax({
                        url:APP.urls.getCoupons,
                        type:"POST",
                        dataType:"json",
                        data:{orderInfo:JSON.stringify(postObj)},
                        success:function(res){
                            var data=res.Data,
                                tpl='<li>\
                                        <label>\
                                            <input type="radio" class="hidden" name="coupon" value="{id}">\
                                            <i class="icon icon_circle"></i><span>{couponName}</span>\
                                        </label>\
                                    </li>',
                                html="";
                            if(!res.Status==0){
                                tip(res.Message, { classes: "otip", t: 2000 });
                                return "";
                            }
                            if(!data){
                                return "";
                            }
                            couponList=data;
                            html=iTemplate.makeList(tpl,data)

                            $eles.couponList.html(html);

                        }
                    });
                }

                this.codeDialog=null;

                this.submitCode=function(){
                    var input=$("#code"),
                        val=input.val();

                    $.ajax({
                        url:APP.urls.CheckCode,
                        data:{"code":val},
                        type:"POST",
                        dataType:"json",
                        success:function(res){
                            if(res.Status==0&&res.Data){
                                eles.needCheckTel=false;
                                eles.submit();
                                self.codeDialog.destroy();
                            }else{
                                $('#codeTip').html(res.Message);
                            }
                        }
                    })
                }

                this.getCode=function(){
                    var telePhone=$("#telPhone").val();

                    if($("#getCode").prop("loading")){
                        $('#codeTip').html('请稍后再试');
                        return "";
                    }else{
                        $("#getCode").prop("loading",true);
                    }

                    if(!telePhone){
                        $('#codeTip').html('手机号不能为空');
                    }

                    $.ajax({
                        url:APP.urls.CreateCode,
                        data:{"phoneNumber":address.telephone},
                        type:"POST",
                        dataType:"json",
                        success:function(res){

                            $eles.payBtn.prop("isLoading",false);

                            if(res.Status!==0){
                                tip(res.Message, { classes: "otip", t: 2000 });
                                return ""
                            }
                            if(!res.Data){
                                tip("创建验证码失败", { classes: "otip", t: 2000 });
                                return ""
                            }

                            var time=60,timer=null;
                            timer=setInterval(function(){

                                $("#getCode").html(time+"S");
                                time--;

                                if(time==0){
                                    clearInterval(timer);
                                    $("#getCode").html("获取验证码");
                                    $("#getCode").prop("loading",false);
                                }

                            },1000)

                        }
                    })

                }

                this.submit=function(){
                    var postObj={};


                    if(self.orderId){

                        $.ajax({
                            url:APP.urls.continuePay,
                            type:"POST",
                            dataType:"json",
                            data:{
                                orderId:self.orderId
                            },
                            success:function(res){
                                var data=res.Data;
                                if(!res.Status==0){
                                    tip(res.Message, { classes: "otip", t: 2000 });
                                    return "";
                                }
                                self.orderId=data.id;
                                self.pay(data.payInfo);
                            }
                        })

                        $eles.payBtn.prop("isLoading",false);

                        return ""
                    }

                    if(!address||!address.id){
                        tip("请选择收货地址", { classes: "otip", t: 2000 });
                        $eles.payBtn.prop("isLoading",false);
                        return "";
                    }

                    if(this.needCheckTel){

                        var Tpl='<div class="widget_wrap" style="z-index:19500;">' +
                            '<div class="widget_header">填写验证码</div>' +
                            '<div class="widget_body" id="outOfRangeList" style="overflow: hidden;">' +
                            '<p>请确认手机号，并验证</p>'+
                            '<div class="tel_wrap "><div class="wrap_input"><input type="tel" id="telPhone" value='+address.telephone+'></div><span id="getCode" class="getCode">获取验证码</span></div>'+
                            '<div class="wrap_input"><input type="tel" id="code" placeholder="填写验证码"></div>'+
                            '<div id="codeTip"></div>'+
                            '</div>' +
                            '<div class="widget_footer">' +
                            '<ul>' +
                            '<li class="cancel">取消</li>' +
                            '<li class="sure">确定</li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>';

                        eles.codeDialog=dialog(null, {
                            TPL: Tpl,
                            classes:"check_code",
                            callBack:function(e){
                                //$eles.payBtn.prop("isLoading",false);
                                var et = $(e.target);
                                if(et.hasClass("widget_mask")||et.hasClass("cancel")){
                                    this.destroy();
                                    $eles.payBtn.prop("isLoading",false);
                                }else if(et.hasClass("sure")){
                                    eles.submitCode();
                                    //this.destroy();

                                }else if(et.hasClass("getCode")){
                                    eles.getCode();
                                }
                            }
                        }).config().open();

                        $eles.payBtn.prop("isLoading",false);


                        return ""
                    }

                    postObj.resId=resId;
                    postObj.addrssId=address.id;
                    postObj.deliveryType=deliveryType;
                    postObj.serverFee=serverFee;
                    postObj.commodity=[];
                    postObj.couponId=(currCoupon&&currCoupon.id)||"";

                    postObj.remark=$eles.remark.val();

                    if(!deliveryMinTime||!deliveryMaxTime){
                        tip("请选择时间", { classes: "otip", t: 2000 });
                        $eles.payBtn.prop("isLoading",false);
                        return null
                    }

                    postObj.deliveryMinTime=deliveryMinTime;
                    postObj.deliveryMaxTime=deliveryMaxTime;

                    [].forEach.call(goodsList,function(value,index){
                        var item={};
                        item.commodityId=value.id;
                        item.quantity=value.num;
                        item.skuList=[];
                        for(var i=0;i<value.skuList.length;i++){
                            item.skuList.push(value.skuList[i].id);
                        }
                        postObj.commodity.push(item);
                    })

                    var _l=window.loading();
                    $.ajax({
                        url:APP.urls.submitOrder,
                        type:"POST",
                        dataType:"json",
                        data:{
                            orderInfo:JSON.stringify(postObj)
                        },
                        success:function(res){
                            var data=res.Data;
                            _l.destroy();
                            if(!res.Status==0){
                                tip(res.Message, { classes: "otip", t: 2000 });
                                return "";
                            }
                            self.orderId=data.id;
                            self.pay(data.payInfo);
                        },
                        error:function(){
                            _l.destroy();
                        }
                    })
                }

                this.pay=function(info){
                    $eles.payBtn.prop("isLoading",false);
                    WeixinJSBridge.invoke('getBrandWCPayRequest', info,
                    function(res) {console.log(res)
                        if (res.err_msg == "get_brand_wcpay_request:ok") {
                            //todo
                            //alert("支付成功");
                            location.href=[APP.urls.orderResult,"?id=",eles.orderId].join("");
                        }else{

                        }
                    })
                }

            }

            return new Ele();
        })();

        initPage();

        function initPage(){

            initView();
            initEvent();

            //初始化浏览记录对象
            historyEvent.init();
        }

        function initView(){
            var info=sessionStorage.getItem("res_info");

            info=JSON.parse(info);
            eles.setInfo(info);
            console.log(info);

            eles.getAddress();

            eles.getCoupons();

            $.ajax({
                url:APP.urls.IsRequiredVerification,
                type:"POST",
                data:{},
                dataType:"json",
                success:function(res){
                    if(res.Status==0){
                        eles.needCheckTel=res.Data;
                    }
                },
            })

            var timeList=eles.getDeliveryTime(),
                daysArr=["周日","周一","周二","周三","周四","周五","周六"],
                tabsStr="",
                timesStr="";

            [].forEach.call(timeList,function(v,index){
                var one= v,
                    len= one.length,
                    str1="",
                    str2="";
                switch (index){
                    case 0:
                        str1="今天";
                        break;
                    case 1:
                        str1="明天";
                        break;
                    case 2:
                        str1="后天";
                        break;
                }
                if(len>0){
                    str1+="("+daysArr[(new Date(v[0].sTime)).getDay()]+")";
                    tabsStr+='<li index="'+index+'">'+str1+'</li>';
                    str2+='<ul class="time_list" data-index="'+index+'">';
                    [].forEach.call(one,function(item,index){
                        str2+='<li>\
                                <label>\
                                <span>'+item.timeStr+'</span>\
                                    <input type="radio" class="hidden" name="timeSelect" value='+JSON.stringify(item)+'>\
                                <i class="icon icon_circle"></i>\
                                </label>\
                                </li>';

                    })
                    str2+='</ul>';

                    timesStr+=str2;
                }
            })

            $eles.timeTabs.html(tabsStr);
            $eles.timeListCon.find(".wrap_time_list").html(timesStr);
        }

        function initEvent(){

            $eles.timeTabs.on("click","li",function(){
                var self=$(this),
                    index=self.index();
                if(self.hasClass("on")){
                    return ""
                }
                $eles.timeTabs.find(".on").removeClass("on");
                $eles.timeListCon.find(".on").removeClass("on");
                self.addClass("on");
                $eles.timeListCon.find(".time_list").eq(index).addClass("on");

                eles.timeScroller.refresh();
            })

            $eles.timeTabs.find("li").eq(0).trigger("click");

            $eles.deliverTime.on("click",function(){
                eles.timeSelect.show();

                historyEvent.push({
                    title:"选择时间",
                    url:"#timeSelect"
                },function(){
                    eles.timeSelect.hide();
                })
            });

            $eles.timeSelect.on("click",".mask",function(){
                //todo
                console.log()
                var input=$eles.timeListCon.find("input:checked"),
                    v=input.val(),
                    timeArr= {};

                if(v){
                    timeArr=JSON.parse(v);
                    eles.currTime=timeArr;
                }

                history.go(-1);
            })

            $eles.timeSelect.on("change","input",function(){
                var input=$(this),
                    v=input.val(),
                    timeArr= {};

                if(v){
                    timeArr=JSON.parse(v);
                    eles.currTime=timeArr;
                }

                history.go(-1);
            })

            $eles.couponUse.on("click",function(){
                eles.couponSelect.show();
                historyEvent.push({
                    title:"使用优惠券",
                    url:"#couponSelect"
                },function(){
                    eles.couponSelect.hide();
                })
            });


            $eles.couponList.on("change","input",function(){
                var input =$(this),
                    id=input.val();

                eles.couponUse=id;

                console.log("couponId",id)

                setTimeout(function(){
                    history.go(-1);
                },100)
            })


            $eles.payBtn.on("click",function(){
                var self=$(this);
                if(self.prop("isLoading")){
                    return false;
                }
                self.prop("isLoading",true);
                eles.submit();
            })
        }
    })

})