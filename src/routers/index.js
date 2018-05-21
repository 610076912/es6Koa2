import Router from 'koa-router'


import dsp from './dsp'
import dspChack from './dsp-chack'
import SmpSearch from './smp'

const router = new Router()

router.get('/', ctx => {
  ctx.body = {code: 204}
})
router.use('/data', dsp.routes(), dsp.allowedMethods())
router.use('/dspchack', dspChack.routes(), dspChack.allowedMethods())
router.use('/smp', SmpSearch.routes(), SmpSearch.allowedMethods())

export default router
