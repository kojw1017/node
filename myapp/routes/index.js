var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var request = require('request');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'new_schema'
}); 

function upBitgo(){
  request({
    method:'GET',
    url: "https://api.upbit.com/v1/ticker?markets=KRW-ADA,KRW-ANKR,KRW-ATOM,KRW-AXS,KRW-BAT,KRW-BCH,KRW-CHZ,KRW-DOT,KRW-ENJ,KRW-EOS,KRW-FLOW,KRW-ICX,KRW-KAVA,KRW-KNC,KRW-LINK,KRW-LSK,KRW-MANA,KRW-OMG,KRW-QTUM,KRW-REP,KRW-SAND,KRW-SC,KRW-SRM,KRW-STORJ,KRW-TRX,KRW-WAVES,KRW-ETC,KRW-ETH,KRW-LTC,KRW-XTZ,KRW-BTC,KRW-XLM,KRW-XRP,KRW-ZRX",
    dataType: "json",
    cache: false,
  },(err, res, upBitResult) =>{
    if(err){
      console.log("업빗API실패");
      return;
    }
    var jsonupBit = JSON.parse(upBitResult)
    let dbUpBitName = [];
    for (var i = 0; i < jsonupBit.length; i++) {
      if (jsonupBit[i].market.indexOf("KRW") > -1) {
        dbUpBitName[i] = jsonupBit[i].market.replace(/KRW-/g,'');
      }
    }
    
    request({
      method:'GET',
      url:"https://api.kraken.com/0/public/Ticker?pair=ADAUSD,ANKRUSD,ATOMUSD,AXSUSD,BATUSD,BCHUSD,CHZUSD,DOTUSD,ENJUSD,EOSUSD,FLOWUSD,ICXUSD,KAVAUSD,KNCUSD,LINKUSD,LSKUSD,MANAUSD,OMGUSD,QTUMUSD,REPV2USD,SANDUSD,SCUSD,SRMUSD,STORJUSD,TRXUSD,WAVESUSD,ETCUSD,ETHUSD,LTCUSD,XTZUSD,BTCUSD,XLMUSD,XRPUSD,ZRXUSD",
      dataType: "json",
      cache: false,
    },(err, res, krakenResult) =>{
      if(err){
        console.log("크라 API실패");
        return;
      }
      var jsonKraken = JSON.parse(krakenResult)
      var krakenKeys = Object.keys(jsonKraken.result);
      var krakenValues = Object.values(jsonKraken.result);

            var replaceCoin = [];
            var dbKraName = [];
            for (var c = 0; c < krakenKeys.length; c++) {
              if (krakenKeys[c] == "XETCZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ETCUSD");
              } else if (krakenKeys[c] == "XETHZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ETHUSD");
              } else if (krakenKeys[c] == "XETCZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ETCUSD");
              } else if (krakenKeys[c] == "XLTCZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "LTCUSD");
              } else if (krakenKeys[c] == "XMLNZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "MLNUSD");
              } else if (krakenKeys[c] == "REPV2USD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "REPUSD");
              } else if (krakenKeys[c] == "XXBTZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "BTCUSD");
              } else if (krakenKeys[c] == "XXLMZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "XLMUSD");
              } else if (krakenKeys[c] == "XXMRZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "XMRUSD");
              } else if (krakenKeys[c] == "XXRPZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "XRPUSD");
              } else if (krakenKeys[c] == "XZECZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ZECUSD");
              } else if (krakenKeys[c] == "ZEURZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "EURUSD");
              } else if (krakenKeys[c] == "ZGBPZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "GBPUSD");
              } else {
                replaceCoin[c] = krakenKeys[c];
              }
            }
            for (var i = 0; i < replaceCoin.length; i++) {
              dbKraName[i] = replaceCoin[i].replace(/USD/g,'');
            }

      request({
        method:'GET',
        url: "https://exchange.jaeheon.kr:23490/query/USDKRW,KRWUSD",
        dataType: "json",
        cache: false,
      },(err, res1, result1) =>{
        if(err){
          console.log("환율 api 실패");
          return;
        }
        var oneDaller = JSON.parse(result1);
        var one = oneDaller.USDKRW[0];
        var daller = oneDaller.KRWUSD[0];


        function funDaller(str) {
          str = str * daller;
          return str.toFixed(2);
        }

        function kraToDaller(str) {
          str = str * 1;
          return str.toFixed(2);
        }

        function funOne(str) {
          str = one * str;
          return str.toFixed(1);
        }

         function kimp(a,b){
          var res;
          res = (a/b)*100-100
          return res.toFixed(2);
        }
        
        
        connection.query("delete from upbit",(err, results)=>{ if(err) throw err; });
        for(var i=0; i < jsonupBit.length ;i++){
          var data = {uname : dbUpBitName[i], ubuy : jsonupBit[i].trade_price, usell: funOne(krakenValues[i].b[0]), uone: funDaller(jsonupBit[i].trade_price), udaller : kraToDaller(krakenValues[i].b[0]), ukimp : kimp(jsonupBit[i].trade_price,funOne(krakenValues[i].b[0]))};
          connection.query("insert into upbit SET ?", data,(err, results)=>{ if(err) throw err; });
        }

        // connection.query("delete from kra",(err, results)=>{ if(err) throw err; });
        // for(var i=0; i < krakenKeys.length ;i++){
        //   var data = {kname : dbKraName[i], kbuy : jsonupBit[i].trade_price, ksell: funOne(krakenValues[i].b[0]), kone: funDaller(jsonupBit[i].trade_price), kdaller : kraToDaller(krakenValues[i].b[0]), kkimp : kimp(jsonupBit[i].trade_price,funOne(krakenValues[i].b[0]))};
        //   connection.query("insert into kra SET ?", data,(err, results)=>{ if(err) throw err; });
        // }
        console.log("성공");

      })

    })
  })
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/a', function(req, res, next) {
    upBitgo()
    let sql = "select * from upbit order by ukimp";
     connection.query(sql,(err,rows)=>{ 
        if(err)  throw err;
        res.send(rows)
    });
});

router.get('/b', function(req, res, next) {
  upBitgo()
  let sql = "select * from upbit order by ukimp desc";
   connection.query(sql,(err,rows)=>{ 
      if(err)  throw err;
      res.send(rows)
  });
});

router.get('/getname', function(req, res, next) {
  request({
    method:'GET',
    url: "https://api.upbit.com/v1/market/all",
    dataType: "json",
    cache: false,
  },(err, res, upBitres) =>{
    if(err){
      console.log("업빗GETNAME에러");
      return;
    }
    var upbotJson = JSON.parse(upBitres)
    let indataUpbitName = [];
    for (var i = 0; i < upbotJson.length; i++) {
      if (upbotJson[i].market.indexOf("KRW") > -1) {
          indataUpbitName[i] = upbotJson[i].market.replace(/KRW-/g,'');
      }
    }
    indataUpbitName  = indataUpbitName.filter(function(item) {
      return item !== null && item !== undefined && item !== '';
    });

    request({
      method:'GET',
      url:"https://api.kraken.com/0/public/AssetPairs",
      dataType: "json",
      cache: false,
    },(err, res, krakenResult) =>{
      if(err){
        console.log("크라켄GETNAME에러");
        return;
      }
      var jsonKraken = JSON.parse(krakenResult)
      let krakenKeys = Object.keys(jsonKraken.result);
      
            var replaceCoin = [];
            for (var c = 0; c < krakenKeys.length; c++) {
              if (krakenKeys[c] == "XETCZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ETCUSD");
              } else if (krakenKeys[c] == "XETHZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ETHUSD");
              } else if (krakenKeys[c] == "XETCZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ETCUSD");
              } else if (krakenKeys[c] == "XLTCZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "LTCUSD");
              } else if (krakenKeys[c] == "XMLNZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "MLNUSD");
              } else if (krakenKeys[c] == "REPV2USD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "REPUSD");
              } else if (krakenKeys[c] == "XXBTZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "BTCUSD");
              } else if (krakenKeys[c] == "XXLMZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "XLMUSD");
              } else if (krakenKeys[c] == "XXMRZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "XMRUSD");
              } else if (krakenKeys[c] == "XXRPZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "XRPUSD");
              } else if (krakenKeys[c] == "XZECZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "ZECUSD");
              } else if (krakenKeys[c] == "ZEURZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "EURUSD");
              } else if (krakenKeys[c] == "ZGBPZUSD") {
                replaceCoin[c] = krakenKeys[c].replace(krakenKeys[c], "GBPUSD");
              } else {
                replaceCoin[c] = krakenKeys[c];
              }
            }

            connection.query("delete from a",(err, results)=>{ if(err) throw err; });
            for(var i=0; i < indataUpbitName.length ;i++){
              let data = {name : indataUpbitName[i]};
              connection.query("insert into a SET ?", data,(err, results)=>{ if(err) throw err; });
            }

            connection.query("delete from b",(err, results)=>{ if(err) throw err; });
            for(var i=0; i < krakenKeys.length ;i++){
              let data = {name :replaceCoin[i].replace(/USD/g,'')};
              connection.query("insert into b SET ?", data,(err, results)=>{ if(err) throw err; });
            }

            connection.query("select B.NAME from a,b where a.name = b.name",(err,rows)=>{ 
               if(err)  throw err;
               var coinname=[];
               var krwcoinname=[];
               var usdcoinname=[];
               for(var i =0; i<rows.length;i++){
                 coinname += rows[i].NAME+","
                 krwcoinname += rows[i].NAME.replace(rows[i].NAME,"KRW-"+rows[i].NAME)+","
                 usdcoinname += rows[i].NAME.replace(rows[i].NAME,rows[i].NAME+"USD")+","
               }
               crakenQuery1 = coinname.replace(/,\s*$/, "")
               crakenQuery2 = krwcoinname.replace(/,\s*$/, "")
               crakenQuery3 = usdcoinname.replace(/,\s*$/, "")
               console.log(crakenQuery1)
               console.log(crakenQuery2)
               console.log(crakenQuery3)
               connection.end
           });
    })
  })
});

module.exports = router;
