const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStatus=null;
let lastModifiedTime=null;

function computeStats(items){
  return {
    total: items.length,
    averagePrice:
      items.length > 0
        ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
        : 0
  }
}

function loadStats(callback){
  fs.stat(DATA_PATH, (err, stats)=>{
    if(err)
      return callback(err);

    if(!lastModifiedTime||stats.mtimeMs>lastModifiedTime){
      fs.readFile(DATA_PATH, (err,raw)=>{
          if(err)
            return callback(err);
          try{
            const items = JSON.parse(raw);
            cachedStatus = computeStats(items);
            lastModifiedTime = stats.mtimeMs;
            callback(null, cachedStatus);
          }catch(parseError){
            callback(parseError);
          }
      });
    }else{
      callback(null, cachedStatus)
    }

  })
}


// GET /api/stats
router.get('/', (req, res, next) => {
  loadStats((err, stats)=>{
    if(err) return next(err);
    return res.json(stats);
  })
});

module.exports = router;