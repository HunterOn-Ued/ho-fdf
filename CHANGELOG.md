Hunteron fdf
======
### 1.2.18
修改用户行为统计，非<A>标签设置 ui-serf 跳转产生获取不到 scope 的错误
修改用户行为统计，事件传递错误
优化 mu.parseUrl 支持IE8


### 1.2.16
$Base.evt, $Base.event 使用debound方法构建，可以有效的防止双击事件;
mu 优化mu.now() 可以设置获得当前时间，是否可以忽略到秒或毫秒;
全局变量添加 X-TOKEN，X-PROP
http 请求头添加对 X-TOKEN，X-PROP 的支持，X-PROP支持直接从data或params传递参数;


### 1.2.15
mu 新添方法 mu.flat, mu.params, mu.url, mu.parseUrl, mu.storage
mu 优化 mu.map, 支持对象与数组间转换
mu 优化 mu.extend, 支持深拷贝
filter 新添过滤器 fdfDate, 支持中文星期
添加全局环境变量配置

### 1.2.6
* 对用户行为分析记录进行优化
1. clickPosition 优化，无需html代码中预赋值当前记录所在列表中的位置
2. clickModule 优化，无需在html代码中注入当前module的名称
3. 页面转换的duration(页面跳出时间)值，更换方案
4. 添加埋点新添项 productName（产品名称）
5. 添加埋点新添项 openToClickTime（面试初始到点击时间）
6. fe 添加 intervalTime(两个事件间隔时间)
6. fe 添加 os (当前用户的操作系统)
7. userAgent（浏览器用于 HTTP 请求的用户代理头的值） 移到 fe 下

* 统一当前currentUser值

### 1.2.5
* 丰富原有的前端工具库 mu.js 至 v1.5.1, 放弃使用 underscore.js 工具库
* 使用browserify合并打包，对外接口统一为 dist/fdf.js
* 添加用户行为分析记录

### 1.1.2
* ui 组件采用 angular-ui and angular-bootstrap

## 1.1.1 
* 打包注册bower
