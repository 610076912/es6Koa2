import client from '../../config/config.elastic'


class SearchEpisode {
  constructor() {
  }

  async searchEpisode(ctx) {
    let {search_text} = ctx.request.query
    if (!search_text) {
      ctx.send({
        code: 204,
        msg: '请输入内容'
      })
      return
    }
    await client.search({
      index: 'sltlog_ssp_adseat',
      body: {
        'size': 0,
        '_source': {
          'include': ['media_episode_name', 'media_channel_id']
        },
        'query': {
          'match': {
            'media_episode_name': search_text
          }
        },
        'aggs': {
          'episodeName': {
            'terms': {
              "field": 'media_episode_name.keyword'
            },
            'aggs': {
              'mediaChannelId': {
                'terms': {
                  'field': 'media_channel_id'
                },
                'aggs': {
                  'episodeId': {
                    'terms': {
                      'field': 'media_episode_id'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }).then(res => {
      let resultArr = []
      res.aggregations.episodeName.buckets.forEach(item => {
        let result = {}
        result.name = item.key
        result.ids = []
        item.mediaChannelId.buckets.forEach(item1 => {
          let obj = {}
          obj.mediaChannelId = item1.key
          obj.episodeId = item1.episodeId.buckets[0].key
          result.ids.push(obj)
        })
        resultArr.push(result)
      })
      ctx.send({code: 200, data:resultArr, msg: 'success'})
    })
  }
}

export default new SearchEpisode()
