function reverseDirectionTo(target) {
        let reverseDict = {
                3: 7,          // RIGHT → LEFT
                7: 3,          // LEFT → RIGHT
                1: 5,          // TOP → BOTTOM
                5: 1,          // BOTTOM → TOP
                8: 4,          // TOP_LEFT → BOTTOM_LEFT
                6: 8,          // BOTTOM_LEFT → TOP_LEFT
                2: 4,          // TOP_RIGHT → BOTTOM_RIGHT
                4: 2           // BOTTOM_RIGHT → TOP_RIGHT
            }
    return reverseDict[creep.pos.getDirectionTo(target)]
}

function combatCalc(creep,target) {
    if(creep.saying === undefined) {
        lastAction = 0
    } else {
        lastAction = creep.saying
    }
    if(creep.getActiveBodyparts(HEAL) > 0) {
        if(creep.hits < creep.hitsMax*0.75) {
            if(lastAction != "HEAL" || creep.hits < creep.hitsMax*0.50) {
                creep.heal(creep)
                if(creep.pos.getRangeTo(target) < 8 && creep.hits < creep.hitsMax*0.50) {
                    let hide = creep.pos.findInRange(FIND_MY_STRUCTURES, 6, {filter: (structure) => {
                        return structure.structureType == STRUCTURE_RAMPART
                    }})
                    if(hide) {
                        creep.moveTo(hide[0])
                    } else {
                        creep.move(reverseDirectionTo(target))
                    }
                }
                creep.say("HEAL")
                return
            }
        }
        }
    if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
            if(creep.pos.getRangeTo(target) < 3) {
                let hide = creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter: (structure) => {
                    return structure.structureType == STRUCTURE_RAMPART
                }})
                if(hide.length > 0) {
                    creep.moveTo(hide[0])
                } else {
                    creep.move(reverseDirectionTo(target))
                }
            }
            if(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3) > 1) {
                creep.rangedMassAttack()
            } else creep.rangedAttack(target)
            if(creep.pos.getRangeTo(target) > 3) {
            creep.moveTo(target)
            }
        creep.say("RANGED_ATTACK")
    } else {
        if(creep.getActiveBodyparts(ATTACK) > 0) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.move(creep.pos.getDirectionTo(target))
                creep.say("ATTACK")
            }
        } else {
            creep.move(reverseDirectionTo(target))
        }
    }
    
}
var code = {
    run: function(creep) {
        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            creep.memory.stopmoving = 0;
            combatCalc(creep, closestHostile)
            return
        } 
        if(Game.flags.attack === undefined) {
            if(creep.hits < creep.hitsMax) creep.heal(creep)
            // Patrolling behavior
            if (creep.memory.patrolling === undefined) {
                var targetRoom;
                var targetCreep
                do {
                    targetRoom = Memory.longrangemining[Math.floor(Math.random() * Memory.miningrooms.length)];
                    targetCreep = targetRoom.creeps[Math.floor(Math.random() * targetRoom.creeps.length)]
                } while (targetRoom === creep.memory.lastRoom);

                creep.memory.targetCreep = targetCreep
                creep.memory.patrolling = targetRoom;
                creep.memory.lastRoom = targetRoom;
                creep.memory.move = [Math.floor(Math.random() * 50), Math.floor(Math.random() * 50)];
                creep.memory.wait = 0;
                creep.memory.TX = undefined
            }
            if(Game.creeps[creep.memory.targetCreep] === undefined) {
                creep.memory.patrolling = undefined
                return
            }
            if(creep.memory.TX === undefined) {
                creep.memory.TX = Game.creeps[creep.memory.targetCreep].pos.x
                creep.memory.TY = Game.creeps[creep.memory.targetCreep].pos.y
            }
            creep.moveTo(new RoomPosition(creep.memory.TX,creep.memory.TY,Game.creeps[creep.memory.targetCreep].room.name),{reusePath: 100,stroke: '#ff0000'})
            creep.memory.wait+=1
            if(creep.memory.wait > 120) {
                creep.memory.patrolling = undefined
            }
    } else {
        let theif
        if(Game.flags.attack.room === undefined) {
            theif = 1
        } else {
            theif = (Game.flags.attack.room.name !== creep.room.name)
        }
        if(theif) {
            creep.moveTo(Game.flags.attack,{reusePath: 40,stroke: '#ff0000'})
        } else {
            let target1 = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            let target2 = creep.room.find(FIND_HOSTILE_STRUCTURES);
            for(const t in target2) {
                I = target2[t]
                if(I.structureType == STRUCTURE_TOWER) {
                    target1 = null
                    target2 = [I]
                    break
                }
            }
            if(target1) {
                combatCalc(creep, target1)
            } else {
                let target2 = creep.room.find(FIND_HOSTILE_STRUCTURES);
                if(target2[0].structureType === STRUCTURE_CONTROLLER) {
                    target2 = target2[1]
                } else {
                    target2 = target2[0]
                }
                combatCalc(creep, target2)
            }
        }
    }
    }
};

module.exports = code;