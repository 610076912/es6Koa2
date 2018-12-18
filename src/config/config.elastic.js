import ElasticSearch from 'elasticsearch'

let testEnv = process.env.NODE_ENV === 'test'
// 挪库之前的，日志es
let host = testEnv ? {
  // 外网
  host: '47.95.95.156',
  // 内网
  // host: '10.30.96.84',
  auth: 'elastic:elastic',
  protocol: 'http',
  port: 9201
} : {
  // （外网）
  // host: '47.95.35.153',
  // (内网)
  host: '10.81.11.24',
  auth: 'elastic:elastic',
  protocol: 'http',
  port: 9200
}
// 索引库
let host1 = testEnv ? [{
  // 外网
  host: '47.95.95.156',
  // 内网
  // host: '10.30.96.84',
  auth: 'elastic:elastic',
  protocol: 'http',
  port: 9200,
  index: 'addx',
  type: 'adlist'
}] : [
  {
    host: '10.81.133.18',
    auth: 'elastic:elastic',
    protocol: 'http',
    port: 9200,
    index: 'addx',
    type: 'adlist'
  },
  {
    host: '10.81.237.3',
    auth: 'elastic:elastic',
    protocol: 'http',
    port: 9200,
    index: 'addx',
    type: 'adlist'
  },
  {
    host: '10.80.50.30',
    auth: 'elastic:elastic',
    protocol: 'http',
    port: 9200,
    index: 'addx',
    type: 'adlist'
  }
]


const client = new ElasticSearch.Client({
  hosts: [
    host
  ]
})

const client1 = new ElasticSearch.Client({
  hosts: host1
})

client.ping({
  requestTimeout: 2000
}, (error) => {
  if (error) {
    console.log('elasticsearch cluster is down!')
  } else {
    console.log('client All is well')
  }
})

client1.ping({
  requestTimeout: 2000
}, (error) => {
  if (error) {
    console.log('elasticsearch1 cluster is down!')
  } else {
    console.log('client1 All is well')
  }
})


export {client, client1}
