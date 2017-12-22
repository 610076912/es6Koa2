import Router from 'koa-router'
import Search from '../controllers/index-data'

const router = new Router({
  prefix: '/data'
})

router.get('/total_data', Search.totalData)
router.get('/channel_data', Search.channelData)

export default router
