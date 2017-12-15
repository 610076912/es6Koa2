import Koa from 'koa'

const app = new Koa()
import Search from './controllers/search'

let a = Search.foo()

console.log(a)

app.use(async (ctx) => {
  ctx.body = 'hello koa2'
})

app.listen(3000)
console.log('[demo] start-quick is starting at port 3000')
