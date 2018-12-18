import {client, client1} from '../../config/config.elastic'

class SmpSearch {
  constructor() {
  }

  async searchAdseat(ctx) {
    let {platform_id, plan_id, video_id, class3_name} = ctx.request.query


    let searchBody = [
      {'range': {'request_time': {'from': 'now-1d', 'to': 'now'}}},
      // {'term': {'media_channel_id': platform_id}}
    ]
    if (platform_id) {
      searchBody.push({'term': {'media_channel_id': platform_id}})
    }
    if (plan_id) {
      searchBody.push({'term': {'act_id': plan_id}})
    }
    if (video_id) {
      searchBody.push({'term': {'video_id': video_id}})
    }
    if (class3_name) {
      searchBody.push({'term': {'class3_name': class3_name}})
    }
    console.log(searchBody)


    await client1.search({
      index: '*bg*',
      body: {
        'size': 0,
        '_source': {
          'include': [
            'act_id', 'video_id', 'media_name', 'class3_name', 'ad_seat_b_time'
          ]
        },
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': searchBody,
                'must_not': [
                  {'term': {'media_channel_id': 1021}},
                  {'term': {'media_channel_id': 1015}}
                ]
              }
            }
          }
        },
        'aggs': {
          'adseat': {
            'terms': {
              'size': 1000,
              'field': 'adseat_id'
            },
            'aggs': {
              'mediaName': {
                'top_hits': {
                  '_source': ['act_id', 'video_id', 'media_name', 'class3_name', 'ad_seat_b_time'],
                  'size': 1
                }
              }
            }
          }
        }
      }
    }).then(res => {
      // ctx.send(res)
      let list = []
      res.aggregations.adseat.buckets.forEach(item => {
        let obj = item.mediaName.hits.hits[0]._source
        obj.adseatId = item.key
        list.push(obj)
      })
      ctx.send({
        code: 200,
        data: {
          total: res.hits.total,
          list,
        },
        msg: 'success'
      })
    })
  }
  /*async deleteData(ctx) {

    await client.deleteByQuery({
      index: '*ad_allrequest*',
      body: {
        "query": {
          "bool": {
            "must": [
              {
                "range": {
                  "request_time": {
                    "gte": 1522425600000,
                    "lte": 1530374399999
                  }
                }
              }
            ]
          }
        }
      }
    }).then(res => {
      ctx.send(res)
    })
  }*/
}

export default new SmpSearch()
