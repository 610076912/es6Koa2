import Router from 'koa-router'

const router = new Router({
  prefix: '/api'
})

router.get('/', async (ctx, next) => {
  ctx.response.body = `<h1>test router</h1>`
})

export default router
