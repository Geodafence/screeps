
var request =require("item-request-lib");
var code = {
    calcpricefor: function(type) {
        //Outlier prevention doesn't work!
        //let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: type});
        let orders = Game.market.getHistory(type);
        let price = 0
        let points = 0
        for(let cost in orders) {
            points+=1
            price+=orders[cost].avgPrice
        }
        /*
        Outlier prevention doesn't work!

        for(let cost in orders) {
            let preventoutliers=Math.ceil(price/points)
            if(preventoutliers) {
                console.log(preventoutliers)
                if(orders[cost].price<=preventoutliers+6&&orders[cost].price>=preventoutliers-6) {
                    points+=1
                    price+=orders[cost].price
                } else {
                }
            } else {
                if(orders[cost].price<200) {
                    points+=1
                    price+=orders[cost].price
                }
            }
        }*/
        let val = Math.ceil(price/points)
        return val
    },
    getBuysInRange: function(val,type,build) {
        let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: type});
        let validorders=[]
        for(let item in orders) {
            let dict = orders[item]
            if(dict.price>=val&&dict.remainingAmount<5000&&Game.market.calcTransactionCost(dict.remainingAmount, build.room.name, dict.roomName)<=900) {
                validorders.push(dict)
            }
        }
        validorders.sort((a,b)=> b.price-a.price)
        return validorders
    },
    getBestDeal: function(build,type) {
        let range = this.calcpricefor(type)
        let best = this.getBuysInRange(range,type,build)[0]
        if(best===undefined) {
            //ok that didn't work, retrying with a lower price range
            range-=3
            best = this.getBuysInRange(range,type,build)[0]
        }
        if(best===undefined) {
            //still?! Trying even lower
            range-=2
            best = this.getBuysInRange(range,type,build)[0]
        }
        return best
    },
    /**
     * 
     * @param {StructureTerminal} building 
     */
    tick: function(building) {
        if(global.restartEco!==undefined) {
            return
        }
        if(Memory.structures===undefined) {
            Memory.structures = {}
        }
        if(Memory.structures[building.id]===undefined) {
            Memory.structures[building.id]={}
        }
        if(Memory.structures[building.id].marketStatus===undefined) {
            Memory.structures[building.id].marketStatus=this.getBestDeal(building,RESOURCE_OXYGEN)
            if(Memory.structures[building.id].marketStatus!==undefined) {
                request.removerequests(building)
                request.sendrequest(building,Memory.structures[building.id].marketStatus.remainingAmount,RESOURCE_OXYGEN,"grab")
                request.sendrequest(building,Game.market.calcTransactionCost(Memory.structures[building.id].marketStatus.remainingAmount,building.room.name,Memory.structures[building.id].marketStatus.roomName),RESOURCE_ENERGY,"grab")
            }
        } else {
            if(Game.market.getOrderById(Memory.structures[building.id].marketStatus.id)===undefined) {
                Memory.structures[building.id].marketStatus = undefined
            }
            if(building.store[RESOURCE_OXYGEN] >= Memory.structures[building.id].marketStatus.remainingAmount 
                && building.store[RESOURCE_ENERGY] >= Game.market.calcTransactionCost(Memory.structures[building.id].marketStatus.remainingAmount, building.room.name, Memory.structures[building.id].marketStatus.roomName)) {
                 Game.market.deal(Memory.structures[building.id].marketStatus.id, Memory.structures[building.id].marketStatus.remainingAmount, building.room.name);
                 Memory.structures[building.id].marketStatus=undefined
             }
        }
    }
}
module.exports = code