/**
 * 测试 采集卢松松博客内容
 */

var mongoose = require('mongoose');
var axios = require('axios');
var async = require('async');

mongoose.connect('mongodb://localhost/db');
//定义文档结构
var ArticleSchema = new mongoose.Schema({
	title:String,
    addtime:String,
    content:String,
    cishu:Number,
    intro:String,
    pic:String,
    cate_id:String
});
//定义模型
var ArticleModel = mongoose.model('article', ArticleSchema);
//详情页内容获取
function fetchUrl(url,callback) {
	axios.get(url).then(function(res){
		console.log('正在爬取：'+url);
		if(res.status != 200) return;
		//获取响应体
		var body = res.data;

		//正则匹配标题
		var reg = /<div class="post-title">\s<h1><a.*?>(.*?)<\/a><\/h1>/
		var title = reg.exec(body);
		var title =title ? title[1] : '';

		//获取时间
		var reg = /时间：(.*?)\s/;
		var addtime = reg.exec(body);
		var addtime = addtime ? addtime[1] : '';

		//获取摘要
		var reg = /<blockquote>(.*?)<\/blockquote>/
		var intro = reg.exec(body);
		var intro = intro ? intro[1] : '';

		//获取内容
		var reg = /<dd class="con">(.*)<ins/
		var content = reg.exec(body);
		var content = content ? content[1] : '';

		//获取图片
		var reg = /<img.*?src="(.*?)".*?width="80" height="80" border="0"\/>/;
		var pic = reg.exec(body);
		var pic = pic ? pic[1] : '';

		var data = {
			title: title,
			addtime: addtime,
			content: content,
			cishu: 1,
			intro: intro,
			pic: pic,
			cate_id:'5ac8518977dd6f1824d1ac7b'
		}

		var blog = new ArticleModel(data);

		callback(null, blog);
	});
}

var urls = [];
for(var i = 9900; i < 10000; i++){
	var url = 'http://lusongsong.com/blog/post/'+ i +'.html';
	urls.push(url);
}

var i = 0;
async.mapLimit(urls, 5, function (url, callback) {
	fetchUrl(url, callback);
  }, function (err, result) {
	result.forEach(function(blog){
		blog.save(function(err){
			i += 1;
			console.log('成功',i,'个');
			mongoose.connection.close();
		})
	})
  });

