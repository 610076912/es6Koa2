import superagent from 'superagent'

/*
* @param userId    用户id
* @param actType   0：返回所有actId
*                  1：移动actId
*                  2:pc
*                  3: OTT
* @return actIdRes[]
* */
async function getActIdDetail(userId, actType = 1) {
  let actIdRes
  await superagent
    .post("http://context.bjvca.com/esapi/v1/planIdsForUserId")
    .type('application/json')
    .set('accept', 'json')
    .send({user_id: userId})
    .then((re) => {
      actIdRes = JSON.parse(re.text)
    })
  return actIdRes
}

export default getActIdDetail
