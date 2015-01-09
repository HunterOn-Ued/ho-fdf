Hunteron fdf
======

### 1.2.7

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




