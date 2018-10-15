import log4js from 'log4js'
import access from './access'

// 追踪、调试、信息、警告、错误、严重错误、标记
const methods = ["trace", "debug", "info", "warn", "error", "fatal", "mark"]

const baseInfo = {
  appLogLevel: 'debug',
  dir: 'logs',
  env: process.env.NODE_ENV,
  projectName: 'elasticSearch'
}

export default (options) => {
  const contextLogger = {}
  const appenders = {}
  // 继承自 baseInfo 默认参数
  const opts = Object.assign({}, baseInfo, options || {})
  // 需要的变量解构 方便使用
  const { env, appLogLevel, dir } = opts
  appenders.cheese = {
    type: 'dateFile',
    filename: `${dir}/task`,
    pattern: '-yyyy-MM-dd.log',
    alwaysIncludePattern: true
  }
// 环境变量为dev local development 认为是开发环境
  if (env === "dev" || env === "local" || env === "development") {
    appenders.out = {
      type: "console"
    }
  }
  let config = {
    appenders,
    categories: {
      default: {
        appenders: Object.keys(appenders),
        level: appLogLevel
      }
    }
  }

  const logger = log4js.getLogger('cheese')

  return async (ctx, next) => {
    const start = Date.now()
    log4js.configure(config)
    methods.forEach((method, i) => {
      contextLogger[method] = (message) => {
        logger[method](access(ctx, message))
      }
    })
    ctx.log = contextLogger
    await next()
    const end = Date.now()
    const responseTime = end - start
    logger.info(access(ctx, {responseTime: `响应时间为${responseTime/1000}s`}))
  }
}
