import Router from 'koa-router'
import Search from '../controllers/dsp/index'
import Statistcs from '../controllers/dsp/statistics'

const router = new Router()

router.get('/total_data', Search.totalData)
router.get('/channel_data', Search.channelData)
router.get('/get_plan_list', Statistcs.getPlanList)
router.get('/get_promotion_data', Statistcs.promotionData)

export default router
