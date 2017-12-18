import baseConfig from './config/config.base'
import Koa from 'koa'
import router from './routers/index'
import Search from './controllers/search'

const app = new Koa()

app.use(router.routes())


app.listen(baseConfig.port)
console.log(`serves start in localhost:${baseConfig.port}`)
