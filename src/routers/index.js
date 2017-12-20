import Router from 'koa-router'
import Search from '../controllers/search'

const router = new Router({
  prefix: '/api'
})

router.get('/', Search.totalDate)

export default router
