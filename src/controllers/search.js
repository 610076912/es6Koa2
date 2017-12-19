import superagent from 'superagent'

class Search {
	constructor () {

	}

	async indexDate (ctx, next) {
	  const userId = ctx.request.query
    superagent
      .post("http://192.168.1.180:5000/esapi/v1/actIdsForUserId")
      .type('application/json')
      // .set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8')
      .send({user_id: userId})
      .end(function(err,re){
        next()
        // console.log(re)
        ctx.send(re);
      })
  }
}

export default new Search()
