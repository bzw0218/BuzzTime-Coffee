/**
 * Created by Administrator on 2016/10/23 0023.
 */
define(function(require, exports, module){
    var historyEvent={
        hisList:[],
        init:function(){
            var self=this;
            window.addEventListener("popstate", function(e) {
                var length=self.hisList.length;
                console.log("返回");
                if(length>0){
                    self.hisList[length-1].call(self);
                    self.hisList.pop();
                }
            }, false);
        },
        push:function(option,fn){
            var state = {
                title: option.title||"title",
                url: option.url||"#"
            };
            window.history.pushState(state,state.title,state.url);
            this.hisList.push(fn);
        },
        prop:function(){

           this.hisList.pop();
        }
    };

    module.exports = historyEvent;
})