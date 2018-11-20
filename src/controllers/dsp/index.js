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
      } else if (channel_id && (!Number(channel_id) && Number(channel_id) === 0)) {
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
    if ((!actIdRes)||actIdRes.length === 0) {
      ctx.send({
        code: 200,
        data: {
          bg_count: 0,
          click_count: 0,
          click_rate: 0
        }
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
                  {'range': {'request_time': {'from': today[0], 'to': today[1]}}}
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
                  {'range': {'request_time': {'from': today[0], 'to': today[1]}}}
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
        click_rate: click_count === 0 ? 0 : (click_count / bg_count)
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
      time_range = ['now-6d/1d', 'now']
    } else {
      time_range = JSON.parse(time_range)
    }

    const actIdRes = await getActId(user_id, channel_id)
    if ((!actIdRes) || actIdRes.length === 0) {
      ctx.send({
        code: 200,
        data: {
          bgArr: [],
          bgTotal: 0,
          clickArr: [],
          clickTotal: 0,
          datelist: [],
          clickRate: 0,
          clickRateArr: []
        },
        msg: 'success'
      })
      return
    }
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
              'time_zone': 'Asia/Shanghai',
              'format': 'yyyy-MM-dd'
            }
          }
        }
      }
    }).then(res => {
      bgTotal = res.hits.total
      if (bgTotal !== 0) {
        res.aggregations.aggsArr.buckets.forEach(item => {
          bgArr.push(item.doc_count)
          datelist.push(item.key_as_string)
        })
      }
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
              'time_zone': 'Asia/Shanghai',
              'format': 'yyyy-MM-dd'
            }
          }
        }
      }
    }).then(res => {
      clickTotal = res.hits.total
      if (clickTotal !== 0) {
        res.aggregations.aggsArr.buckets.forEach(item => {
          clickArr.push(item.doc_count)
        })
      }
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
        clickRate: clickTotal === 0 ? 0 : (clickTotal / bgTotal),
        clickRateArr
      },
      msg: 'success'
    })
  }
}

export default new Search()
