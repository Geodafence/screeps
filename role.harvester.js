var register = require("general.sourceregistering");
const { filter } = require("lodash");
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var terminate = 0
        if(creep.memory.state === undefined) {
            creep.memory.state = "mining"
        }
        new RoomVisual(creep.room.name).text('Harvester, state: '+creep.memory.state, creep.pos.x, creep.pos.y+1, {align: 'center',font:0.3,color:'yellow',stroke:"white",strokeWidth:0.01}); 
	    if(creep.memory.state == "mining") {
            if(creep.memory.registeredsource === undefined || creep.memory.registeredsource == 0) {
                creep.moveTo(0,0,{reusePath: 200})
            }
            register.register("usedsources", creep)
            register.harvest(creep)
            if(creep.store.getFreeCapacity() == 0) creep.memory.state = "storing"
        } else {
            if(creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.state = "mining"
            }
            register.remove("usedsources", creep)
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||  (Memory.longrangemining[4].creeps.length > 0 && structure.structureType == STRUCTURE_STORAGE)|| (Memory.longrangemining[4].creeps.length > 0 && structure.structureType == STRUCTURE_TOWER)) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            targets.sort((a, b) => (a.structureType == STRUCTURE_STORAGE || a.structureType == STRUCTURE_TOWER) - (b.structureType == STRUCTURE_STORAGE || b.structureType == STRUCTURE_TOWER));
            if(creep.room.find(FIND_HOSTILE_CREEPS).length > 0) {
                let set = creep.room.find(FIND_STRUCTURES, {filter: function(struct) {
                    return struct.structureType == STRUCTURE_TOWER
                }})
                if(set.length > 0) {
                    targets = set
                }
            }
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {reusePath: 20,visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
         }
    }
};

module.exports = roleHarvester;
