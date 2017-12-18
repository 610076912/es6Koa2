import bodyParser from 'koa-bodyparser'
import miSend from './mi-send'

export default (app) => {
  app.use(miSend())
  app.use(bodyParser()) // 解析post请求的参数
}
