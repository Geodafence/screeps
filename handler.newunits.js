var assign = require("role.assign")
var register = require("general.sourceregistering")
var funcs = require("general.functions")
var code = {
    checkharvwant: function(ref) {
        return Game.spawns[ref].room.find(FIND_SOURCES).length+1;
    },
    newharvcheck: function(spawnname) {
        if(global.defenseNeeded == 1 || global.createdunit == 1) {
            return
        }
        var neededharvs = code.checkharvwant(spawnname)
        var allstores = Memory.storecache
        var allmodules
        var buildercost
        var allmodulelevels = [
            [MOVE,CARRY,WORK], 
            [MOVE,MOVE,CARRY,WORK,WORK],
            [MOVE,MOVE,CARRY,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK],
        ] 
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1 || (Memory.haulers.length < 2)) {
            allstores = 0
        }
        if(global.inDeficit == 1) {
            allstores = global.deficitLevel
        }

        allmodules = allmodulelevels[allstores]
        buildercost = 200+(50*allstores)
        if(allstores >= 4) {
            buildercost = 300+(50*allstores)
        }
        Memory.harvlevel = allstores
        if(!(neededharvs > Memory.spawns[spawnname].harvesters.length)) {
            var endearly = 0
            for(const I in Memory.spawns[spawnname].harvesters) {
                if(!endearly) {
                    var I2 = Memory.spawns[spawnname].harvesters[I]
                    var data = Memory.creeps[I2]
                    data = {memory: data}
                    var actualcreep = Game.creeps[I2]
                    try {
                    if(data.memory.level < Memory.harvlevel) { 
                            register.remove("usedsources",data)
                            Memory.spawns[spawnname].harvesters = funcs.Lremove(Memory.spawns[spawnname].harvesters,I2)
                            actualcreep.suicide()
                            endearly = 1
                    }
                } catch(e) {

                }
                }
            }
        }
        if(neededharvs > Memory.spawns[spawnname].harvesters.length) {
            if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
                if(Game.spawns[spawnname].spawning === null) {
                    console.log("ok harvester time")
                    if(code.createharv(allmodules, spawnname) == 0) {
                        global.createdunit = 1
                        return
                    }
                }
            }
        }
        allstores = Memory.storecache
        if(global.inDeficit == 1) {
            allstores = global.deficitLevel
        }
        let allstorescheck = Memory.storecache
        allmodulelevels = [
            [MOVE,MOVE,WORK,WORK], 
            [MOVE,WORK,WORK,WORK],
            [MOVE,MOVE,WORK,WORK,WORK],
            [MOVE,MOVE,MOVE,WORK,WORK,WORK],
            [MOVE,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK],
            [MOVE,WORK,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,WORK,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK],
        ] 
        var milestones = {20:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK]}
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1 || Memory.haulers.length < 2) {
            allstores = 0
            allstorescheck = allstores
        }
        allmodules = allmodulelevels[allstores]
        buildercost = 300+(50*allstores)
        for(am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allmodules = milestones[am]
                buildercost = funcs.partcost(allmodules)
            }
        }
        if(Memory.storedcreeps.length == 0 && Game.spawns[spawnname].memory.builderallocations.upgrade == 2 && (Memory.haulers.length >= global.haulercreations || Memory.longrangemining[0].creeps.length == 0)) {
            if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
                if(Game.spawns[spawnname].spawning === null) {
                    console.log("I require miner")
                    global.createdunit = 1
                    code.createminer(allmodules, spawnname)
                    return
                }
            }
        }
    },
    createharv: function(modules, spawnname) {
        var test = assign.newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(modules, test, {
            memory: {level: Memory.harvlevel}
        })
        if(errorreg == 0) {
            Memory.spawns[spawnname].harvesters.push(test)
        }
        return errorreg
    },
    createminer: function(modules, spawnname) {
        var test = assign.newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(modules, test)
        if(errorreg == 0) {
            Memory.storedcreeps[0] = test
        }
    },
    checkbuildwant: function(ref) {
        return Game.spawns[ref].room.find(FIND_SOURCES).length*2+1
    },
    newbuildcheck: function(spawnname) {
        if(global.createdunit == 1 || global.defenseNeeded == 1) {
            return
        }
        var allstores = Memory.storecache
        var allmodules
        var buildercost
        var allmodulelevels = [
            [WORK, WORK, CARRY, MOVE], 
            [WORK, WORK, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY,CARRY,MOVE, MOVE, MOVE],
            [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK],
            [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            [MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK],
        ] 
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1) {
            allstores = 0
        }
        allmodules = allmodulelevels[allstores]
        buildercost = 300+(50*allstores)

        Memory.builderlevel = allstores
        if(code.checkbuildwant(spawnname) > Memory.spawns[spawnname].builders.length) {
            if((code.checkharvwant(spawnname) <= Memory.spawns[spawnname].harvesters.length) ||(Game.spawns[spawnname].memory.builderallocations.upgrade == 0 && Memory.spawns[spawnname].harvesters.length != 0)) {
                    if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
                        if(Game.spawns[spawnname].spawning == null) {
                            global.createdunit = 1
                            code.createbuild(spawnname, allmodules)
                        }
                    }
                }
        }
    },
    newhaulercheck: function(spawnname) {
        if(global.createdunit == 1 || global.defenseNeeded == 1) {
            return
        }
        var allstores = Memory.storecache
        var allmodules
        var buildercost
        let allstorescheck = Memory.storecache
        var allmodulelevels = [
            [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], 
            [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        ] 
        var milestones = {20:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}
        if(global.inDeficit == 1) {
            allstores = global.deficitLevel
        }
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1|| (Memory.haulers.length < 2)) {
            allstores = 0
            allstorescheck = allstores
        }
        allmodules = allmodulelevels[allstores]
        buildercost = allmodules.length*50
        for(am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allmodules = milestones[am]
                buildercost = funcs.partcost(allmodules)
            }
        }
        Memory.haulerlevel = allstores
        if(code.checkbuildwant(spawnname) <= Memory.spawns[spawnname].builders.length ||Memory.haulers.length < 3) {
            if((code.checkharvwant(spawnname) <= Memory.spawns[spawnname].harvesters.length)) {
                    if(Game.spawns[spawnname].room.energyAvailable >= buildercost && Memory.haulers.length < Math.round(Memory.haulerneeded/(allmodules.length/2))) {
                        if(Game.spawns[spawnname].spawning == null) {
                            global.createdunit = 1
                            code.createhauler(spawnname, allmodules)
                            return
                        }
                    }
                }
        }
        if((Memory.spawns[spawnname].queen === undefined || Memory.spawns[spawnname].queen2 === undefined)&& Game.spawns[spawnname].room.controller.level > 3) {
            if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
                if(Game.spawns[spawnname].spawning == null) {
                    global.createdunit = 1
                    code.createqueen(spawnname, allmodules)
                    return
                }
            }
}
    },
    newcombatcheck: function(spawnname) {
        if(global.createdunit == 1) {
            return
        }
        var allstores = Memory.storecache
        var allmodules
        var buildercost
        let allstorescheck = Memory.storecache
        var allmodulelevels = [
        [TOUGH, MOVE, ATTACK, ATTACK, MOVE], 
        [TOUGH, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, TOUGH,MOVE, MOVE, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, TOUGH, MOVE, MOVE, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH,MOVE, MOVE, MOVE, TOUGH, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH,TOUGH,MOVE, MOVE, MOVE, TOUGH, ATTACK, RANGED_ATTACK, MOVE]
        [TOUGH,TOUGH,MOVE, MOVE, MOVE, TOUGH, ATTACK, RANGED_ATTACK, MOVE]
        ]
        var milestones = {20:[TOUGH,TOUGH,TOUGH,TOUGH,MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,MOVE,HEAL],30:[TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL]}
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1

        }
        if(Game.spawns[spawnname].room.controller.level == 1) {
            allstores = 0
            allstorescheck = allstores
        }
        allmodules = allmodulelevels[allstores]
        buildercost = 299+(50*allstores)
        for(am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allmodules = milestones[am]
                buildercost = funcs.partcost(allmodules)
            }
        }
        Memory.combatlevel = allstores
        if((code.checkbuildwant(spawnname)<= Memory.spawns[spawnname].builders.length && Memory.fighters.length < 6)|| global.defenseNeeded == 1) {
            if((code.checkharvwant(spawnname) <= Memory.spawns[spawnname].harvesters.length)|| global.defenseNeeded == 1) {
                    if((Game.spawns[spawnname].room.energyAvailable >= buildercost) && (Memory.storedcreeps.length >= 1|| global.defenseNeeded == 1)) {
                        if(Game.spawns[spawnname].spawning == null) {
                            global.createdunit = 1
                            console.log(code.createcombat(spawnname, allmodules))
                        }
                    }
                }
        }
    },
    createqueen: function(spawnname, moduledata) {
        var test = assign.newid()
        console.log("attemping to create a creep with id: "+ test)
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {spawnid: Game.spawns[spawnname].id}
        })
        console.log("errorlog: "+errorreg)
        if(errorreg == 0) {
            if(Memory.spawns[spawnname].queen === undefined) {
                Memory.spawns[spawnname].queen = test
            } else if(Memory.spawns[spawnname].queen2 === undefined) {
                Memory.spawns[spawnname].queen2 = test
            }
        }
    },
    createhauler: function(spawnname, moduledata) {
        var test = assign.newid()
        console.log("attemping to create a creep with id: "+ test)
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {level: Memory.haulerlevel,spawnid: Game.spawns[spawnname].id}
        })
        console.log("errorlog: "+errorreg)
        if(errorreg == 0) {
            assign.hauler(test);
        }
    },
    createbuild: function(spawnname, moduledata) {
        var test = assign.newid()
        console.log("attemping to create a creep with id: "+ test)
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {level: Memory.builderlevel}
        })
        console.log("errorlog: "+errorreg)
        if(errorreg == 0) {
            Memory.spawns[spawnname].builders.push(test)
        }
    },
    createcombat: function(spawnname, moduledata) {
        var test = assign.newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {level: Memory.combatlevel}
        })
        if(errorreg == 0) {
        assign.combat(test);
        }
        return errorreg
    }
}
module.exports = code