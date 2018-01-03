import client from '../../config/config.elastic'
import getActId from '../../service/get-act-id'
import getActIdDetail from '../../service/get-actId-detail'

class Search {
  constructor() {

  }

  // 总数据
  async totalData(ctx) {
    const {user_id, channel_id} = ctx.request.query
    const today = [new Date().setHours(0, 0, 0, 0), 'now']

    // const a = await getActIdDetail(user_id)
    // ctx.send(a)
    try {
      if (!user_id) {
        throw new Error('user_id参数错误')
      } else if (channel_id && (!Number(channel_id) && Number(channel_id) !== 0)) {
        throw new Error('channel_id参数错误')
      }
    } catch (err) {
      ctx.log.error(err.message)
      ctx.send({
        code: 400,
        msg: err.message
      })
      return
    }
    const actIdRes = await getActId(user_id, channel_id)

    // 没有数据
    // console.log(actIdRes)
    if (actIdRes.length === 0) {
      ctx.send({
        code: 200,
        data: [],
        msg: actIdRes.msg
      })
      return
    }

    // ctx.send(totalArr)


    // 查询 曝光量
    let bg_count
    await client.search({
      index: 'sltlog_ad_bg_log-*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'terms': {'act_id': actIdRes}},
                  {'range': {'request_time': {'from': 'now-1w', 'to': today[1]}}}
                ]
              }
            }
          }
        }
      }
    })
      .then(res => {
        // ctx.send(res)
        bg_count = res.hits.total
      })

    // 查询 点击量
    let click_count
    await client.search({
      index: 'sltlog_ad_click_log-*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {'terms': {'act_id': actIdRes}},
                  {'range': {'request_time': {'from': 'now-1w', 'to': today[1]}}}
                ]
              }
            }
          }
        }
      }
    })
      .then(res => {
        click_count = res.hits.total
      })
      .catch(err => {

      })

    ctx.send({
      code: 200,
      data: {
        bg_count,
        click_count,
        click_rate: click_count === 0 ? 0 : (click_count / bg_count).toFixed(6) * 100 + '%'
      },
      msg: 'success'
    })
  }
  // 图表接口数据
  async channelData(ctx) {
    let {user_id, channel_id, time_range} = ctx.request.query

    try {
      if (!user_id) {
        throw new Error('user_id参数错误')
      } else if (channel_id && (!Number(channel_id) && Number(channel_id) !== 0)) {
        throw new Error('channel_id参数错误')
      } else if (time_range && !Array.isArray(JSON.parse(time_range))) {
        throw new Error('time_range参数错误')
      }
    } catch (err) {
      ctx.send({
        code: 400,
        msg: err.message
      })
      return
    }
    if (!time_range) {
      time_range = ['now-7d/d', 'now']
    } else {
      time_range = JSON.parse(time_range)
    }

    const actIdRes = await getActId(user_id, channel_id)
    // if (actIdRes.length === 0) {
    //   ctx.send({
    //     code: 200,
    //     data: [],
    //     msg: actIdRes.msg
    //   })
    //   return
    // }
    // 查询曝光量
    let bgArr = [], bgTotal, clickArr = [], clickTotal, datelist = []
    await client.search({
      index: 'sltlog_ad_bg_log-*',
      body: {
        'size': 0,
        'query': {
          'bool': {
            'must': [
              {'terms': {'act_id': actIdRes}},
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
        bgArr.push(item.doc_count)
        datelist.push(item.key_as_string)
      })
      bgTotal = res.hits.total
    })

    // 查询点击量量
    await client.search({
      index: 'sltlog_ad_click_log-*',
      body: {
        'size': 0,
        'query': {
          'bool': {
            'must': [
              {'terms': {'act_id': actIdRes}},
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
        clickArr.push(item.doc_count)
      })
      clickTotal = res.hits.total
    })
    // 点击率数组
    let clickRateArr = bgArr.map((item, index) => {
      return item === 0 ? 0 : clickArr[index] / item
    })
    ctx.send({
      code: 200,
      data: {
        bgArr,
        bgTotal,
        clickArr,
        clickTotal,
        datelist,
        clickRate: clickTotal === 0 ? 0 : (clickTotal / bgTotal).toFixed(6) * 100 + '%',
        clickRateArr
      },
      msg: 'success'
    })
  }
}

export default new Search()
