import baseConfig from './config/config.base' //基础配置
import Koa from 'koa'
import router from './routers/index' //路由
import Middleware from './middleware/index'
import cors from 'koa2-cors'  // 跨域

const app = new Koa()

app.use(cors())
Middleware(app) //集中调用中间件


app.use(router.routes())


app.listen(baseConfig.port)
console.log(`serves start in localhost:${baseConfig.port}`)
