import superagent from 'superagent'
import client from '../config/config.elastic'

class Search {
  constructor() {

  }

  async totalDate(ctx) {
    const {user_id} = ctx.request.query
    const today = [new Date().setHours(0, 0, 0, 0), 'now']
    console.log(today)
    let actIdRes //查询 该user_id 下所有的actid的接口 结果


    try {
      if (!user_id) {
        throw new Error('user_id参数错误')
      }
    } catch (err) {
      ctx.log.error(err.message)
      ctx.send({
        code: 400,
        msg: err.message
      })
      return
    }

    await superagent
      .post("http://context.bjvca.com/esapi/v1/actIdsForUserId")
      .type('application/json')
      .set('accept', 'json')
      .send({user_id: user_id})
      .then((re) => {
        actIdRes = JSON.parse(re.text)
      })


    // 查询所有actId 出错
    if (actIdRes.code !== 200) {
      ctx.send({
        code: actIdRes.code,
        msg: actIdRes.msg
      })
      return
    }
    // 没有数据
    if (actIdRes.data[1].length === 0 && actIdRes.data[2].length === 0 && actIdRes.data[3].length === 0) {
      ctx.send({
        code: 200,
        data: [],
        msg: actIdRes.msg
      })
      return
    }


    const totalArr = [...actIdRes.data[1], ...actIdRes.data[2], ...actIdRes.data[3]]
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
                  {'terms': {'act_id.keyword': totalArr}},
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
                  {'terms': {'act_id.keyword': totalArr}},
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
        click_count
      },
      msg: 'success'
    })
  }
}

export default new Search()
