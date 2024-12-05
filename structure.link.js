var funcs = require("general.functions")
function getMasterLink(masterSpawn) {
    let links = masterSpawn.room.find(FIND_MY_STRUCTURES,{filter: function(structure) {
        return structure.structureType === STRUCTURE_LINK
    }})
    let link = 0
    let range = 999999
    for(let I in links) {
        if(funcs.getTrueDistance(links[I].pos,masterSpawn.pos)<range) {
            range = funcs.getTrueDistance(links[I].pos,masterSpawn.pos)
            link = links[I]
        }
    }
    return link
}
var code = {
    /**
     * 
     * @param {StructureLink} link
     */
    tick: function(link) {
        let spawn = link.room.getMasterSpawn()
        let masterLink = getMasterLink(spawn)
        if(masterLink!==link) {
            link.transferEnergy(masterLink)
        }
    }
}
module.exports = code