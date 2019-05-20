let exec = require("child_process").exec;
const EnvPeople = require("../config/server-config");
const Log = require('../config/log-config');
//日志
var errlog = Log.getLogger('err');
var runlog = Log.getLogger();
var othlog = Log.getLogger('oth');
var consoleLog = Log.getLogger('consolelog');

module.exports = {
    executeCMD: async function (cmdStr) {
        let promise = new Promise((resolve, reject) => {
            exec(cmdStr, function (err, stdout, stderr) {
                if (err) {
                    reject(-1)
                    consoleLog.info("执行错误:", cmdStr, "\n", err, stderr);
                } else {
                    resolve(stdout)
                    consoleLog.info("执行完成:", stdout);
                }
            });
        })

        let result;
        await promise.then(function (data) {
            result = data
        }, function (error) {
            result = error
        })
        return result
    },
    getNextDiceBetId : async function (nextDiceBetId){
        let tableinfo = await EnvPeople.JsonRpc.get_table_rows({
        "code": EnvPeople.DiceGameContractAccount,
        "index_position": 1,
        "json": true,
        "key_type": "i64",
        "limit": 1000,
        "lower_bound": ''+nextDiceBetId,
        "scope": EnvPeople.DiceGameContractAccount,
        "table": "betings",
        "table_key": "",
        "upper_bound": '-1' 
        }).catch(async err=>{
            errlog.error('查询投注表失败:'+err);
        });
        if (tableinfo.rows.length > 0) {
            nextDiceBetId = tableinfo.rows[tableinfo.rows.length - 1].id + 1
            tableinfo.rows.forEach(async element => {
                let hexRandNum = await this.getHexRandNum();
                let receiptRes = await this.eosTransact('dicereceipt',{hashseed:hexRandNum});
            });

        }
        return nextDiceBetId;
    },
    eosTransact : async function (actionName,datas){
        await EnvPeople.EosApi.transact({
        actions: [{
            account: EnvPeople.DiceGameContractAccount,
            name: actionName,
            authorization: [{
                actor: EnvPeople.DiceGameContractAccount,
                permission: 'active',
            }],
            data: datas,
        }]} , {
            blocksBehind: 3,
            expireSeconds: 30,
        }).then(res=>{
            consoleLog.info('开奖执行完毕 : '+res.transaction_id);
            return res.transaction_id;
        }).catch(err=>{
            consoleLog.info("开奖执行错误 : "+err);
        });
    },
    getHexRandNum : async function (){
        let randNum=await this.executeCMD('openssl rand -hex 32');
        return randNum;
    }
};