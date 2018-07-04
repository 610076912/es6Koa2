import ElasticSearch from 'elasticsearch'

let testEnv = process.env.NODE_ENV === 'test'
let host = testEnv ? {
  // 外网
  host: '47.95.165.118',
  // 内网
  // host: '10.30.96.84',
  auth: 'elastic:elastic',
  protocol: 'http',
  port: 9200
}: {
  // （外网）
  // host: '47.95.35.153',
  // (内网)
  host: '10.81.11.24',
  auth: 'elastic:elastic',
  protocol: 'http',
  port: 9200
}
const client = new ElasticSearch.Client({
  hosts: [
    host
  ]
})

client.ping({
  requestTimeout: 2000
}, (error) => {
  if (error) {
    console.trace('elasticsearch cluster is down!')
    console.log(error)
  } else {
    console.log('All is well')
  }
})


export default client
