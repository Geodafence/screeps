

function getmasterspawn(creep) {
    return creep.room.find(FIND_MY_SPAWNS)[0]
}
var code = {
    /** 
     * @param {Creep} creep
    **/
    getrequest: function (creep) {
        if (getmasterspawn(creep).memory.itemrequests.length > 0) {
            if (creep.memory.fufilling === undefined) {
                console.log("AAAA")
                creep.memory.fufilling = getmasterspawn(creep).memory.itemrequests.pop()
            }

            if (Game.getObjectById(creep.memory.fufilling.storage).store[creep.memory.fufilling.request] < creep.memory.fufilling.amount) {
                getmasterspawn(creep).memory.itemrequests.push(creep.memory.fufilling)
                creep.memory.fufilling = undefined
            }
        }
    },
    /** 
     * @param {Creep} creep
    **/
    fufillrequest: function (creep) {
        if (creep.memory.fufilling !== undefined) {
            if (creep.store[creep.memory.fufilling.request] < creep.store.getCapacity()) {
                if (creep.memory.fufillStatus == "giving") {
                    creep.memory.fufilling.amount -= creep.store.getCapacity()
                }
                creep.memory.fufillStatus = "grabbing"
                if (creep.withdraw(Game.getObjectById(creep.memory.fufilling.storage), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.fufilling.storage))
                }
            } else {
                if (creep.memory.fufillStatus == "grabbing") {
                    creep.memory.fufillStatus = "giving"
                }
                if (creep.transfer(Game.getObjectById(creep.memory.fufilling.id), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.fufilling.id))
                }
            }
            if (creep.memory.fufilling.amount <= 0) {
                creep.memory.fufilling = undefined
            }
        }
    },
    sendrequest: function (building, am, type) {
        getmasterspawn(building).memory.itemrequests.splice(0, 0, {
            request: type,
            amount: am,
            id: building.id,
            storage: building.room.find(FIND_STRUCTURES, {
                filter: function (build) {
                    return build.structureType === STRUCTURE_STORAGE
                }
            })[0].id
        })
    }
}
module.exports = code