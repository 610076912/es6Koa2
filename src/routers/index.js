import Router from 'koa-router'
import Search from '../controllers/search'

const router = new Router({
  prefix: '/api'
})

router.get('/', Search.indexDate)

export default router
