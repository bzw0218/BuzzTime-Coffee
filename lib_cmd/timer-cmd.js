/**
 * 倒计时插件
 */
define(function (require, exports, module) {
	//判断是否为数组
	function isArray (obj) {  
  		return Object.prototype.toString.call(obj) === '[object Array]';   
	}
	//补足两位数
	function addZero (num) {
		var num_2 = num;
		if (num < 10) {
			num_2 = '0' + num;
		}
		return num_2;
	}
	//timer类
	function timer (args) {
		//默认配置
		var defaultConfig = {
			endTime: new Date().getTime()+6*60*60*1000,
			step: 1000,
			bindDOC: {
				day: [],
				hour: [],
				minute: [],
				second: [],
				ms100: []
			},
			maxShow: "day",
			endTrigger: null,
			fix2: false
		};
		//参数设置
		this.endTime = args.endTime || defaultConfig.endTime;
		this.step = args.step || defaultConfig.step;
		this.bindDOC = args.bindDOC || defaultConfig.bindDOC;
		this.maxShow = args.maxShow || defaultConfig.maxShow; //显示的最高时间单位，默认为天
		this.endTrigger = args.endTrigger || defaultConfig.endTrigger; //倒计时结束后的触发函数
		this.fix2 = args.fix2 || defaultConfig.fix2;//是否在不足两位的数字前补0
		//存储根据bindDOC获取到的DOC对象
		this.DOC = {
			day: [],
			hour: [],
			minute: [],
			second: [],
			ms100: []
		};
		this.ready = true; //计时器可工作
		//初始化
		this.init();
	}
	timer.prototype = {
		init: function () {
			var self = this;
			for (var k in self.bindDOC) {
				if (!isArray(self.bindDOC[k])) {
					console.log("An array is expected for bindDOC." + k);
					self.ready = false;
				} else {
					for (var i = 0; i < self.bindDOC[k].length; i++) {
						var obj = document.getElementById(self.bindDOC[k][i]);
						if (!obj) {
							self.ready = false;
						} else {
							self.DOC[k].push(obj);
						}
					}
				}
			}
		},
		start: function () {
			var self = this;
			//初始化，全部显示为0
			// for (var k in self.DOC) {
			// 	for (var i = self.DOC[k].length - 1; i > -1; i--) {
			// 		self.DOC[k][i].innerHTML = '0';
			// 	}
			// }
			//开始计时
			if (!self.ready) {
				return;
			}
			self.loop = setInterval(function () {
				var now = new Date().getTime(),
					delta = self.endTime - now;
				if (delta < 0) {
					clearInterval(self.loop);
					if (self.endTrigger) {
						self.endTrigger.call(self);
					}
				} else {
					var day = Math.floor(delta/(24*60*60*1000)),
						d2ms = day*24*60*60*1000;
					var hour = Math.floor((delta-d2ms)/(60*60*1000)),
						h2ms = hour*60*60*1000;
					var minute = Math.floor((delta-d2ms-h2ms)/(60*1000)),
						m2ms = minute*60*1000;
					var second = Math.floor((delta-d2ms-h2ms-m2ms)/1000),
						s2ms = second*1000;
					var ms100 = Math.floor((delta-d2ms-h2ms-m2ms-s2ms)/100);
					//显示天数
					if (self.DOC['day'].length === 1) {
						self.DOC['day'][0].innerHTML = self.fix2 ? addZero(day) : day;
					} else if (self.DOC['day'].length > 1) {
						var day_split = day.toString().split(""),
							day_index = day_split.length;
						for (var i = self.DOC['day'].length - 1; i > -1; i--) {
							self.DOC['day'][i].innerHTML = day_split[day_index-1] || '0';
							day_index--; 
						}
					}
					//显示小时(若最大显示单位为hour，则大于99小时时显示为99)
					if (self.maxShow === "hour" && day > 0) {
						hour = Math.floor(delta/(60*60*1000));
						/*if (hour > 99) {
							hour = 99;
						}*/
					}
					if (self.DOC['hour'].length === 1) {
						self.DOC['hour'][0].innerHTML = self.fix2 ? addZero(hour) : hour;
					} else if (self.DOC['hour'].length > 1) {
						var hour_split = hour.toString().split(""),
							hour_index = hour_split.length;
						for (var i = self.DOC['hour'].length - 1; i > -1; i--) {
							self.DOC['hour'][i].innerHTML = hour_split[hour_index-1] || '0';
							hour_index--; 
						}
					}
					//显示分钟
					if (self.DOC['minute'].length === 1) {
						self.DOC['minute'][0].innerHTML = self.fix2 ? addZero(minute) : minute;
					} else if (self.DOC['minute'].length > 1) {
						var minute_split = minute.toString().split(""),
							minute_index = minute_split.length;
						for (var i = self.DOC['minute'].length - 1; i > -1; i--) {
							self.DOC['minute'][i].innerHTML = minute_split[minute_index-1] || '0';
							minute_index--; 
						}
					}
					//显示秒
					if (self.DOC['second'].length === 1) {
						self.DOC['second'][0].innerHTML = self.fix2 ? addZero(second) : second;
					} else if (self.DOC['second'].length > 1) {
						var second_split = second.toString().split(""),
							second_index = second_split.length;
						for (var i = self.DOC['second'].length - 1; i > -1; i--) {
							self.DOC['second'][i].innerHTML = second_split[second_index-1] || '0';
							second_index--; 
						}
					}
					//显示百毫秒
					if (self.DOC['ms100'].length === 1) {
						self.DOC['ms100'][0].innerHTML = ms100;
					} else if (self.DOC['ms100'].length > 1) {
						var ms100_split = ms100.toString().split(""),
							ms100_index = ms100_split.length;
						for (var i = self.DOC['ms100'].length - 1; i > -1; i--) {
							self.DOC['ms100'][i].innerHTML = ms100_split[ms100_index-1] || '0';
							ms100_index--; 
						}
					}
				}
			}, self.step);
		},
		//停止计时
		stop: function () {
			var self = this;
			if (self.loop) {
				clearInterval(self.loop);
			}
			return self;
		},
		//重新设定目标时间
		setTime: function (time) {
			var self = this;
			self.endTime = time;
			return self;
		}
	}

	module.exports = timer;
});