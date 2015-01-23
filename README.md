Hunteron Front-end development framework with angular 1.2.26
======

## 注册bower

bower register ho-fdf git://github.com/HunterOn-Ued/ho-fdf.git

> git 项目若为 public 请注意 在bower.json中属性 private 需设置为 false

## git 版本控制

```

//本地创建
git tag -a 1.1.0 -m 'first version'

//查看本地创建的 tag 
git tag -l

//删除本地创建的 tag
git tag -d 1.1.0

//将tag push 到服务器端 tags
git push --tags

//查看服务器tags 
git ls-remote --tags

//删除服务端tag
git push origin :refs/tags/1.1.0

// browerify
browserify fdf.src.js > fdf.js


### npm install bower-json
```javascript
var bowerJson = require('bower-json');

// Can also be used by simply calling bowerJson()
bowerJson.read('./bower.json', function (err, json) {
    if (err) {
        console.error('There was an error reading the file');
        console.error(err.message);
        return;
    }

    console.log('JSON: ', json);
});
```
node checkBower.js
检查bower.json 是否正确


git config --global url."https://".insteadOf git://
git config --global --unset url."https://".insteadOf

### browserify
browserify fdf.src.js > fdf.js



