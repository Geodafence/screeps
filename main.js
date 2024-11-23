// Comments are generated by ChatGPT, so they may be a little inaccurate

if("harvesters" in Memory != true) {
    // Initialization of memory properties for the first loop
    console.log("first time loop is restarted");
    Memory.longRangeBuilders = new Array();
    Memory.claimers = new Array();
    Memory.fighters = new Array();
    Memory.haulers = new Array();
    Memory.assignedids = 0;
    Memory.usedsources = new Array();
    Memory.buildersources = new Array();
    Memory.upgradersources = new Array();
    Memory.builderlevel = 1;
}
if("storedcreeps" in Memory != true) {
    // Initialization of memory properties for stored creeps and mining
    console.log("loading long range miners!");
    Memory.storedcreeps = [];
    Memory.segmentRequests = [];
    Memory.longrangemining = [];
    Memory.longrangeminingcreeps = [];
}

// Setup mining rooms and global update lists
Memory.miningrooms = [
    {room: "E52S19", usedSegment: 0},
    {room: "E53S17", usedSegment: 0},
    {room: "E53S18", usedSegment: 0},
    {room: "E51S19", usedSegment: 0}
];
global.nextupdate = [];
global.nexttick = [];

// Import necessary modules for various roles and functions
var harvestercode = require('role.harvester');
var unithandler = require("handler.newunits");
var buildercode = require("role.builder");
var combatcode = require("role.combat");
var register = require("general.sourceregistering");
var longbuild = require("role.longrangebuilder");
var minercode = require("role.longrangeminer");
var funcs = require("general.functions");
var haulercode = require("role.hauler")
require("./spawnUtils")
var queencode = require("role.queen")
var deficitcalc = require("deficitCalculator")
require('creeptalk')({
    'public': true,
    'language': require('creeptalk_silly')
  })
if(global.fixticks === undefined) {
    global.fixticks = 0
}
global.updatecache = 400
console.log("restarting loop");

module.exports.loop = function () {
    if(Game.cpu.bucket < 500) {
        console.log("extremely low cpu bucket, terminating")
        return
    }
    global.fixticks += 1
    global.updatecache += 1
    if(global.updatecache > 400) {
        console.log("updating cache")
        let full = 0
        for(const T in Memory.longrangemining) {
            let I = Memory.longrangemining[T]
            for(const name in I.creeps) {
                creep = Game.creeps[I.creeps[name]]
                if(creep === undefined) {

                } else {
                    let dist = funcs.getTrueDistance(new RoomPosition(Game.spawns.Spawn1.pos.x,Game.spawns.Spawn1.pos.y,Game.spawns.Spawn1.room.name),new RoomPosition(creep.pos.x,creep.pos.y,creep.room.name))
                    full += dist
                }
            }
        }
        Memory.haulerneeded = Math.round(full/2.5)
        global.updatecache = 0
    }
    let temp = 0
    if(temp > 0) {
        global.inDeficit = 1
        global.deficitLevel = Memory.storecache-temp
    } else  {
        global.inDeficit = 0
    }
    if(global.defenseNeeded == 1) {
        console.log("defense required")
    }
    if(temp > 5) {
        console.log("in major deficit, amount: "+temp)
    }
    // Loop through each spawn and manage units and tasks
    for(let spawnid in Game.spawns) {

        global.createdunit = 0
        let currentspawn = Game.spawns[spawnid];

        if(currentspawn.memory.harvesters === undefined) {
            currentspawn.memory = {
                harvesters: [],
                builders: [],
                builderallocations: { upgrade: 0, buildRoad: 0, general: 0 }
            }
        }
        // Cache the number of extensions in the spawn's room
        Memory.storecache = currentspawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION);
            }
        }).length;
        var towers = currentspawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER)
            }
        });
        for(const towerold in towers) {
            let tower = towers[towerold]
            const attackers = tower.room.find(FIND_HOSTILE_CREEPS)
            if(attackers.length > 0) {
                attackers.sort((a, b) => b.hits - a.hits);
                tower.attack(attackers[0])
            } else {
                const targets = tower.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax*0.75
                });
                
                // Sort by damage level (most damaged first)
                targets.sort((a, b) => a.hits - b.hits);
                
                // If damaged structures are found, repair the closest one
                if(targets.length > 0) {
                    tower.repair(targets[0])
                }
            }
            
        }
        // Set cache to 0 if the controller level is 1
        if(currentspawn.room.controller.level == 1) {
            Memory.storecache = 0;
        }
        global.kill = 0
        if(currentspawn.room.controller.level > 2) {
            let add = 0
            for(const temp in Memory.miningrooms) {
                const I = Memory.miningrooms[temp]
                if(I.room ==currentspawn.room.name) {
                    add = 1
                }
            }
            if(add == 0) {
                Memory.miningrooms.push({room:currentspawn.room.name, usedSegment: 0})
            }
        } else {
            if(Memory.miningrooms.includes({"room":currentspawn.room.name, usedSegment: 0})) {
                Memory.miningrooms = funcs.Lremove(Memory.miningrooms,{"room":currentspawn.room.name, usedSegment: 0})
            }
        }
        global.haulercreations = 0
        for(temp in Memory.longrangemining) {
            global.haulercreations += Memory.longrangemining[temp].creeps.length
        }
        // Check for new harvester, builder, and combat units
        currentspawn.queueCheck()
        unithandler.newharvcheck(spawnid);
        unithandler.newbuildcheck(spawnid);
        unithandler.newhaulercheck(spawnid);
        unithandler.newcombatcheck(spawnid);
        global.defenseNeeded = 0
        // Run through each harvester in memory and execute its tasks

        // ||||||||||||||||||||||
        // run for each unit type
        // ||||||||||||||||||||||
        if(Game.spawns[spawnid].memory.harvesters.length > 0) {
            Game.spawns[spawnid].memory.harvesters.forEach(item => harvesterforeach(item, spawnid));
        }
        // Run through each builder in memory and execute its tasks
        if(Game.spawns[spawnid].memory.builders.length > 0) {
            Game.spawns[spawnid].memory.builders.forEach(item => builderforeach(item, spawnid));
        }
        
        // Run through each hauler in memory and execute its tasks
        if(Memory.haulers.length > 0) {
            Memory.haulers.forEach(item => haulerforeach(item, spawnid));
        }
        for(temp in Memory.claimers) {
            let claimer = Game.creeps[Memory.claimers[temp]]
            if(claimer === undefined) {
                Memory.claimers = funcs.Lremove(Memory.claimers,temp)
                continue
            }
            if(claimer.memory.reserving !== undefined) {
                if(claimer.room.name !== claimer.memory.reserving) {
                    claimer.moveTo(new RoomPosition(25,25,claimer.memory.reserving),{reusePath:40})
                } else {
                    let check = claimer.room.find(FIND_STRUCTURES,{filter: function(structure) {
                        return structure.structureType == STRUCTURE_CONTROLLER
                    }})
                    if(check) {
                        if(claimer.reserveController(check[0]) == ERR_NOT_IN_RANGE) claimer.moveTo(check[0])
                    }
                }
            }   
        }
        for(temp in Memory.longRangeBuilders) {
            let Lbuilder  = Memory.longRangeBuilders[temp]
            longbuild.tick(Lbuilder)
        }

        if(currentspawn.memory.queen !== undefined) {
            if(currentspawn.memory.queen in Game.creeps) {
                queencode.tick(Game.creeps[currentspawn.memory.queen])
            } else {
                currentspawn.memory.queen = undefined
            }
        }
        if(currentspawn.memory.queen2 !== undefined) {
            if(currentspawn.memory.queen2 in Game.creeps) {
                queencode.tick(Game.creeps[currentspawn.memory.queen2])
            } else {
                currentspawn.memory.queen2 = undefined
            }
        }
    }


    // Run the miner code for long-range mining logic
    minercode.tick();
    // ||||||||||||||||||||||
    //  Unit type running end
    // ||||||||||||||||||||||

    // Clear stored creeps if the first stored creep is undefined
    if(Game.creeps[Memory.storedcreeps[0]] === undefined) {
        Memory.storedcreeps = [];
    } else {
        Game.creeps[Memory.storedcreeps[0]].moveTo(0,0,{reusePath: 40})
    }

    // Cleanup memory for creeps that no longer exist
    for(curcreep in Memory.creeps) {
        if(Game.creeps[curcreep] === undefined) {
            Memory.creeps[curcreep] = undefined;
        }
    }


    if(global.fixticks > 1000) {
        Memory.usedsources = new Array();
        Memory.buildersources = new Array();
        Memory.upgradersources = new Array();
        console.log("!! forcefully resetting source allocations, to fix any issues that arise while offline")
        global.fixticks = 0
    }

        // Run through each fighter in memory and execute its tasks
        if(Memory.fighters.length > 0) {
            Memory.fighters.forEach(item => combatforeach(item));
        }
    // Log CPU usage with different warnings based on usage level
    if(Game.cpu.getUsed() >= 20) {
        console.log("tf are you doing, you're at the max cpu! (" + Game.cpu.getUsed() + ")");
    }
}

// Function to handle tasks for each harvester
function harvesterforeach(item, spawntype) {
    if(item in Game.creeps) {
        if(Game.creeps[item].room == Game.spawns[spawntype].room) {
            // Renew harvester if it's near the end of its lifespan
            if(Game.creeps[item].ticksToLive < 1000) { 
                Game.spawns[spawntype].renewCreep(Game.creeps[item]);
            }
            // Execute harvester tasks
            if(global.kill==1) {
                register.remove("usedsources",Game.creeps[item])
                Game.creeps[item].suicide()
            } else {
                harvestercode.run(Game.creeps[item]);
            }
        } 
    } else {
        // Remove harvester from memory if it no longer exists
        Memory.creeps[item] = undefined;
        const index = Game.spawns[spawntype].memory.harvesters.indexOf(item);
        if (index > -1) {
            console.log("epic");
            Game.spawns[spawntype].memory.harvesters.splice(index, 1); 
        }
    }
}

// Function to handle tasks for each hauler
function haulerforeach(item, spawntype) {
    if(item in Game.creeps) {
            // Renew hauler if it's near the end of its lifespan
            if(Game.creeps[item].ticksToLive < 1000) { 
                Game.spawns[spawntype].renewCreep(Game.creeps[item]);
            }
            // Execute hauler tasks
            haulercode.tick(Game.creeps[item]);
    } else {
        // Remove harvester from memory if it no longer exists
        Memory.creeps[item] = undefined;
        const index = Memory.haulers.indexOf(item);
        if (index > -1) {
            console.log("epic");
            Memory.haulers.splice(index, 1); 
        }
    }
}

// Function to handle tasks for each builder
function builderforeach(item, spawntype) {
    if(item in Game.creeps) {
            // Renew builder if it's near the end of its lifespan
            if(Game.creeps[item].ticksToLive < 1000) { 
                Game.spawns[spawntype].renewCreep(Game.creeps[item]);
            }
            // Execute builder tasks
            buildercode.run(Game.creeps[item], spawntype);
    } else {
        // Manage memory cleanup and task allocations if builder no longer exists
        const index =Game.spawns[spawntype].memory.builders.indexOf(item);
        var data = Memory.creeps[item];
        data = {memory: data};
        Memory.creeps[item] = undefined;
        if(data.memory != undefined) {
            if(data.memory.task != undefined) {
                console.log(data.memory.task);
                Game.spawns[spawntype].memory.builderallocations[data.memory.task] -= 1;
                if(data.memory.task == 'general') {
                    register.remove("buildersources", data);
                }
                if(data.memory.task == 'upgrade') {
                    register.remove("upgradersources", data);
                }
                data.memory.task = undefined;
            }
        }
        if (index > -1) {
            console.log("test");
            Game.spawns[spawntype].memory.builders.splice(index, 1); 
        }
    }
}

// Function to handle tasks for each combat unit
function combatforeach(item) {
    if(item in Game.creeps) {
        // Renew combat unit if it's near the end of its lifespan
        // Execute combat unit tasks
        combatcode.run(Game.creeps[item]);
    } else {
        // Remove combat unit from memory if it no longer exists
        Memory.creeps[item] = undefined;
        const index = Memory.fighters.indexOf(item);
        if (index > -1) {
            Memory.fighters.splice(index, 1); 
        }
    }
}