var code = {
    calcpricefor: function(type) {
        let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: type});
        let price = 0
        let points = 0
        for(let cost in orders) {
            points+=1
            price+=orders[cost]
        }
        let val = Math.ceil(price/points)
        return val
    },
    getBuysInRange: function(val,type) {
        let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: type});
        for(let item in orders) {
            let dict = orders[item]
            if(price) {
                
            }
        }
    }
}