module.exports = function(grunt) {
  var version = 306;//parseInt(Math.random()*1000);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /*生成临时文件*/
    transport:{
      options:{
        paths:["./"]
      },
      js:{
        options:{
          idleading:"js_cmd/"
        },
        files:[
          {
            expand:true,
            cwd:"js_cmd/",
            src:"**/*.js",
            dest:"temp/js_cmd"
          }
        ]
      },
      lib:{
        options:{
          idleading:"lib_cmd/"
        },
        files:[
          {
            expand:true,
            cwd:"lib_cmd/",
            src:"**/*.js",
            dest:"temp/lib_cmd"
          }
        ]
      }
    },

    /*合并文件*/
    concat:{
      options:{
        paths:["temp"],
        include:"all"
      },
      build:{
        files:[
          {
            expand:true,
            cwd:"./temp/",
            src:["js_cmd/**/*.js", "!js_cmd/**/*-debug.js"],
            dest:"./build/",
            ext:"-"+(version+111)+".js"
          }
        ]
      }
    },
    //压缩文件
    uglify: {
      main:{
        options:{
          banner: '/*!webAddr:<%= pkg.webAddr %>, author:<%= pkg.author %>, email:<%= pkg.email %>, version:v-'+version+' */\n',
          paths:["build"]
        },
        files:[
          {
            expand:true,
            cwd:"./build/",
            src:["js_cmd/**/*.js", "!js_cmd/**/*-min.js"],
            dest:"./build/",
            rename: function(dest, src){
              var r = "build/"+src.replace(/-\d+/g, "-min");
              return r;
            },
            ext:".js"
          }, {
                expand:true,
                cwd:"lib_cmd/",
                src:"*.js",
                dest:"./build/lib_cmd",
                ext:"-min.js"
            }
        ]
      }
    },
    //删除临时文件
    clean: {
        temp: ['temp']
    },
    //压缩css
    cssmin: {
      //文件头部输出信息
      options: {
        banner: '/*!webAddr:<%= pkg.webAddr %>, author:<%= pkg.author %>, email:<%= pkg.email %>, version:v-'+version+' */\n',
        //美化代码
        beautify: {
          //中文ascii化，非常有用！防止中文乱码的神配置
          ascii_only: true
        }
      },
      my_target: {
        files: [
          {
            expand: true,
            //相对路径
            cwd: 'css/',
            src: ['*.css','**/*.css'],
            dest: 'css-min',
            rename: function(dest, src){
              var r = "css-min/"+src.replace(/\./g, "-min.");
              return r;
            },
            ext:".css"
          }
        ]
      }
    }

  });

  // 加载任务插件。
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-cmd-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['transport', "concat", "uglify", "clean", 'cssmin']);

};
