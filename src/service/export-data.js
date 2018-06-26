import superagent from 'superagent'
import ExcelExport from 'excel-export'
import fs from 'fs'


let testEnv = process.env.NODE_ENV === 'test'
let bestUrl = testEnv ? 'http://47.93.140.7' : 'http://context.videozhishi.com'

async function exportData(ctx) {
  let actIdRes
  await superagent
    .get('https://smp.videozhishi.com/api/v1/smpDramaFindByFilterAndGroupMediaEpisodeId')
    .type('application/json')
    .set('accept', 'json')
    .send({page_count: 510})
    .then((re) => {
      actIdRes = JSON.parse(re.text)
      ExcelExport.write = function () {
        var conf = {};
        var filename = 'jxl';  //只支持字母和数字命名
        console.log(2222)

        conf.cols = [
          {caption:'视频名称', type:'string', width:20},
          {caption:'视频集数', type:'string', width:40},
          {caption:'一周视频VV', type:'string', width:20},
          {caption:'广告位数量', type:'date', width:40},
          {caption:'标签数量', type:'string', width:30},
          {caption:'媒体平台', type:'string', width:30}
        ];

        var arr = []
        conf.rows = []
        actIdRes.data.rows.forEach(item => {
          let row = []
          row.push(item.media_episode_name)
          row.push(item.video_id_all)
          row.push(item.video_week_vv)
          row.push(item.adseat_all)
          row.push(item.class3_id_all)
          row.push(item.media_channel_ids)
          conf.rows.push(row)
        })

        let result = ExcelExport.execute(conf)

        var random = Math.floor(Math.random()*10000+0);

        var uploadDir = './dist/';
        var filePath = uploadDir + filename + random + ".xlsx";

        fs.writeFile(filePath, result, 'binary',function(err){
          if(err){
            console.log(err);
          }
        });

      }
      ExcelExport.write()
      // ctx.send(actIdRes)
    })
}

export default exportData
