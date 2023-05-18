
export default class PrefabManager {
    private static loadedCount: number = 0;

    public static humanPrefabs: cc.Prefab[];
    public static bossPrefabs: cc.Prefab[];
    public static monsterPrefab: cc.Prefab;
    public static undeadPrefab: cc.Prefab;
    public static towerPrefabs: cc.Prefab[];
    public static towerBulletPrefabs: cc.Prefab[];
    public static doorFrontPrefabs: cc.Prefab[];
    public static doorBackPrefabs: cc.Prefab[];
    public static stonePrefab: cc.Prefab;
    public static parachutePrefab: cc.Prefab;



    public static loadPrefab() {
        cc.resources.loadDir("prefabs/human", (e, prefabs: cc.Prefab[]) => {
            if (e) {
                console.log(e);
                return;
            }
            this.humanPrefabs = prefabs;
            this.loadedCount++;
            console.log("humanPrefabs：", this.humanPrefabs);
        })
        cc.resources.loadDir("prefabs/boss", (e, prefabs: cc.Prefab[]) => {
            if (e) {
                console.log(e);
                return;
            }
            let temp = prefabs.sort((a, b) => {
                return Number(a.name.split("_")[1]) - Number(b.name.split("_")[1]);
            })
            this.bossPrefabs = temp;
            this.loadedCount++;
            //  console.log("towerPrefabs", this.towerPrefabs);
        })
        cc.resources.load("prefabs/monster/monster_1", (e, prefab: cc.Prefab) => {
            if (e) {
                console.log(e);
                return;
            }
            this.monsterPrefab = prefab;
            this.loadedCount++;
            // console.log("monsterPrefab", this.monsterPrefab);
        })
        cc.resources.load("prefabs/undead/undead_1", (e, prefab: cc.Prefab) => {
            if (e) {
                console.log(e);
                return;
            }
            this.undeadPrefab = prefab;
            this.loadedCount++;
            //  console.log("undeadPrefab", this.undeadPrefab);
        })
        cc.resources.loadDir("prefabs/tower", (e, prefabs: cc.Prefab[]) => {
            if (e) {
                console.log(e);
                return;
            }
            let temp = prefabs.sort((a, b) => {
                return Number(a.name.split("_")[1]) - Number(b.name.split("_")[1]);
            })
            this.towerPrefabs = temp;
            this.loadedCount++;
            //  console.log("towerPrefabs", this.towerPrefabs);
        })
        cc.resources.loadDir("prefabs/towerBullet", (e, prefabs: cc.Prefab[]) => {
            if (e) {
                console.log(e);
                return;
            }
            let temp = prefabs.sort((a, b) => {
                return Number(a.name.split("_")[1]) - Number(b.name.split("_")[1]);
            })
            this.towerBulletPrefabs = temp;
            this.loadedCount++;
            // console.log("towerBulletPrefabs", this.towerBulletPrefabs);
        })
        cc.resources.load("prefabs/Parachute", (e, prefabs: cc.Prefab) => {
            if (e) {
                console.log(e);
                return;
            }
            this.parachutePrefab = prefabs;
            this.loadedCount++;
            // console.log("towerBulletPrefabs", this.towerBulletPrefabs);
        })
        cc.resources.loadDir("prefabs/door_front", (e, prefabs: cc.Prefab[]) => {
            if (e) {
                console.log(e);
                return;
            }
            let temp = prefabs.sort((a, b) => {
                return Number(a.name.split("_")[1]) - Number(b.name.split("_")[1]);
            })
            this.doorFrontPrefabs = temp;
            this.loadedCount++;
            //  console.log("towerPrefabs", this.towerPrefabs);
        })
        cc.resources.loadDir("prefabs/door_back", (e, prefabs: cc.Prefab[]) => {
            if (e) {
                console.log(e);
                return;
            }
            let temp = prefabs.sort((a, b) => {
                return Number(a.name.split("_")[1]) - Number(b.name.split("_")[1]);
            })
            this.doorBackPrefabs = temp;
            this.loadedCount++;
            //  console.log("towerPrefabs", this.towerPrefabs);
        })
    }

    public static isPrefabLoadedAll() {
        return this.loadedCount == 9;
    }
}
