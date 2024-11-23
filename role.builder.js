var upgrading = require("allocation.upgrading")
var general = require("allocation.building")
var register = require("general.sourceregistering")
var code = {

    /** @param {Creep} creep **/
    run: function(creep, spawnname) {
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 2 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.general < 3 && creep.memory.task == undefined) {
            creep.memory.task = 'general'
            Game.spawns[spawnname].memory.builderallocations.general += 1
        }
        new RoomVisual(creep.room.name).text('Builder, task: '+creep.memory.task, creep.pos.x, creep.pos.y+1, {align: 'center',font:0.3,color:'orange',stroke:"white",strokeWidth:0.01}); 
        if(creep.memory.level < Memory.builderlevel) {
            if(creep.memory.task != undefined) {
                Game.spawns[spawnname].memory.builderallocations[creep.memory.task] -= 1
                if(creep.memory.task == 'general') {
                    register.remove("buildersources",creep)
                }
                if(creep.memory.task == 'upgrade') {
                    register.remove("upgradersources",creep);
                }
                creep.memory.task = undefined
            }
                creep.suicide()
        }
        if(creep.memory.task == 'upgrade') {
            upgrading.run(creep)
	    }
        if(creep.memory.task == 'general') {
            general.run(creep)
	    }
    }
};

module.exports = code;
