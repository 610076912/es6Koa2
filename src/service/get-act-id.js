import superagent from 'superagent'

/*
* @param userId    用户id
* @param actType   0：返回所有actId
*                  1：移动actId
*                  2:pc
*                  3: OTT
* @return actIdRes[]
* */
async function getActId(userId, actType = 1) {
  let actIdRes
  await superagent
    .post("http://context.bjvca.com/esapi/v1/actIdsForUserId")
    .type('application/json')
    .set('accept', 'json')
    .send({user_id: userId})
    .then((re) => {
      actIdRes = JSON.parse(re.text)
    })
  if (actIdRes.code === 200) {
    switch (Number(actType)) {
      case 0:
        return [...actIdRes.data[1], ...actIdRes.data[2], ...actIdRes.data[3]]
      case 1:
        return actIdRes.data[1]
      case 2:
        return actIdRes.data[2]
      case 3:
        return actIdRes.data[3]
      default:
        throw new Error('actType参数错误')
    }
  } else {
    throw new Error(actIdRes.msg)
  }
}

export default getActId
