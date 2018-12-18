import Router from 'koa-router'
import SmpSearch from '../controllers/smp/search-adseat'


const router = new Router()

// 总数据
router.get('/', SmpSearch.searchAdseat)

// router.get('/delete', SmpSearch.deleteData)
// 导出excel表格
// router.get('/export', ExportData)

export default router
