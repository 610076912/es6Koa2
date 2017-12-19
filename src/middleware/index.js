import bodyParser from 'koa-bodyparser'
import miSend from './mi-send'
import miLog from './mi-log'
import miHttoErroe from './http-error'

export default (app) => {
  app.use(miHttoErroe())  // 错误处理
  app.use(miLog())      // log中间件
  app.use(miSend())   // ctx增加send方法
  app.use(bodyParser()) // 解析post请求的参数
}
