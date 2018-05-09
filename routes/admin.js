var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var mongoose = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var md5 = require('md5');
mongoose.connect('mongodb://localhost/db');
var model = require('../model/model');
var UserModel = model.user;
var CategoryModel = model.category;
var ArticleModel = model.article;

router.use(cookieParser('secret'));
router.use(flash());


/* GET home page. */
router.get('/', function(req, res, next) {
//   res.render('admin', { title: 'Express' });
    res.send('欢迎来到express!!');
});
// 用户列表
router.get('/admin/user', function(req, res, next) {
    var page = req.query.page >=1 ? parseInt(req.query.page) : 1;
    var skip = (page - 1) * 10;
    var limit = 10;

    UserModel.count(function(err, total){
        var totalPage = Math.ceil(total / 10);
        var HTML = '<li class="paginate_button previous" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_previous"><a href="/admin/user?page='+ (page <= 1 ? 1 : (page-1)) +'" class="prev">上一页</a></li>'
        for(var i=1;i<=totalPage;i++){
            if(i == page){
                HTML += '<li class="paginate_button active" aria-controls="dataTables-example" tabindex="0"><a class="active" href="/admin/user?page='+i+'">'+i+'</a></li>';
            }else{
                HTML += '<li class="paginate_button " aria-controls="dataTables-example" tabindex="0"><a href="/admin/user?page='+i+'">'+i+'</a></li>';
            }
        }
        HTML += '<li class="paginate_button next" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_next"><a class="next" href="/admin/user?page='+(page >= totalPage ? totalPage : (page+1))+'">下一页</a></li>'
        UserModel.find({}).skip(skip).limit(limit).sort({_id:-1}).exec(function(err, data){
            res.render('admin/user', {users:data, pages: HTML});
        });
    });
    // res.send('admin');
});


// 删除用户
router.get('/user/:id/delete', function(req , res){
    UserModel.remove({_id: req.params.id}, function(err){
        if(err){
            res.end('删除失败');
        } else {
            res.redirect('/admin/user');
        }
    })
});
// 修改用户
router.get('/user/:id/edit', function(req, res){
    UserModel.findById(req.params.id, function(err, data){
        // console.log(data);
        res.render('admin/edit',{user:data});
    })
})
// 更新数据
router.post('/admin/:id/update', function(req, res){
    UserModel.findById(req.params.id, function(err, user){
        var form = new formidable.IncomingForm();
        form.uploadDir = "./public/uploads";
        form.keepExtensions = true;
        // console.log('user'+user);
        form.parse(req, function(err, fields, files){
            user.email = fields.email;
            user.nickname = fields.nickname;
            user.password = md5(fields.password);
            if(files.img.size > 0){
                var path =  files.img.path;//原始路径
                var t = path.replace(/\\/g, '/');//替换之后的路径
                var index = t.indexOf('/');
                var pa = t.substr(index);
                user.img = pa;
                console.log(user)
            }
            user.save(function(err, data){
                res.redirect('/admin/user');
            })
        })
    })
})

// 分类部分
router.get('/category/create', function(req, res){
    res.render('admin/category/create');
});
router.get('/category',function(req, res){
    var page = req.query.page >=1 ? parseInt(req.query.page) : 1;
    var skip = (page - 1) * 10;
    var limit = 10;

    CategoryModel.count(function(err, total){
        var totalPage = Math.ceil(total / 10);
        var HTML = '<li class="paginate_button previous" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_previous"><a href="/category?page='+ (page <= 1 ? 1 : (page-1)) +'" class="prev">上一页</a></li>'
        for(var i=1;i<=totalPage;i++){
            if(i == page){
                HTML += '<li class="paginate_button active" aria-controls="dataTables-example" tabindex="0"><a class="active" href="/category?page='+i+'">'+i+'</a></li>';
            }else{
                HTML += '<li class="paginate_button " aria-controls="dataTables-example" tabindex="0"><a href="/category?page='+i+'">'+i+'</a></li>';
            }
        }
        HTML += '<li class="paginate_button next" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_next"><a class="next" href="/category?page='+(page >= totalPage ? totalPage : (page+1))+'">下一页</a></li>'
        CategoryModel.find({}).skip(skip).limit(limit).sort({_id:-1}).exec(function(err, data){
            res.render('admin/category/user', {cates:data, pages: HTML});
        });
    }) 
})
router.post('/category', function(req, res){
    var form = new formidable.IncomingForm();
    // console.log('user'+user);
    form.parse(req, function(err, fields, files){
        CategoryModel.find({name: fields.name}, function(err, data){
            if(data.length > 0){
                res.render('common/error', {msg:'添加失败',time:2000, url:'/category/create'})
            } else{
                var CategoryEntity = new CategoryModel(fields);
                CategoryEntity.save(function(err, data){
                    if(!err){
                        res.render('common/success', {msg:'添加成功',time:5000, url:'/category'})
                    }
                })
            }
        })
    })
})
// 更新
router.get('/category/:id/edit',function(req,res){
    CategoryModel.findById(req.params.id, function(err,data){
        if(!err){
            res.render('admin/category/edit',{category:data});
        }
    })
})
router.post('/category/:id/update', function(req, res){
    CategoryModel.findById(req.params.id, function(err, data){
		if(!err){
			//更新数据
			var form = new formidable.IncomingForm();
		 	//提取参数
		    form.parse(req, function(err, fields, files) {
		    	//修改属性值
		    	data.name = fields.name;
		    	//执行更新
		    	data.save(function(err){
		    		if(!err){
		    			res.redirect('/category');
		    		}
		    	})
		    });
		}
	})
})
// 删除
router.get('/category/:id/delete', function(req,res){
    //读取
    CategoryModel.findById(req.params.id, function(err,data){
        data.remove(function(err){
            if(!err){
                res.redirect('/category');
            }
        })
    })
});

// 文章管理
router.get('/article/create', function(req, res){
    CategoryModel.find(function(err, categories){
        if(!err){
            res.render('admin/article/create', {categories: categories});
        }
    })
})
router.post('/uploads', function(req,res){
	//文件上传
	var form = new formidable.IncomingForm();
	form.uploadDir = "./public/uploads/";
	form.keepExtensions = true;
 	
    form.parse(req, function(err, fields, files) {
    	//图片上传 如何获得name值
    	var path = files['editormd-image-file'].path;//原始路径
    	var t = path.replace(/\\/g, '/');//替换之后的路径
    	var index = t.indexOf('/');// Number
    	var p = t.substr(index);//

    	res.json({
		    success : 1,
		    message : "添加成功",
		    url     : p 
		})
    });
});

router.post('/article', function(req,res){
	var form = new formidable.IncomingForm();
	form.uploadDir = "./public/uploads/";
	form.keepExtensions = true;
 	
    form.parse(req, function(err, fields, files) {
    	//图片上传
    	var path = files.pic.path;//原始路径
    	var t = path.replace(/\\/g, '/');//替换之后的路径
    	var index = t.indexOf('/');// Number
    	var p = t.substr(index);//
    	//补充fields中的数据
    	fields.pic = p;
        fields.cishu = 0;
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth()+1;
        var date = d.getDate();
    	fields.addtime = year + '年' + month + '月' + date +'日';

    	var ArticleEntity = new ArticleModel(fields);

    	//写入
    	ArticleEntity.save(function(err, data){
    		if(!err){
    			res.render('common/success',{msg: '添加成功',time:3000, url: '/article'});
    		}else{
    			res.render('common/error',{msg: '添加失败',time:3000, url: '/article'});
    		}
    	})
    });
});

router.get('/article', function(req,res){
    //读取文章的内容
    ArticleModel.find().exec(function(err, data){
        if(!err){
            res.render('admin/article/index', {articles: data})
        }
    });
});

// 文章删除
router.get('/article/:id/delete', function(req, res){
    ArticleModel.findById(req.params.id, function(err, data){
        data.remove(function(err){
            if(!err){
                res.redirect('/article');
            }
        })
    })
})
// 文章修改
router.get('/article/:id/edit', function(req, res){
    ArticleModel.findById(req.params.id, function(err, data){
        var data = data;
        CategoryModel.find(function(err, categories){
            if(!err){
                res.render('admin/article/edit',{data:data, categories: categories});
            }
        })
    })
})
router.post('/article/:id/update', function(req, res){
    ArticleModel.findById(req.params.id, function(err, user){
        var form = new formidable.IncomingForm();
        form.uploadDir = "./public/uploads";
        form.keepExtensions = true;
        // console.log('user'+user);
        form.parse(req, function(err, fields, files){
            user.title = fields.title;
            user.content = fields.content;
            user.intro = fields.intro;
            user.cate_id = fields.cate_id;
            if(files.pic.size > 0){
                var path =  files.pic.path;//原始路径
                var t = path.replace(/\\/g, '/');//替换之后的路径
                var index = t.indexOf('/');
                var pa = t.substr(index);
                user.pic = pa;
            }
            console.log(user);
            user.save(function(err, data){
                if(!err){
                    res.redirect('/article');
                } else {
                    res.render('common/error',{msg: '修改失败',time:3000, url: '/article'});
                }
            })
        })
    })
})


router.get('/admin', function(req, res, next) {
    res.render('admin/admin');
});

module.exports = router;
