import Koa from 'koa'
import router from './routers/index'
import Search from './controllers/search'

const app = new Koa()

app.use(router.routes())


app.listen(3000)
console.log('[demo] start-quick is starting at port 3000')
