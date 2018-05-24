import superagent from 'superagent'

/*
* @param userId    用户id
* @param actType   0：返回所有actId
*                  1：移动actId
*                  2:pc
*                  3: OTT
* @return actIdRes[]
* */
let testEnv = process.env.NODE_ENV === 'test'
let bestUrl = testEnv ?  'http://47.93.140.7' : 'http://context.videozhishi.com'
async function getActId(userId, actType = 1) {
  let actIdRes
  await superagent
    .post(bestUrl + "/esapi/v1/actIdsForUserId")
    .type('application/json')
    .set('accept', 'json')
    .send({user_id: userId})
    .then((re) => {
      actIdRes = JSON.parse(re.text)
    })
  if (actIdRes.code === 200) {
    switch (Number(actType)) {
      case 0:
        return [...actIdRes.data[1], ...actIdRes.data[2], ...actIdRes.data[3], ...actIdRes.data[4]]
      case 1:
        return actIdRes.data[1]
      case 2:
        return actIdRes.data[2]
      case 3:
        return actIdRes.data[3]
      case 4:
        return actIdRes.data[4]
      default:
        throw new Error('actType参数错误')
    }
  } else {
    throw new Error(actIdRes.msg)
  }
}

export default getActId
