import client from '../../config/config.elastic'

class Overview {
  constructor() {
  }

  // 总数据
  async totalData(ctx) {
    let {platform_id, time_range} = ctx.request.query

    try {
      if (time_range) {
        time_range = JSON.parse(time_range)
        if (!Array.isArray(time_range)) {
          throw new Error('time_range参数错误')
        }
      } else {
        time_range = ['now-1w/d', 'now']
      }

      if (!platform_id) {
        throw new Error('platform_id参数错误')
      }
    } catch (err) {
      ctx.send({
        code: 400,
        msg: err.message
      })
      return
    }


    // 第一个查询广告曝光量
    let bgCount, playCount, clickCount
    await client.search({
      index: 'sltlog_ad_bg_log*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'term': {'media_channel_id': platform_id}},
                  {'range': {'request_time': {'from': time_range[0], 'to': time_range[1]}}}
                ]
              }
            }
          }
        }
      }
    }).then(res => {
      bgCount = res.hits.total
    })

    // 第二个查询视频播放次数
    await client.search({
      index: 'sltlog_adseat_request_log*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'term': {'media_channel_id': platform_id}},
                  {'range': {'request_time': {'from': time_range[0], 'to': time_range[1]}}}
                ]
              }
            }
          }
        }
      }
    }).then(res => {
      playCount = res.hits.total
    })

    // 第三个查询点击量
    await client.search({
      index: 'sltlog_ad_click_log*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'term': {'media_channel_id': platform_id}},
                  {'range': {'request_time': {'from': time_range[0], 'to': time_range[1]}}}
                ]
              }
            }
          }
        }
      }
    }).then(res => {
      clickCount = res.hits.total
    })

    ctx.send({
      code: 200,
      data: {
        bgCount,
        playCount,
        clickCount,
        pjbg: bgCount === 0 ? 0 : bgCount / playCount,
        pjclick: clickCount === 0 ? 0 : clickCount / bgCount
      },
      msg: 'success'
    })
  }


  // 图标数据
  async chartData(ctx) {
    let {platform_id, time_range} = ctx.request.query
    // 参数错误处理
    try {
      if (time_range) {
        time_range = JSON.parse(time_range)
        if (!Array.isArray(time_range)) {
          throw new Error('time_range参数错误')
        }
      } else {
        time_range = ['now-1w/d', 'now']
      }

      if (!platform_id) {
        throw new Error('platform_id参数错误')
      }
    } catch (err) {
      ctx.send({
        code: 400,
        msg: err.message
      })
      return
    }
    let dateArr = [], playCount = [], bgCount = [], clickCount = [], pjbg = [], pjclick = []
    // 查询播放次数
    await client.search({
      index: 'sltlog_adseat_request_log*',
      body: {
        'size': 0,
        '_source': {
          'excludes': []
        },
        'query': {
          'bool': {
            'must': [
              {
                'match_all': {}
              },
              {
                'match_phrase': {
                  'media_channel_id': {
                    'query': platform_id
                  }
                }
              },
              {
                'range': {
                  'request_time': {
                    'from': time_range[0],
                    'to': time_range[1]
                  }
                }
              }
            ]
          }
        },
        'aggs': {
          'aggsArr': {
            'date_histogram': {
              'field': 'request_time',
              'interval': '1d',
              'min_doc_count': 0,
              'extended_bounds': {
                'min': time_range[0],
                'max': time_range[1]
              },
              'format': 'yyyy-MM-dd'
            }
          }
        }
      }
    }).then(res => {
      res.aggregations.aggsArr.buckets.forEach(item => {
        playCount.push(item.doc_count)
        dateArr.push(item.key_as_string)
      })
    })

    // 查询曝光次数
    await client.search({
      index: 'sltlog_ad_bg_log*',
      body: {
        'size': 0,
        '_source': {
          'excludes': []
        },
        'query': {
          'bool': {
            'must': [
              {
                'match_all': {}
              },
              {
                'match_phrase': {
                  'media_channel_id': {
                    'query': platform_id
                  }
                }
              },
              {
                'range': {
                  'request_time': {
                    'from': time_range[0],
                    'to': time_range[1]
                  }
                }
              }
            ]
          }
        },
        'aggs': {
          'aggsArr': {
            'date_histogram': {
              'field': 'request_time',
              'interval': '1d',
              'min_doc_count': 0,
              'extended_bounds': {
                'min': time_range[0],
                'max': time_range[1]
              },
              'format': 'yyyy-MM-dd'
            }
          }
        }
      }
    }).then(res => {
      res.aggregations.aggsArr.buckets.forEach(item => {
        bgCount.push(item.doc_count)
      })
    })

    // 查询点击次数
    await client.search({
      index: 'sltlog_ad_click_log*',
      body: {
        'size': 0,
        '_source': {
          'excludes': []
        },
        'query': {
          'bool': {
            'must': [
              {
                'match_all': {}
              },
              {
                'match_phrase': {
                  'media_channel_id': {
                    'query': platform_id
                  }
                }
              },
              {
                'range': {
                  'request_time': {
                    'from': time_range[0],
                    'to': time_range[1]
                  }
                }
              }
            ]
          }
        },
        'aggs': {
          'aggsArr': {
            'date_histogram': {
              'field': 'request_time',
              'interval': '1d',
              'min_doc_count': 0,
              'extended_bounds': {
                'min': time_range[0],
                'max': time_range[1]
              },
              'format': 'yyyy-MM-dd'
            }
          }
        }
      }
    }).then(res => {
      res.aggregations.aggsArr.buckets.forEach(item => {
        clickCount.push(item.doc_count)
      })
    })

    playCount.forEach((item, index) => {
      let bgRate = item === 0 ? 0 : bgCount[index] / item
      let clickRate = bgCount[index] === 0 ? 0 : clickCount[index] / bgCount[index]
      pjbg.push(bgRate)
      pjclick.push(clickRate)
    })
    ctx.send({code: 200, data: {bgCount, playCount, clickCount, dateArr, pjclick, pjbg}, msg: 'success'})
  }

  // 广告详情（视频维度）
  async adDetailMedia(ctx) {
    // 每页多少条数据
    const pageCount = 10
    // 总共多少条数据
    let total = 0
    let {platform_id, page_num, time_range} = ctx.request.query
    try {
      if (!platform_id) {
        throw new Error('platform_id参数错误')
      }

      if (page_num) {
        if (!Number(page_num)) {
          throw new Error('page_num参数错误')
        }
      } else {
        page_num = 1
      }

      if (time_range) {
        time_range = JSON.parse(time_range)
        if (!Array.isArray(time_range)) {
          throw new Error('time_range参数错误')
        }
      } else {
        time_range = ['now-1w/d', 'now']
      }
    } catch (err) {
      ctx.send({
        code: 400,
        msg: err.message
      })
    }
    let videoIdList = [], sendData = []
    // 根据platform_id 查询videoid，并且分页
    await client.search({
      index: 'sltlog_adseat_request_log-*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'term': {'media_channel_id': platform_id}},
                  {'range': {'request_time': {'from': time_range[0], 'to': time_range[1]}}}
                ]
              }
            }
          }
        },
        'aggs': {
          'mediaId': {
            'terms': {
              'field': 'video_id',
              'size': 99999
            }
          }
        }
      }
    }).then(res => {
      if (res.hits.total !== 0) {
        let resArr = res.aggregations.mediaId.buckets.slice((page_num - 1) * pageCount, (page_num * pageCount))
        resArr.forEach(item => {
          videoIdList.push(item.key)
          sendData.push({
            media_id: '',
            media_name: '',
            video_id: item.key,
            playCount: item.doc_count,
            bg_count: 0,
            pjbg: 0,
            click_count: 0,
            pjclick: 0
          })
        })
        // res.send(bgArr)
        total = res.aggregations.mediaId.buckets.length
      }
    })

    // 根据videoIdList查询mediaName、mediaId
    await client.search({
      index: 'sltlog_ssp_adseat',
      body: {
        'size': 0,
        '_source': ['media_name', 'media_id'],
        'query': {
          'constant_score': {
            'filter': {
              'terms': {
                'video_id': videoIdList
              }
            }
          }
        },
        'aggs': {
          'mediaInfo': {
            'terms': {
              'field': 'video_id'
            },
            'aggs': {
              'mediaName': {
                'top_hits': {
                  '_source': ['media_name', 'media_id'],
                  'size': 1
                }
              }
            }
          }
        }
      }
    }).then(res => {
      if (res.hits.total !== 0) {
        res.aggregations.mediaInfo.buckets.forEach(item => {
          sendData.forEach(sitem => {
            if (item.key === sitem.video_id) {
              sitem.media_id = item.mediaName.hits.hits[0]._source.media_id,
                sitem.media_name = item.mediaName.hits.hits[0]._source.media_name
            }
          })
        })
      }
    })

    // 查询曝光量
    await client.search({
      index: 'sltlog_ad_bg_log-*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'terms': {'video_id': videoIdList}},
                  {'range': {'request_time': {'from': time_range[0], 'to': time_range[1]}}}
                ]
              }
            }
          }
        },
        'aggs': {
          'mediaInfo': {
            'terms': {
              'field': 'video_id'
            }
          }
        }
      }
    }).then(res => {
      if (res.hits.total !== 0) {
        res.aggregations.mediaInfo.buckets.forEach(item => {
          sendData.forEach(sitem => {
            if (item.key === sitem.video_id) {
              sitem.bg_count = item.doc_count
              sitem.pjbg = sitem.playCount === 0 ? 0 : sitem.bg_count / sitem.playCount
            }
          })
        })
      }
    })

    // 查询点击量
    await client.search({
      index: 'sltlog_ad_click_log-*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'terms': {'video_id': videoIdList}},
                  {'range': {'request_time': {'from': time_range[0], 'to': time_range[1]}}}
                ]
              }
            }
          }
        },
        'aggs': {
          'mediaInfo': {
            'terms': {
              'field': 'video_id'
            }
          }
        }
      }
    }).then(res => {
      // ctx.send(res)
      if (res.hits.total !== 0) {
        res.aggregations.mediaInfo.buckets.forEach(item => {
          sendData.forEach(sitem => {
            if (item.key === sitem.video_id) {
              sitem.click_count = item.doc_count
              sitem.pjclick = sitem.bg_count === 0 ? 0 : sitem.click_count / sitem.bg_count
            }
          })
        })
      }
    })

    ctx.send({code: 200, data: sendData, msg: 'success'})
  }
}

export default new Overview()
