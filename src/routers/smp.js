import Router from 'koa-router'
import SmpSearch from '../controllers/smp/search-adseat'

const router = new Router()

// 总数据
router.get('/', SmpSearch.searchAdseat)

export default router
