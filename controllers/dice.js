const myUtils = require('../utils/myUtils');
const Log = require('../config/log-config');
const EnvPeople = require("../config/server-config");
let nextDiceBetId = 0;
//日志
var errlog = Log.getLogger('err');
var runlog = Log.getLogger();
var othlog = Log.getLogger('oth');
var consoleLog = Log.getLogger('consolelog');


//dice服务...start
async function diceServer() {
    console.log("nextDiceBetId:", nextDiceBetId);
    nextDiceBetId = await myUtils.getNextDiceBetId(nextDiceBetId);
    
    setTimeout(async ()=>{
        await diceServer();
    },EnvPeople.DiceGameLotteryIntervalTime);
}

async function diceInit() {
    await diceServer();
}

diceInit();
