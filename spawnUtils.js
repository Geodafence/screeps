var funcs = require("general.functions")
var assign = require("role.assign")
StructureSpawn.prototype.queueCheck = function() {
    if(this.memory.queue === undefined) {
        this.memory.queue = []
    }
    var errorreg = null
    if(this.memory.queue.length > 0) {
        if(this.room.energyAvailable >= funcs.partcost(this.memory.queue[0].modules)) {

            if(this.spawning === null) { 
                var test = assign.newid()
                if(this.memory.queue[0].baseMemory !== null) {
                    errorreg = this.spawnCreep(
                        this.memory.queue[0].modules,
                        test,
                        this.memory.queue[0].baseMemory,
                    )
                } else {
                    errorreg = this.spawnCreep(
                        this.memory.queue[0].modules,
                        test
                    )
                }
                console.log("queue opened, attempting to use")
                if(errorreg == OK) {
                    console.log("dryrun worked, creating fr")
                global.createdunit = 1
                if(this.memory.queue[0].is == "claimer") {
                    Memory.claimers.push(test)
                }
                if(this.memory.queue[0].is == "LRB") {
                    Game.notify("your creep is done")
                    Memory.longRangeBuilders.push(test)
                }
                delete this.memory.queue[0]
            } else {
                console.log("ok nvm the dryrun failed with error: "+errorreg)
            }
        }
    }
}
    return errorreg
}
StructureSpawn.prototype.queueAppend = function(moduleData,memoryData,creepType,listId=null) {
    this.memory.queue.push({modules: moduleData,baseMemory:memoryData,is:creepType,listid: listId})
    return this.memory.queue.length
}