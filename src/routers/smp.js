import Router from 'koa-router'
import SmpSearch from '../controllers/smp/search-adseat'
import ExportData from '../service/export-data'

const router = new Router()

// 总数据
router.get('/', SmpSearch.searchAdseat)
// 导出excel表格
router.get('/export', ExportData)

export default router
