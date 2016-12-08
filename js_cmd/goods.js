/**
 * Created by Administrator on 2016/10/27 0027.
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


    function GetQueryString(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }

    $(function(){

        $eles={
            wrapItems:$("#wrapItems"),
            itemsList:$("#itemsList"),
            goodsList:$("#goodsList"),
            skuWrap:$("#goodSku"),
            skuList:$("#skuList"),
            goodTitle:$("#goodTitle"),
            goodPrice:$("#goodPrice"),
            goodNum:$("#number"),
            currNum:$("#currNum"),
            currPrice:$("#currPrice"),
            goOn:$("#goOn"),
            toBuy:$("#toBuy"),
            shopCartNum:$("#shopCartNum"),
            headPic:$("#headPic"),
            goodName1:$("#goodName1"),
            goodName2:$("#goodName2"),
            shopCart:$("#shopCart"),
            shopCartCon:$("#shopCartCon"),
            shopCartList:$("#shopCartList")
        };
        eles=function(){
            function Ele(){

                var currClassify=null,
                    classifyList=null,
                    goodsList=null,
                    currGoods=null,
                    self=this,
                    shopCart={
                        num:0,
                        total:0,
                        commodity:[]
                    };

                var _shopCart=sessionStorage.getItem("shop_cart");

                if(_shopCart){
                    shopCart=JSON.parse(_shopCart);

                    setTimeout(function(){
                        this.shopCartFresh();
                    }.bind(this),100)
                }

                //this.classifyScroll=new iScroll($eles.wrapItems[0],{/*bounce:false*/});

                Object.defineProperties(this,{
                    classifyList:{
                        get:function(){return classifyList;},
                        set:function(list){
                            classifyList=list;

                            var tpl='<li data-index="{index}">{chineseName}</li>',
                                html="";
                            html=iTemplate.makeList(tpl,list,function(index,v){
                                v.index=index;
                                return v;
                            });
                            $eles.itemsList.html(html);
                            //self.classifyScroll.refresh();

                            $eles.itemsList.find("li").eq(0).trigger("click");
                        }
                    },
                    currClassify:{
                        get:function(){return currClassify},
                        set:function(v){
                            currClassify=v;
                            var _l=window.loading();
                            $.ajax({
                                url:APP.urls.getGoodsByClassify,
                                data:v,
                                dataType:"json",
                                success:function(res){
                                    _l.destroy();
                                    self.goodsList=res.Data;
                                },
                                error:function(){
                                    _l.destroy();
                                }
                            })
                        }
                    },
                    goodsList:{
                        get:function(){return goodsList;},
                        set:function(v){
                            goodsList=v;
                            var tpl='<li class="goods_item border" data-index="{index}">\
                                <div class="wrap_img" style="background-image: url({picPath})"></div>\
                                <div class="goods_info">\
                                    <h3>{chineseName}</h3>\
                                    <p>{englishName}</p>\
                                    <label><span class="price">¥{price}</span>起</label>\
                                </div>\
                            </li>',
                                html="";
                            html=iTemplate.makeList(tpl,v,function(index,v){
                                v.index=index;
                                return v;
                            });

                            $eles.goodsList.html(html);
                        }
                    },
                    currGoods:{
                        get:function(){return currGoods;},
                        set:function(v){
                            console.log("------------选择商品--------------")
                            currGoods=v;
                            currGoods.num=1;
                            currGoods.skuList=[];
                            currGoods.addPrice=0;
                            currGoods.total=(currGoods.price-0);

                            $eles.headPic.css("background-image","url("+currGoods.picPath+")")
                            //$eles.shopCartNum.html();
                            $eles.goodTitle.html(currGoods.chineseName);
                            $eles.goodName1.html(currGoods.chineseName);
                            $eles.goodName2.html(currGoods.englishName);
                            $eles.goodPrice.html(currGoods.price);
                            $eles.goodNum.val(currGoods.num);
                            $eles.currNum.html(shopCart.num+currGoods.num);
                            $eles.shopCartNum.html(shopCart.num+currGoods.num);
                            $eles.currPrice.html((shopCart.total-0+currGoods.price-0).toFixed(2));
                            $eles.goodPrice.html(currGoods.price);
                            var skuInfo= currGoods.skuInfo,
                                tpl = '<dt><span>{chineseName}</span></dt>\
                                        <dd class="sku_line" data-index="{index}">\
                                        </dd>',

                                tplInner='<label class="sku_item">\
                                                <input type="{selectType}" name="{index1}" data-str="{chineseName}" data-index="{index}" class="hidden" value="{addPrice}">\
                                                <div class="item">\
                                                    <span>{chineseName}</span>\
                                                    <span>{englishName}</span>\
                                                    <i>¥{addPrice}</i>\
                                                </div>\
                                            </label>',
                                html1="",
                                htm2="",
                                tabs=null;

                            html1=iTemplate.makeList(tpl,skuInfo,function(index,v){
                                v.index=index;
                                v.addPrice= v.addPrice||0;
                                return v;
                            })

                            $eles.skuList.html(html1);
                            html1=$(html1);

                            tabs=$eles.skuList.find(".sku_line");

                            tabs.each(function(index,v){
                                var self=$(v),
                                    html2="",
                                    skus=skuInfo[index].list,
                                    selectType=skuInfo[index].enableMultiple?"checkbox":"radio";
                                html2=iTemplate.makeList(tplInner,skus,function(key,v){
                                    v.index1=index;
                                    v.index=key;
                                    v.selectType=selectType;
                                    return v;
                                })
                                self.html(html2);

                                self.find('input[type="radio"]').eq(0).trigger("click");
                            })

                            self.skuScroll.refresh();

                            self.skuPage.show();

                            $eles.goOn.show();

                            historyEvent.push({
                                title:"商品详情",
                                url:"#goodsDetail"
                            },function(){
                                self.skuPage.hide();
                                $eles.goOn.hide();
                                self.shopCartFresh();
                            })
                        }
                    },
                    currGoodNum:{
                        get:function(){
                            return currGoods.num;
                        },
                        set:function(v){
                            v=v-0;
                            currGoods.num=v-0;
                            currGoods.total=((currGoods.price+currGoods.addPrice)*currGoods.num).toFixed(2)-0;
                            $eles.goodNum.val(v);
                            $eles.currNum.html((shopCart.num-0)+(v-0));
                            $eles.shopCartNum.html((shopCart.num-0)+(v-0));
                            $eles.currPrice.html((shopCart.total-0+(currGoods.total-0)).toFixed(2));
                            $eles.goodPrice.html((currGoods.price+currGoods.addPrice-0).toFixed(2));
                            /*todo  skuprice*/
                        }
                    }
                })

                this.skuSelectChange=function(){
                    var inputs=$eles.skuList.find('input'),
                        sku=currGoods.skuInfo,
                        currSku=[],
                        totalAddPrice= 0,
                        otherStr=[];

                    inputs.each(function(){
                        var self=$(this),
                            name=self.attr("name"),
                            str=self.attr("data-str"),
                            index=self.attr("data-index"),

                            addPrice=parseFloat(self.val());

                        if(self.prop("checked")){
                            totalAddPrice+=addPrice;
                            currSku.push(sku[name]["list"][index]);
                            otherStr.push(str);
                        }
                    })
                    currGoods.addPrice=totalAddPrice;
                    currGoods.skuList=currSku;

                    if(otherStr.length>0){
                        currGoods.otherStr=["(",otherStr.join(","),")"].join("");
                    }

                    currGoods.total=((currGoods.price-0+(currGoods.addPrice-0))*currGoods.num-0).toFixed(2);
                    $eles.currPrice.html((shopCart.total-0+(currGoods.total-0)).toFixed(2));
                    $eles.goodPrice.html((currGoods.price-0+currGoods.addPrice-0).toFixed(2));


                }

                this.getClassify=function(){
                    $.ajax({
                        url:APP.urls.getGoodsClassify,
                        type:"POST",
                        dataType:"json",
                        data:{
                            shopId:APP.shopId
                        },
                        success:function(res){
                            var data=res.Data;
                            if(!res.Status==0){
                                tip(res.Message, { classes: "otip", t: 2000 });
                                return "";
                            }
                            eles.classifyList=data;
                        }
                    });
                }


                this.skuPage=new slidePage($eles.skuWrap);

                this.skuScroll= new iScroll($(".wrap_scroll")[0],{vScrollbar:false})

                this.addShopCart=function(){
                    var goodItem={};
                    goodItem= $.extend({},currGoods);
                    if(!goodItem.num){
                        return "";
                    }
                    shopCart.num+=goodItem.num;
                    shopCart.total+=(goodItem.total-0);
                    shopCart.commodity.push(goodItem);

                    $eles.shopCartNum.html(shopCart.num);
                    $eles.currNum.html(shopCart.num);
                    $eles.currPrice.html(shopCart.total);

                    //todo
                    self.shopCartFresh();
                }

                this.shopCartFresh=function(){
                    var tpl='<li>\
                            <div class="wrap_good border" data-index="{index}">\
                            <div class="wrap_name">{chineseName}</div>\
                            <div class="wrap_num">\
                            ¥<span class="price">{total}</span>\
                            <i class="icon icon_minus"></i>\
                            <input type="text" name="number" value="{num}" readonly="">\
                            <i class="icon icon_add"></i>\
                            </div>\
                            </div>\
                            <div class="wrap_tips border">{otherStr}</div>\
                        </li>',
                        html="";

                    html=iTemplate.makeList(tpl,shopCart.commodity,function(key,v){
                        v.otherStr=v.otherStr?v.otherStr:"";
                        v.index=key;
                        return v;
                    });

                    $eles.shopCartList.html(html);
                    shopCart.num=0;
                    shopCart.total=0;

                    [].forEach.call(shopCart.commodity,function(good,index){
                        shopCart.num+=(good.num-0);
                        shopCart.total+=(good.total-0);
                    })


                    $eles.shopCartNum.html(shopCart.num);
                    $eles.currNum.html(shopCart.num);
                    $eles.currPrice.html((shopCart.total-0).toFixed(2));

                    self.shopCartScroll.refresh();

                    if(shopCart.commodity.length==0){
                        if($eles.shopCartCon.hasClass("on")){
                            history.go(-1);
                        }
                    }

                }

                this.shopCartScroll=new iScroll($eles.shopCartCon[0],{vScrollbar:false})

                this.changeCartNum=function(index,num){console.log(index)
                    var goodItem=shopCart.commodity[index];

                    if(num==0){
                        shopCart.commodity.splice(index,1);
                    }else{
                        goodItem.num=num;
                        goodItem.total=((goodItem.price+goodItem.addPrice-0)*goodItem.num).toFixed(2);
                    }

                    self.shopCartFresh();
                }

                this.toOrderPage=function (){
                    var postObj={};
                    /*if(shopCart.commodity.length==0){
                        tip("请先选择商品",{ classes: "otip", t: 2000 })
                    }*/

                    postObj.resId=APP.shopId;
                    postObj.deliveryType=APP.deliveryType;
                    postObj.serverFee=APP.serverFee;
                    postObj.shopCart=shopCart;

                    sessionStorage.setItem("res_info","");
                    sessionStorage.setItem("res_info",JSON.stringify(postObj));

                    sessionStorage.setItem("shop_cart","");
                    sessionStorage.setItem("shop_cart",JSON.stringify(shopCart));
                    //window.location.href=[APP.urls.toOrderPage,"?","info=",JSON.stringify(postObj)].join("");
                    window.location.href=APP.urls.toOrderPage;


                }

                this.shopCartPage=new slidePage($eles.shopCartCon);

                this.getShopCartLength=function(){
                    return shopCart.commodity.length;
                }


            }
            return new Ele();
        }();



        initPage();
    })

    function initPage(){

        APP.shopId=GetQueryString("shopId");
        APP.deliveryType=GetQueryString("type");
        APP.serverFee=GetQueryString("serverFee");

        initEvent();
        eles.getClassify();

        //初始化浏览记录对象
        historyEvent.init();
    }

    function initEvent(){
        $eles.itemsList.on("click","li",function(){
            var self=$(this),
                index=self.attr("data-index");

            if(self.hasClass("on")){
                return null
            }
            $eles.itemsList.find(".on").removeClass("on");
            self.addClass("on");

            eles.currClassify=eles.classifyList[index];
        })

        $eles.goodsList.on("click","li",function(){
            var self=$(this),
                index=self.attr("data-index");
            eles.currGoods=eles.goodsList[index];
        })

        $eles.skuWrap.on("click",".icon_minus",function(){
            var v=$eles.goodNum.val()-0;
            if(v>0){
                v--;
                eles.currGoodNum=v;
            }else{
                return false;
            }

        })

        $eles.skuWrap.on("click",".icon_add",function(){
            var v=$eles.goodNum.val()-0;

            v++;
            eles.currGoodNum=v;

        })

        $eles.skuList.on("click","label",function(){
            eles.skuSelectChange();
        })

        $eles.goOn.on("click",function(){
            eles.addShopCart();
            history.go(-1);
            $eles.goodNum.val(0);
        })

        $eles.toBuy.on("click",function(){


            if($eles.goodNum.val()-0){
                eles.addShopCart();
            }

            if(eles.getShopCartLength()==0){
                tip("请先选择商品",{ classes: "otip", t: 2000 })
                return false
            }

            //history.go(-1);
            //alert($eles.goodNum.val());
            setTimeout(function(){
                eles.toOrderPage();
            },100);
        })

        $eles.shopCart.on("click",function(){
            if(eles.getShopCartLength()==0){
                //tip("请先选择商品",{ classes: "otip", t: 2000 })
                return false
            }

            if($eles.shopCartCon.hasClass("on")){
                history.go(-1);
            }

            eles.shopCartPage.show();
            historyEvent.push({
                title:"商品详情",
                url:"#goodsDetail"
            },function(){
                eles.shopCartPage.hide();
                //$eles.goOn.hide();
            })
        })

        $eles.shopCartList.on("click",".icon",function(){
            var self=$(this),
                item=self.closest(".wrap_good"),
                index=item.attr("data-index"),
                input=item.find('input'),
                num=input.val()-0;
            if(self.hasClass("icon_minus")){
                if(num<1){
                    return ""
                }
                num--;
                input.val(num);
                eles.changeCartNum(index,num);

            }else if(self.hasClass("icon_add")){
                num++;
                input.val(num);
                eles.changeCartNum(index,num);
            }
        })
    }
})