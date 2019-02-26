var gulp = require("gulp");
var jshint =require("gulp-jshint");
var stylish = require("jshint-stylish");
//var stylish = require("jshint-stylish");
var map = require("map-stream");
var uglify = require("gulp-uglify");
var connet = require("gulp-connect");
var del = require("del");
var csslint = require("gulp-csslint");
var concat = require("gulp-concat");
var imagemin = require("gulp-imagemin");
var cssclean = require("gulp-clean-css");
var sourcemaps = require("gulp-sourcemaps");
var mock = require("mockjs");
var webserver = require("gulp-webserver");

var url = require('url');
var fs = require('fs');
var path = require('path');
var livereload = require('gulp-livereload');

//压缩css
gulp.task("style",function(){
	gulp.src("src/css/*.css")
	.pipe(sourcemaps.init())
	.pipe(cssclean({
		compatibility: 'ie8'
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest("dist/css"))
});
//图片压缩
gulp.task("compress-images",function(){
	gulp.src("src/images/*")
	.pipe(imagemin())
	.pipe(gulp.dest("post-images"))
});
//检查css文件
gulp.task("stylelint",function(){
	gulp.src("src/css/*.css")
	.pipe(csslint())
	.pipe(csslint.formatter());
});
//自动刷新
//合并
gulp.task("hebing",function(){
	gulp.src("src/js/*.js")
	.pipe(concat("all.js"))
	.pipe(gulp.dest("dist"));
});
//压缩js
gulp.task("compress",function(){
	gulp.src("src/js/*.js")
	.pipe(uglify())
	.pipe(gulp.dest("dist"));
});

//自定义打印错误结果
var customerReporter = map(function(file,cb){
	if (!file.jshint.success) {
		console.log("jshint fail in" + file.path);
		file.jshint.results.forEach(function(err){
			if (err) {
				console.log("在"+file.path+"的第"+err.error.line+
					"行的第"+err.error.character + "列发生错误");
			}
		});
	}
	cb(null,file);
});

//检查script文件
gulp.task("script",function(){
	gulp.src("src/js/*.js")
	.pipe(jshint())
	.pipe(customerReporter);
});

gulp.task("default",function(){
	console.log("hello gulp");
});

//web服务器
gulp.task('webserver', function() {
    gulp.src('./src') // 服务器目录（./代表根目录）
    .pipe(webserver({ // 运行gulp-webserver
        port: 8000, //端口，默认8000
        livereload: true, // 启用LiveReload
        open: true, // 服务器启动时自动打开网页
        directoryListing: {
            enable: true,
            path: './src'
        },
        middleware: function(req, res, next) {
            //mock local data
            var urlObj = url.parse(req.url, true),
                method = req.method;

            if (!urlObj.pathname.match(/^\/api/)) { //不是api开头的数据，直接next
                next();
                return;
            }
            var mockDataFile = path.join(__dirname, urlObj.pathname) + ".js";
            //file exist or not
            fs.access(mockDataFile, fs.F_OK, function(err) {
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        "status": "没有找到此文件",
                        "notFound": mockDataFile
                    }));
                    return;
                }
                var data = fs.readFileSync(mockDataFile, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
            });
            next();
        },
        proxies: []
    }));
});

// 默认任务
gulp.task('default', ['webserver']);