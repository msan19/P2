function addForklift(forkliftInfo) {
    document.querySelector("#forklift-list").innerHTML += `<li>${forkliftInfo.id}</li>`;
}
window["socketManager"].on(PackageTypes.forkliftInfos, (forklifts) => {
    document.querySelector("#forklift-list").innerHTML = "";
    for (let key in forklifts) {
        addForklift(forklifts[key]);
    }
});

window["socketManager"].on(PackageTypes.forkliftInfo, (forklift) => {
    addForklift(forklift);
});