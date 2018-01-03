import Router from 'koa-router'
import Overview from '../controllers/dsp-chack/overview'

const router = new Router()

// 总数据
router.get('/', Overview.totalData)
// 图标数据
router.get('/chart', Overview.chartData)
// 数据详情
router.get('/data_list', Overview.adDetailMedia)

export default router
