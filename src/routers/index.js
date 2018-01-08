import Router from 'koa-router'


import dsp from './dsp'
import dspChack from './dsp-chack'

const router = new Router()

router.get('/', ctx => {
  ctx.body = {code: 204}
})
router.use('/data', dsp.routes(), dsp.allowedMethods())
router.use('/dspchack', dspChack.routes(), dspChack.allowedMethods())

export default router
