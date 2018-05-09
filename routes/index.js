var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var md5 = require('md5');
var markdown = require( "markdown" ).markdown;

var model = require('../model/model');
var UserModel = model.user;
var CategoryModel = model.category;
var ArticleModel = model.article;

router.use(cookieParser('secret'));
router.use(flash());
router.use(session({
	secret: 'keyboard cat', //必填参数
	resave: false, //选填参数  不加会报警告
	saveUninitialized: false,// 选填参数  不加会报警告
	// cookie: { maxAge: 10000 },
	name: 'niu'
}));

/* GET home page. */
router.get('/index', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('index');
});
//登录界面 
router.get('/login', function(req, res){
  res.render('admin/login');
})
router.post('/login', function(req, res){
  //获取参数
var form = new formidable.IncomingForm();
 
  form.parse(req, function(err, fields, files) {
      UserModel.find({email: fields.email}, function(err, data){
          if(data.length > 0){
              var user = data[0];
        //判断两个密码是否一直
        if(user.password == md5(fields.password)){
          //登陆成功
          //写入session
          req.session.uid = data[0]._id;
          console.log(req.session.uid);
          req.session.id = 20;
          res.render('common/success',{msg: '登陆成功', time:3000, url:'/admin'})
        } else {
          res.render('common/error',{msg: '密码错误', time:3000, url:'/login'})
        }
      }else{
        res.render('common/error',{msg: '用户信息不存在', time:3000, url:'/login'})
      }
      })
  })
})
// 用户添加
router.get('/admin/create', function(req, res){
  var error = req.flash('error');
  if(error.length > 0){
    res.render('admin/create',{error: error, clas:'alert alert-danger'});
  }else{
    res.render('admin/create',{error: '', clas:''});
  }
})
// 数据插入
router.post('/admin/user', function(req, res){
  var form = new formidable.IncomingForm();
  form.uploadDir = "./public/uploads";
  form.keepExtensions = true;

  form.parse(req, function(err, fields, files){
      UserModel.find({email: fields.email}, function(err,data){
          if(data.length > 0){
              req.flash('error','邮箱已注册');
              // console.log(req.flash('error'));
              // req.flash('error');
              res.redirect('back');
              return;
          } else {
              // console.log(fields, files);
              var path = files.img.path.replace(/\\/g,'/');
              var index = path.indexOf('/');
              var pa = path.substr(index);
              fields.img = pa;
              fields.password = md5(fields.password);
              // console.log(fields.password);
              var UserEntity = new UserModel(fields);
              UserEntity.save(function(err, data){
                  if(err){
                      // console.log(err);
                      res.send('插入失败');
                  } else {
                      // res.send('插入成功');
                      res.render('common/success',{msg: '注册成功，请登录', time:3000, url:'/login'})
                      // res.render('admin/user');
                  }
              });
          }
      })
  });
});
router.get('/login/error', function(req, res){
  req.session.destroy(function(err){
    if(!err){
      res.render('common/success',{msg: '退出登录，请重新登录', time:3000, url:'/login'})
    }
  });
})

//列表页
router.get('/articles', function(req,res){
  // 条件对象
  var where = {};
  if(req.query.cate_id){
      where['cate_id'] = req.query.cate_id;
  }//  {cate_id: '5abdd46fa3aea62cc4a18d50'}

  if(req.query.keywords) {
      //req.query.keywords   //   new RegExp
      where['title'] = {$regex: new RegExp(req.query.keywords)} // {title: '百度'}   {title: {$regex: /百度/}}
  }

  //读取分类
  CategoryModel.find(function(err, categories){
      var page = req.query.page ? parseInt(req.query.page) : 1;
      var limit = 10;
      var skip = (page-1) * limit;
      //读取总的条数
      ArticleModel.count(where, function(err, total){
        //计算总的页码数
        var totalPage = Math.ceil(total / limit);
        //拼接页码字符串( a 链接)
        if(req.query.cate_id){
          var HTML = '<li class="paginate_button previous" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_previous"><a href="/articles?cate_id='+req.query.cate_id+'&page='+ (page <= 1 ? 1 : (page-1)) +'" class="prev">上一页</a></li>'
          for(var i=1;i<=totalPage;i++){
              if(i == page){
                  HTML += '<li class="paginate_button active" aria-controls="dataTables-example" tabindex="0"><a class="active" href="/articles?cate_id='+req.query.cate_id+'&page='+i+'">'+i+'</a></li>';
              }else{
                  HTML += '<li class="paginate_button " aria-controls="dataTables-example" tabindex="0"><a href="/articles?cate_id='+req.query.cate_id+'&page='+i+'">'+i+'</a></li>';
              }
          }
          HTML += '<li class="paginate_button next" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_next"><a class="next" href="/articles?cate_id='+req.query.cate_id+'&page='+(page >= totalPage ? totalPage : (page+1))+'">下一页</a></li>'
        } else {
          var HTML = '<li class="paginate_button previous" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_previous"><a href="/articles?page='+ (page <= 1 ? 1 : (page-1)) +'" class="prev">上一页</a></li>'
          for(var i=1;i<=totalPage;i++){
              if(i == page){
                  HTML += '<li class="paginate_button active" aria-controls="dataTables-example" tabindex="0"><a class="active" href="/articles?page='+i+'">'+i+'</a></li>';
              }else{
                  HTML += '<li class="paginate_button " aria-controls="dataTables-example" tabindex="0"><a href="/articles?page='+i+'">'+i+'</a></li>';
              }
          }
          HTML += '<li class="paginate_button next" aria-controls="dataTables-example" tabindex="0" id="dataTables-example_next"><a class="next" href="/articles?page='+(page >= totalPage ? totalPage : (page+1))+'">下一页</a></li>'
        }

        //读取最新的文章
        ArticleModel.find().sort({addtime: -1}).select({title:1,_id:1}).limit(5).exec(function(err, lastest){
            //读取文章
            ArticleModel.find(where).sort({addtime:-1}).skip(skip).limit(limit).exec(function(err, articles){
                res.render('home/list', {
                    req:req,
                    categories:categories, 
                    articles:articles, 
                    pages: HTML, 
                    lastest: lastest,
                    totalPage:totalPage
                });
            });
        });  
      });
  });
});

// 详情页
router.get('/:id.html', function(req, res){
  CategoryModel.find(function(err, categories){
    ArticleModel.find().sort({addtime:-1}).select({title:1,_id:1}).limit(5).exec(function(err,lastest){
      ArticleModel.findById(req.params.id, function(err, article){
        //判断是否为html格式
        var reg = /<p>/;
        if(!reg.test(article.content)){
            //讲markdown格式转为html
            article.content = markdown.toHTML(article.content);
        }
        CategoryModel.findById(article.cate_id, function(err, cate){
          res.render('home/detail', {
              article:article,
              categories: categories,
              lastest: lastest,
              req:req,
              cate: cate
          });
      })
      })
    })
  })
})

module.exports = router;
