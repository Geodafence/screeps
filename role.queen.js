var code = {
    tick: function(creep) {
        if(creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
            creep.memory.state = "moving"
        }
        if(creep.store[RESOURCE_ENERGY] == 0 || creep.memory.state === undefined) {
            creep.memory.state = "grabbing"
        }
        if(creep.memory.state == "grabbing") {
            var target =  Game.getObjectById(creep.memory.spawnid).room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE)
                }
            })
            if(target) {
                target = target[0]
                if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target,{reusePath: 20})
                }
            }
        } else {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            })
            if(target) {
                if(target.length < 5) {
                    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN|| structure.structureType == STRUCTURE_TOWER) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    })
                }
            } else {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN|| structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500;
                    }
                })
            }
            let check = creep.room.find(FIND_HOSTILE_CREEPS);
            if(check.length > 0) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (structure) => {
                    return structure.structureType == STRUCTURE_TOWER
                }
            })
            }
            if(target) {
                if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target,{reusePath: 20})
                }
            }
        }
    }
}

module.exports = code