export default () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      let code = parseInt(e.status)
      // 默认错误信息为 error 对象上携带的 message
      const message = e.message
      ctx.send({
        code,
        message
      })
    }
  }
}
