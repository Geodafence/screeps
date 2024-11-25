
let funcs = require("general.functions")
var pathDetector = function() {
    registerFunctions()
}
pathDetector.prototype.overrideFunctions = [
    "move"
]
pathDetector.prototype.wrapFunction = function (name, originalFunction) {
    return function wrappedFunction() {
      if(!!this.apply) {
        this.apply(name)
      }
      return originalFunction.apply(this, arguments);
    };
}
pathDetector.update = function() {
    for(I in Memory.pathItents) {
        try {
        let item = Memory.pathItents[I]
        item.decay+=1
        if(item.decay == 60) {
            item = false
        }
        if(item.usage > 5) {
            this.road(item.x,item.y,item.room)
        } 
        if(item !== false) {Memory.pathItents[I] = item} else {Memory.pathIntents.splice(I);return}
    } catch(e) {}
    }
}
pathDetector.prototype.road = function(x,y,r) {
    try {
        Game.rooms[r].createConstructionSite(x,y,STRUCTURE_ROAD)
    } catch(e) {}
}
pathDetector.prototype.applyFunctions = function() {
    for(var function_name of this.overrideFunctions) {
        Creep.prototype[function_name] = this.wrapFunction(function_name, Creep.prototype[function_name])
      }
      Creep.prototype.apply = function (group) { 
        let _new = 0
        for(T in Memory.pathIntents) {
            let item = Memory.pathIntents[T]
            if(item.x == this.pos.x && item.y == this.pos.y) {
                item.usage += 1
                item.decay = 0
                _new = 1
            }
            Memory.pathIntents[T] = item
        }
        if(!_new) {
            Memory.pathIntents.push({
                room: this.memory.room,
                x: this.pos.x,
                y: this.pos.y,
                usage: 0,
                decay: 0
            })
        }
      }
}