import {client, client1} from '../../config/config.elastic'
import getActIdDetail from '../../service/get-actId-detail'

class Statistics {
  constructor() {
  }

  // 推广数据 获取计划列表接口
  async getPlanList(ctx) {
    const {user_id} = ctx.request.query
    if (!user_id) {
      ctx.send({
        code: 400,
        msg: 'user_id参数错误'
      })
      return
    }
    const actId = await getActIdDetail(user_id)
    ctx.send(actId)
  }

  // 推广数据 图标和表格接口
  async promotionData(ctx) {
    let {actid_list, plan_b_time, plan_e_time} = ctx.request.query
    try {
      if (!plan_b_time || !plan_e_time) {
        throw new Error('plan_*_time 参数错误')
      }
      if (!actid_list) {
        throw new Error('actid_list参数错误')
      }
      if (actid_list && !Array.isArray(JSON.parse(actid_list))) {
        throw new Error('actid_list参数类型错误')
      }
    } catch (err) {
      ctx.log.error(err.message)
      ctx.send({
        code: 400,
        msg: err.message
      })
      return
    }
    // 将时间转化为时间戳，并且设置最后一天的时间为23时59分59秒999毫秒
    plan_b_time = new Date(plan_b_time).setHours(0, 0, 0, 0)
    plan_e_time = new Date(plan_e_time).setHours(23, 59, 59, 999)
    if (actid_list) {
      actid_list = JSON.parse(actid_list)
    }
    // 查询曝光量
    let bgCount, clickCount, clickRate, bgArr = [], clickArr = [], clickRateArr = [], dateArr = []
    await client1.search({
      index: 'sltlog_ad_bg_log-*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {
                    "match_all": {}
                  },
                  {'terms': {'act_id': actid_list}}
                ]
              }
            }
          }
        },
        'aggs': {
          'aggsArr': {
            'date_histogram': {
              'field': 'request_time',
              'interval': '1d',
              'min_doc_count': 0,
              'extended_bounds': {
                'min': plan_b_time,
                'max': plan_e_time
              },
              'time_zone': 'Asia/Shanghai',
              'format': 'yyyy-MM-dd'
            }
          }
        }
      }
    }).then(res => {
      // 曝光量
      bgCount = res.hits.total
      if (bgCount !== 0) {
        res.aggregations.aggsArr.buckets.forEach(item => {
          // 日期数据
          dateArr.push(item.key_as_string)
          // 曝光每天数据
          bgArr.push(item.doc_count)
        })
      }
    })

    // 查询点击量
    await client1.search({
      index: 'sltlog_ad_click_log-*',
      body: {
        'size': 0,
        'query': {
          'constant_score': {
            'filter': {
              'bool': {
                'must': [
                  {
                    "match_all": {}
                  },
                  {'terms': {'act_id': actid_list}}
                ]
              }
            }
          }
        },
        'aggs': {
          'aggsArr': {
            'date_histogram': {
              'field': 'request_time',
              'interval': '1d',
              'min_doc_count': 0,
              'extended_bounds': {
                'min': plan_b_time,
                'max': plan_e_time
              },
              'time_zone': 'Asia/Shanghai',
              'format': 'yyyy-MM-dd'
            }
          }
        }
      }
    }).then(res => {
      // 点击量
      clickCount = res.hits.total
      // 点击率
      clickRate = clickCount === 0 ? 0 : clickCount / bgCount
      if (clickCount !== 0) {
        res.aggregations.aggsArr.buckets.forEach((item, index) => {
          // 点击量每天的数据
          clickArr.push(item.doc_count)
          // 点击率每天的数据
          clickRateArr.push(item.doc_count === 0 ? 0 : item.doc_count / bgArr[index])
        })
      }
    })

    ctx.send({
      code: 200,
      data: {
        bgCount,
        clickCount,
        clickRate,
        bgArr,
        clickArr,
        clickRateArr,
        dateArr
      }
    })
  }
}

export default new Statistics()
