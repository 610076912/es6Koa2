import client from '../../config/config.elastic'


class SearchEpisode {
  constructor() {
  }

  async searchEpisode(ctx) {
    await client.search({
      index: 'sltlog_ssp_adseat',
      body: {
        'size': 0,
        '_source': {
          'include': ['media_episode_name', 'media_channel_id']
        },
        'query': {
          'match': {
            'media_episode_name': '我的'
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
                }
              }
            }
          }
        }
      }
    }).then(res => {
      ctx.send(res)
    })
  }
}

export default new SearchEpisode()
