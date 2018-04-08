import ElasticSearch from 'elasticsearch'

let testEnv = process.env.NODE_ENV === 'test'
let host = testEnv ? {
  host: '47.93.140.7',
  auth: 'els:els',
  protocol: 'http',
  port: 9200
}: {
  host: '10.81.11.24', // 修改为阿里云内网地址
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
