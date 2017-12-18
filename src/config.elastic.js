import ElasticSearch from 'elasticsearch'

const client = new ElasticSearch.Client({
  hosts: [
    {
      host: '47.95.35.153',
      auth: 'elastic:elastic',
      protocol: 'http',
      port: 9200
    }
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
