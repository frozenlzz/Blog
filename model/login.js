module.exports = function(req, res, next){
    if(req.session.uid && req.session.id){
        next();
    }else{
        res.render('common/error',{msg: '请先登录', time:3000, url:'/login'})
    }
}