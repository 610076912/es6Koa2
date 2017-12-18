import Router from 'koa-router'

const router = new Router({
  prefix: '/api'
})

router.get('/', async (ctx, next) => {
  ctx.send({
    code: 400,
    data: [123, 456, 789],
    message: 'success'
  })
})

export default router
