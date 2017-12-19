export default (ctx, message) => {
  const {
    method,  // 请求方法 get post或其他
    url,          // 请求链接
    host,      // 发送请求的客户端的host
    headers      // 请求中的headers
  } = ctx.request;
  const client = {
    method,
    url,
    host,
    message,
    referer: headers['referer']  // 请求的源地址
  }
  return JSON.stringify(Object.assign(client))
}
