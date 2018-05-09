var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db');

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    nickname: String,
    email: String,
    img: String
});
var UserModel = mongoose.model('user', UserSchema);

var CategorySchema = new mongoose.Schema({
    name: String
})
var CategoryModel = mongoose.model('category', CategorySchema);

var ArticleSchema = new mongoose.Schema({
    title:String,
    addtime:String,
    content:String,
    cishu:Number,
    intro:String,
    pic:String,
    cate_id:String
});
var ArticleModel = mongoose.model('article',ArticleSchema);

module.exports = {
    user: UserModel,
    category : CategoryModel,
    article: ArticleModel
};