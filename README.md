
## 项目运行

```
1、node (8.0 及以上版本)
```

```
开发环境(正式服务器)
npm run dev 

开发环境(测试服务器)
npm run dev-test



代码编译
npm run build

部署（使用pm2）
    部署测试服务器
    pm2 ./pm2.test.json
    部署正式服务器
    pm2 ./pm2.producion.json


访问: http://localhost:3889

```





# 目录结构

```
dist                  // 代码编译后的存放目录
logs                  // 日志
src                   // 源码
  config              // 一些配置文件
  controllers         // 
  middleware          // 中间件目录
  router              // 路由
babel-dsp.js        // 开发环境实时进行babel编译的入口文件
dsp.js              // 入口文件

```


