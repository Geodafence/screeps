

var code = {
    tick: function(creep) {
        if(creep.memory.room !== undefined) {
            if(creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.state = "moving";
            }
            if(creep.memory.state == "moving" && creep.store.getFreeCapacity() == 0) {
                creep.memory.state = "building";
            }
            if(creep.memory.state == "building") {
            if(creep.memory.room !== creep.room.name) {
                let moveto = new RoomPosition(25,25,creep.memory.room)
                creep.moveTo(moveto,{reusePath:40})
            } else {
                let find = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
                if(find) {
                    if(creep.build(find) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(find)
                    }
                }
            }
        } else {
            if(creep.withdraw(Game.getObjectById(creep.memory.spawnid).pos.findClosestByRange(FIND_MY_STRUCTURES,{filter: (struct) => {return struct.structureType == STRUCTURE_STORAGE}})) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.spawnid),{reusePath:40})
            }
        }
        } else {
            creep.say("need room")
        }
    }
}
module.exports = code