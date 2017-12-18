import baseConfig from './config/config.base' //基础配置
import Koa from 'koa'
import router from './routers/index' //路由
import Middleware from './middleware/index'

const app = new Koa()

Middleware(app) //集中调用中间件


app.use(router.routes())


app.listen(baseConfig.port)
console.log(`serves start in localhost:${baseConfig.port}`)
