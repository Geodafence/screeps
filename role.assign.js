var functiondata = {
    harvester: function(creepName) {
        Memory.harvesters.push(creepName);
    },
    builder: function(creepName) {
        Memory.builders.push(creepName);
    },
    combat: function(creepName) {
        Memory.fighters.push(creepName);
    },
    miner: function(creepName) {
        Memory.storedcreeps.push(creepName);
    },
    hauler: function(creepName) {
        Memory.haulers.push(creepName);
    },
    newid: function() {
        var cur = Memory.assignedids
        Memory.assignedids += 1
        return cur.toString();
    }
}
module.exports = functiondata
