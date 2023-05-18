import Boss from "../Role/Boss";
import Human from "../Role/Human";
import Monster from "../Role/Monster";
import Room from "../Role/Room";
import Tools from "../Tools";
import Undead from "../Role/Undead";
import Tower from "../Role/Tower";
import PrefabManager from "./PrefabManager";
import UIManager from "./UIManager";

cc.macro.CLEANUP_IMAGE_CACHE = false;
cc.dynamicAtlasManager.enabled = true;

const { ccclass, property } = cc._decorator;
@ccclass
export default class GameManager extends cc.Component {

    @property(cc.Node)
    mapLayer: cc.Node = null;

    @property(UIManager)
    uiManager: UIManager = null;

    eventNode: cc.Node = null;
    rooms: Room[] = [];
    boss: Boss;
    bossTargetRoom: Room;
    humans: Human[] = [];
    monsters: Monster[] = [];
    undeads: Undead[] = [];
    humanParent: cc.Node = null;
    monsterParent: cc.Node = null;

    humanRoadPos: cc.Node = null;
    monsterRoadPos: cc.Node = null;
    parachutePos: cc.Node = null;

    isLoadedAll: boolean;
    gameState: string = null;
    targetRoomIndex: number = 0;
    isGameOver: boolean = false;
    bossTarget: number[] = [0, 1, 2, 3];
    isBossEnter: boolean = false;


    onLoad() {
        this.eventNode = cc.find("EventNode");
        this.humanParent = this.mapLayer.getChildByName("HumanParent");
        this.monsterParent = this.mapLayer.getChildByName("MonsterParent");
        this.humanRoadPos = this.mapLayer.getChildByName("HumanRoadPos");
        this.monsterRoadPos = this.mapLayer.getChildByName("MonsterRoadPos");

        this.eventNode.on("getCommand", this.onGetCommand_test2, this);
        this.eventNode.on("bossEnter", this.onBossEnter, this);
        this.isLoadedAll = false;
        PrefabManager.loadPrefab();
    }

    update(dt) {
        if (PrefabManager.isPrefabLoadedAll() && !this.isLoadedAll) {
            this.isLoadedAll = true;
            this.sceneInit();
        }
    }


    sceneInit() {
        this.uiManager.init();
        this.eventNode.emit("init");
        this.rooms = [];
        let roomsNode = this.mapLayer.getChildByName("Room");
        for (let i = 0; i < roomsNode.children.length; i++) {
            let room = new Room(roomsNode.children[i]);
            this.rooms.push(room);
        }
        // this.rooms = Tools.shuffle(this.rooms);
        this.bossTarget = Tools.shuffle(this.bossTarget);
        this.targetRoomIndex = 0;
        if (this.boss) {
            this.boss.die();
            this.boss = null;
        }
        if (this.monsters.length > 0) {
            for (let monster of this.monsters) {
                monster.die();
            }
            this.monsters = [];
        }
        if (this.humans.length > 0) {
            for (let human of this.humans) {
                human.die();
            }
            this.humans = [];
        }
        this.monsterParent.removeAllChildren();
        this.humanParent.removeAllChildren();

        this.isGameOver = false;
        console.log("游戏场景初始化完毕,可以输入指令[开始游戏]!!!");
        this.eventNode.emit("canGetCommand");
        this.isBossEnter = false;
        let monsterBornPos = this.monsterRoadPos.getChildByName("BornPos").position;
        this.boss = new Boss(this.monsterParent, monsterBornPos);
    }


    onGetCommand(name: string, command: string) {
        if (this.isGameOver) {
            return;
        }
        let humanBornPos = this.humanRoadPos.getChildByName("BornPos").position;
        let monsterBornPos = this.monsterRoadPos.getChildByName("BornPos").position;
        let commandShowWord: string = null;
        switch (command) {
            //todo：加入人类阵营
            case "1":
            case "2":
            case "3":
            case "4":
                let roomId = Number(command) - 1;
                if (this.rooms[roomId].isDead) {
                    console.log("房间已经被破坏，不能进入");
                    return;
                }
                let addHuman = this.humans.find(human => human.name == name)
                if (addHuman && !addHuman.isDead) {
                    console.log("玩家已经在场了");
                    return;
                }
                let human = new Human(name, this.humanParent, humanBornPos);
                human.MoveToRoom(this.rooms[roomId]);
                this.humans.push(human);
                break;
            //todo：加入怪物阵营
            case "4.1":
                console.log("降落伞");
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        let addHuman = this.humans.find(human => human.name == name)
                        if (addHuman && !addHuman.isDead) {
                            console.log("玩家已经在场了");
                            return;
                        }
                        if (this.rooms[i].isDead) {
                            console.log("房间已经被破坏，不能进入");
                            return;
                        }
                        let name = "P-" + String(i) + "-" + String(j);
                        let human = new Human(name, this.humanParent, humanBornPos);
                        let parachuteNode = cc.instantiate(PrefabManager.parachutePrefab);
                        parachuteNode.setParent(this.mapLayer);
                        human.MoveToRoom(this.rooms[i], true, parachuteNode);
                        this.humans.push(human);
                    }

                }
                break;
            case "5":
                // let addMonster = this.monsters.find(monster => monster.name == name)
                // if (addMonster && !addMonster.isDead) {
                //     console.log("玩家已经在场了");
                //     return;
                // }
                // let monster = new Monster(name, this.monsterParent, monsterBornPos);
                // let callback = () => {
                //     if (this.boss) {
                //         monster.boss = this.boss;
                //         this.unschedule(callback);
                //     }
                // }
                // this.schedule(callback, 1);
                // this.monsters.push(monster);
                // //若boss已在场
                // monster.moveToBoss();
                for (let i = 0; i < 20; i++) {
                    let addMonster = this.monsters.find(monster => monster.name == name)
                    if (addMonster && !addMonster.isDead) {
                        console.log("玩家已经在场了");
                        return;
                    }
                    let name = "m-" + i;
                    let monster = new Monster(name, this.monsterParent, monsterBornPos);
                    let callback = () => {
                        if (this.boss) {
                            monster.boss = this.boss;
                            this.unschedule(callback);
                        }
                    }
                    this.schedule(callback, 1);
                    this.monsters.push(monster);
                    //若boss已在场
                    monster.moveToBoss();
                }
                break;
            //todo：人类攻击怪物或boss
            case "攻击":
                //如果boss不在场，则不攻击
                if (!this.boss) {
                    return;
                }
                //根据名字找到玩家
                let atkHuman = this.humans.find(human => human.name == name)
                if (!atkHuman || atkHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                //找出所有可攻击的目标
                let canAtkTargets = [];
                canAtkTargets.push(this.boss);
                if (this.monsters.length > 0) {
                    for (let monster of this.monsters) {
                        if (!monster.isDead) {
                            canAtkTargets.push(monster);
                        }
                        if (monster.undeads.length > 0) {
                            for (let undead of monster.undeads) {
                                if (!undead.isDead) {
                                    canAtkTargets.push(undead);
                                }
                            }
                        }
                    }
                }
                if (canAtkTargets.length == 0) {
                    console.log("没有可以攻击的目标");
                    return;
                }
                let atkTargetIndex = Tools.getRandomNum(0, canAtkTargets.length - 1);
                atkHuman.atkBossOrMonsterOrUndead(canAtkTargets[atkTargetIndex]);
                break;
            //todo：给有人的房间加护盾
            case "房间护盾":
                let addShieldHuman = this.humans.find(human => human.name == name)
                if (!addShieldHuman || addShieldHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间增加了护盾";
                this.uiManager.showTips("humanCommand", commandShowWord);
                addShieldHuman.room.addDoorShield();
                break;
            //todo：给有人的房间回血
            case "房门回血":
                let addReHpHuman = this.humans.find(human => human.name == name)
                if (!addReHpHuman || addReHpHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房门回复了血量";
                this.uiManager.showTips("humanCommand", commandShowWord);
                addReHpHuman.room.addDoorHp();
                break;
            //todo：给有人的房间建造炮塔
            case "建造炮塔":
                let canBuildHuman = this.humans.find(human => human.name == name)
                if (!canBuildHuman || canBuildHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间建造升级了炮塔";
                this.uiManager.showTips("humanCommand", commandShowWord);
                let towerIndex = Tools.getRandomNum(0, canBuildHuman.room.towers.length - 1);
                canBuildHuman.room.towers[towerIndex].towerBuildOrLevelUp();
                break;
            //todo：给有人的房间进化炮塔
            case "进化炮塔":
                let canChangeTowerHuman = this.humans.find(human => human.name == name)
                if (!canChangeTowerHuman || canChangeTowerHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间进化了炮塔";
                this.uiManager.showTips("humanCommand", commandShowWord);
                let changeTowerIndex = Tools.getRandomNum(0, canChangeTowerHuman.room.towers.length - 1);
                canChangeTowerHuman.room.towers[changeTowerIndex].changeToBestTower();
                break;
            //todo：给有人的房间升级大门
            case "升级大门":
                let canLevelUpDoorHuman = this.humans.find(human => human.name == name)
                if (!canLevelUpDoorHuman || canLevelUpDoorHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间升级了大门";
                this.uiManager.showTips("humanCommand", commandShowWord);
                canLevelUpDoorHuman.room.levelUpDoor();
                break;
            //todo：给有人的房间升级一个炮塔至最高级
            case "神秘空投":
                let canMaxTowerHuman = this.humans.find(human => human.name == name)
                if (!canMaxTowerHuman || canMaxTowerHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间进化了一个终极炮塔";
                this.uiManager.showTips("humanCommand", commandShowWord);
                let canMaxTowers: Tower[] = [];
                for (let i = 0; i < canMaxTowerHuman.room.towers.length; i++) {
                    if (canMaxTowerHuman.room.towers[i].changeLevel < 5) {
                        canMaxTowers.push(canMaxTowerHuman.room.towers[i]);
                    }
                }
                if (canMaxTowers.length == 0) {
                    return;
                }
                let canMaxTowerIndex = Tools.getRandomNum(0, canMaxTowers.length - 1);
                canMaxTowers[canMaxTowerIndex].changeToBestTower();
                break;
            //todo：召唤一个亡灵
            case "召唤亡灵":
                let canCallUndeadMonster = this.monsters.find(monster => monster.name == name)
                if (!canCallUndeadMonster || !canCallUndeadMonster.isDead) {
                    console.log("玩家未加入游戏或还未死亡");
                    return;
                }
                commandShowWord = "[" + name + "]召唤了一个亡灵";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                canCallUndeadMonster.callUndead();
                break;
            //todo：给boss加血
            case "boss加血":
                let canAddHpMonster = this.monsters.find(monster => monster.name == name)
                if (!canAddHpMonster || canAddHpMonster.isDead) {
                    console.log("玩家未加入游戏或已死亡");
                    return;
                }
                commandShowWord = "[" + name + "]给boss回复了血量";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                canAddHpMonster.addHp();
                break;
            default:
                console.log("指令无效");
                break;
        }
    }

    onGetCommand_test(name: string, command: string) {
        if (this.isGameOver) {
            return;
        }
        let humanBornPos = this.humanRoadPos.getChildByName("BornPos").position;
        let monsterBornPos = this.monsterRoadPos.getChildByName("BornPos").position;
        let commandShowWord: string = null;
        switch (command) {
            //todo：加入人类阵营
            case "1":
            case "2":
            case "3":
            case "4":
                //todo：降落伞加入
                if (this.isBossEnter) {
                    for (let i = 1; i < 5; i++) {
                        if (this.rooms[i - 1].isDead) {
                            console.log("房间---" + i + "已经被破坏，不能进入");
                            continue;
                        }
                        for (let j = 21; j < 26; j++) {
                            let addHuman = this.humans.find(human => human.name == name)
                            if (addHuman && !addHuman.isDead) {
                                console.log("玩家已经在场了");
                                return;
                            }
                            if (this.rooms[i - 1].isDead) {
                                console.log("房间已经被破坏，不能进入");
                                return;
                            }
                            let name: string = String(i) + "-" + String(j);
                            let human = new Human(name, this.humanParent, humanBornPos);
                            let parachuteNode = cc.instantiate(PrefabManager.parachutePrefab);
                            parachuteNode.setParent(this.mapLayer);
                            human.MoveToRoom(this.rooms[i - 1], true, parachuteNode);
                            this.humans.push(human);
                        }

                    }
                } else {
                    //todo：正常入场
                    for (let i = 1; i < 5; i++) {
                        if (this.rooms[i - 1].isDead) {
                            console.log("房间---" + i + "房间已经被破坏，不能进入");
                            continue;
                        }
                        for (let j = 1; j < 21; j++) {
                            let addHuman = this.humans.find(human => human.name == name)
                            if (addHuman && !addHuman.isDead) {
                                console.log("玩家已经在场了");
                                return;
                            }
                            let name: string = j < 10 ? String(i) + "-" + "0" + String(j) : String(i) + "-" + String(j);
                            let human = new Human(name, this.humanParent, humanBornPos);
                            human.MoveToRoom(this.rooms[i - 1]);
                            this.humans.push(human);
                        }

                    }
                }

                console.log(this.humans);
                break;
            //todo：降落伞加入
            case "4.1":
                console.log("降落伞");
                for (let i = 1; i < 5; i++) {
                    if (this.rooms[i - 1].isDead) {
                        console.log("房间---" + i + "已经被破坏，不能进入");
                        continue;
                    }
                    for (let j = 21; j < 26; j++) {
                        let addHuman = this.humans.find(human => human.name == name)
                        if (addHuman && !addHuman.isDead) {
                            console.log("玩家已经在场了");
                            return;
                        }
                        if (this.rooms[i - 1].isDead) {
                            console.log("房间已经被破坏，不能进入");
                            return;
                        }
                        let name: string = String(i) + "-" + String(j);
                        let human = new Human(name, this.humanParent, humanBornPos);
                        let parachuteNode = cc.instantiate(PrefabManager.parachutePrefab);
                        parachuteNode.setParent(this.mapLayer);
                        human.MoveToRoom(this.rooms[i - 1], true, parachuteNode);
                        this.humans.push(human);
                    }

                }
                console.log(this.humans);
                break;
            //todo：加入怪物阵营
            case "5":
                for (let i = 1; i < 21; i++) {
                    let addMonster = this.monsters.find(monster => monster.name == name)
                    if (addMonster && !addMonster.isDead) {
                        console.log("玩家已经在场了");
                        return;
                    }
                    let name = i < 10 ? "m-0" + i : "m-" + i;
                    let monster = new Monster(name, this.monsterParent, monsterBornPos);
                    let callback = () => {
                        if (this.boss) {
                            monster.boss = this.boss;
                            this.unschedule(callback);
                        }
                    }
                    this.schedule(callback, 1);
                    this.monsters.push(monster);
                    //若boss已在场
                    monster.moveToBoss();
                }
                break;
            //todo：人类攻击怪物或boss
            case "攻击":
                //如果boss不在场，则不攻击
                if (!this.boss) {
                    return;
                }
                //根据名字找到玩家
                let atkHuman = this.humans.find(human => human.name == name)
                if (!atkHuman || atkHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                //找出所有可攻击的目标
                let canAtkTargets = [];
                canAtkTargets.push(this.boss);
                if (this.monsters.length > 0) {
                    for (let monster of this.monsters) {
                        if (!monster.isDead) {
                            canAtkTargets.push(monster);
                        }
                        if (monster.undeads.length > 0) {
                            for (let undead of monster.undeads) {
                                if (!undead.isDead) {
                                    canAtkTargets.push(undead);
                                }
                            }
                        }
                    }
                }
                if (canAtkTargets.length == 0) {
                    console.log("没有可以攻击的目标");
                    return;
                }
                let atkTargetIndex = Tools.getRandomNum(0, canAtkTargets.length - 1);
                atkHuman.atkBossOrMonsterOrUndead(canAtkTargets[atkTargetIndex]);
                break;
            //todo：给有人的房间加护盾
            case "房间护盾":
                let addShieldHuman = this.humans.find(human => human.name == name)
                if (!addShieldHuman || addShieldHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间增加了护盾";
                this.uiManager.showTips("humanCommand", commandShowWord);
                addShieldHuman.room.addDoorShield();
                break;
            //todo：给有人的房间回血
            case "房门回血":
                let addReHpHuman = this.humans.find(human => human.name == name)
                if (!addReHpHuman || addReHpHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房门回复了血量";
                this.uiManager.showTips("humanCommand", commandShowWord);
                addReHpHuman.addRoomHp();
                break;
            //todo：给房间建造炮塔:有未启动的炮塔时
            //todo：给房间升级炮塔:炮塔全部启动时
            case "建造炮塔":
                let canBuildHuman = this.humans.find(human => human.name == name)
                if (!canBuildHuman || canBuildHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                let canBuildTowers: Tower[] = [];
                for (let tower of canBuildHuman.room.towers) {
                    if (tower.level == 0 && tower.changeLevel == 0) {
                        canBuildTowers.push(tower);
                    }
                }
                let towerIndex;
                if (canBuildTowers.length > 0) {
                    commandShowWord = "[" + name + "]为房间建造了炮塔";
                    towerIndex = Tools.getRandomNum(0, canBuildTowers.length - 1);
                    canBuildTowers[towerIndex].towerBuildOrLevelUp();
                } else {
                    commandShowWord = "[" + name + "]为房间建造升级了炮塔";
                    towerIndex = Tools.getRandomNum(0, canBuildHuman.room.towers.length - 1);
                    canBuildHuman.room.towers[towerIndex].towerBuildOrLevelUp();
                }
                this.uiManager.showTips("humanCommand", commandShowWord);
                break;
            //todo：给有人的房间进化炮塔
            case "进化炮塔":
                let canChangeTowerHuman = this.humans.find(human => human.name == name)
                if (!canChangeTowerHuman || canChangeTowerHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                let canChangeTowers: Tower[] = [];
                for (let tower of canChangeTowerHuman.room.towers) {
                    if (tower.level > 0 && tower.changeLevel < 5) {
                        canChangeTowers.push(tower);
                    }
                }
                if (canChangeTowers.length == 0) {
                    return;
                }
                commandShowWord = "[" + name + "]为房间进化了炮塔";
                this.uiManager.showTips("humanCommand", commandShowWord);
                let changeTowerIndex = Tools.getRandomNum(0, canChangeTowers.length - 1);
                canChangeTowers[changeTowerIndex].towerChange();
                break;
            //todo：给有人的房间升级大门
            case "升级大门":
                let canLevelUpDoorHuman = this.humans.find(human => human.name == name)
                if (!canLevelUpDoorHuman || canLevelUpDoorHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间升级了大门";
                this.uiManager.showTips("humanCommand", commandShowWord);
                canLevelUpDoorHuman.room.levelUpDoor();
                break;
            //todo：给有人的房间升级一个炮塔至最高级
            case "神秘空投":
                let canMaxTowerHuman = this.humans.find(human => human.name == name)
                if (!canMaxTowerHuman || canMaxTowerHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]为房间进化了一个终极炮塔";
                this.uiManager.showTips("humanCommand", commandShowWord);
                let canMaxTowers: Tower[] = [];
                for (let i = 0; i < canMaxTowerHuman.room.towers.length; i++) {
                    if (canMaxTowerHuman.room.towers[i].changeLevel < 5) {
                        canMaxTowers.push(canMaxTowerHuman.room.towers[i]);
                    }
                }
                if (canMaxTowers.length == 0) {
                    return;
                }
                let canMaxTowerIndex = Tools.getRandomNum(0, canMaxTowers.length - 1);
                canMaxTowers[canMaxTowerIndex].changeToBestTower();
                break;
            //todo：召唤一个亡灵
            case "召唤亡灵":
                let canCallUndeadMonster = this.monsters.find(monster => monster.name == name)
                if (!canCallUndeadMonster) {
                    console.log("玩家未加入游戏");
                    return;
                }
                commandShowWord = "[" + name + "]召唤了一个亡灵";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                canCallUndeadMonster.callUndead();
                break;
            //todo：给boss加血
            case "boss加血":
                let canAddHpMonster = this.monsters.find(monster => monster.name == name)
                if (!canAddHpMonster || canAddHpMonster.isDead) {
                    console.log("玩家未加入游戏或已死亡");
                    return;
                }
                commandShowWord = "[" + name + "]给boss回复了血量";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                canAddHpMonster.addHp();
                break;
            case "boss进化":
                let canChangeBossMonster = this.monsters.find(monster => monster.name == name)
                if (!canChangeBossMonster || canChangeBossMonster.isDead) {
                    console.log("玩家未加入游戏或已死亡");
                    return;
                }
                if (this.boss.level >= 4) {
                    return;
                }
                commandShowWord = "[" + name + "]进化了boss";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                this.boss.levelUp();
                break;
            default:
                console.log("指令无效");
                break;
        }
    }

    onGetCommand_test2(name: string, command: string) {
        if (this.isGameOver) {
            return;
        }
        let humanBornPos = this.humanRoadPos.getChildByName("BornPos").position;
        let monsterBornPos = this.monsterRoadPos.getChildByName("BornPos").position;
        let commandShowWord: string = null;
        switch (command) {
            //todo：加入人类阵营
            case "1":
            case "2":
            case "3":
            case "4":
                //当前房间
                let currentRoom = this.rooms[Number(command) - 1];
                //判断是否可以加入当前房间
                if (currentRoom.isDead) {
                    return;
                }

                //判断当前玩家（名字）是否已经加入了房间
                // let addHuman = this.humans.find(human => human.name == name)
                // if (addHuman) {
                //     return;
                // }

                //当前房间的人数
                let humanCount = currentRoom.humans.length;
                console.log("新入场玩家人数:", Number(name));
                //根据当前房间人数确定后续新增人类的名字
                for (let i = humanCount + 1; i < humanCount + 1 + Number(name); i++) {
                    let name: string = i < 10 ? command + "-0" + i : command + "-" + i;
                    let human = new Human(name, this.humanParent, humanBornPos);

                    //判断当前是否boss已经入场；
                    //如果已经未入场，则从底部入场；
                    //否则需要降落
                    if (!this.isBossEnter) {
                        human.MoveToRoom(currentRoom);
                    } else {
                        let parachuteNode = cc.instantiate(PrefabManager.parachutePrefab);
                        parachuteNode.setParent(this.mapLayer);
                        human.MoveToRoom(currentRoom, true, parachuteNode);
                    }
                    this.humans.push(human);
                }
                console.log(this.humans);
                break;
            //todo：加入怪物阵营
            case "5":
                if (this.boss.hp <= 0) {
                    return;
                }

                //判断当前玩家（名字）是否已经加入了房间
                // let addMonster = this.monsters.find(monster => monster.name == name)
                // if (addMonster && !addMonster.isDead) {
                //     console.log("玩家已经在场了");
                //     return;
                // }
                console.log("新入场玩家人数:", Number(name));
                let monsterCount = this.monsters.length;
                for (let i = monsterCount + 1; i < monsterCount + 1 + Number(name); i++) {
                    let name = i < 10 ? "m-0" + i : "m-" + i;
                    let monster = new Monster(name, this.monsterParent, monsterBornPos);
                    monster.boss = this.boss;
                    this.monsters.push(monster);
                    monster.moveToBoss();
                }
                break;
            //todo：人类攻击怪物或boss
            case "攻击":
                //如果boss不在场，则不攻击
                if (!this.boss) {
                    return;
                }
                //根据名字找到玩家
                let atkHuman = this.humans.find(human => human.name == name)
                if (!atkHuman || atkHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                //找出所有可攻击的目标
                let canAtkTargets = [];
                canAtkTargets.push(this.boss);
                if (this.monsters.length > 0) {
                    for (let monster of this.monsters) {
                        if (!monster.isDead) {
                            canAtkTargets.push(monster);
                        }
                        if (monster.undeads.length > 0) {
                            for (let undead of monster.undeads) {
                                if (!undead.isDead) {
                                    canAtkTargets.push(undead);
                                }
                            }
                        }
                    }
                }
                if (canAtkTargets.length == 0) {
                    console.log("没有可以攻击的目标");
                    return;
                }
                let atkTargetIndex = Tools.getRandomNum(0, canAtkTargets.length - 1);
                atkHuman.atkBossOrMonsterOrUndead(canAtkTargets[atkTargetIndex]);
                break;
            //todo：给有人的房间加护盾
            //todo：召唤一个亡灵
            case "点赞":
                if (name[0] == "m") {
                    let canCallUndeadMonster = this.monsters.find(monster => monster.name == name)
                    if (!canCallUndeadMonster) {
                        console.log("玩家未加入游戏");
                        return;
                    }
                    // commandShowWord = "[" + name + "]召唤了一个亡灵";
                    // this.uiManager.showTips("monsterCommand", commandShowWord);
                    canCallUndeadMonster.callUndead();
                } else {
                    let addShieldHuman = this.humans.find(human => human.name == name)
                    if (!addShieldHuman || addShieldHuman.isDead) {
                        console.log("玩家未加入游戏或已经死亡");
                        return;
                    }
                    // commandShowWord = "[" + name + "]点赞了";
                    // this.uiManager.showTips("humanCommand", commandShowWord);
                    addShieldHuman.room.addDoorShield();
                }
                break;
            //todo：给有人的房间回血
            //todo：给boss加血
            case "仙女棒":
                if (name[0] == "m") {
                    let canAddHpMonster = this.monsters.find(monster => monster.name == name)
                    if (!canAddHpMonster || canAddHpMonster.isDead) {
                        console.log("玩家未加入游戏或已死亡");
                        return;
                    }
                    // commandShowWord = "[" + name + "]给boss回复了血量";
                    // this.uiManager.showTips("monsterCommand", commandShowWord);
                    canAddHpMonster.addHp();
                } else {
                    let addReHpHuman = this.humans.find(human => human.name == name)
                    if (!addReHpHuman || addReHpHuman.isDead) {
                        console.log("玩家未加入游戏或已经死亡");
                        return;
                    }
                    // commandShowWord = "[" + name + "]为房门回复了血量";
                    // this.uiManager.showTips("humanCommand", commandShowWord);
                    addReHpHuman.addRoomHp();
                }
                break;
            //todo：给房间建造炮塔:有未启动的炮塔时
            //todo：给房间升级炮塔:炮塔全部启动时
            case "能力药丸":
                let canBuildHuman = this.humans.find(human => human.name == name)
                if (!canBuildHuman || canBuildHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                let canBuildTowers: Tower[] = [];
                for (let tower of canBuildHuman.room.towers) {
                    if (tower.level == 0 && tower.changeLevel == 0) {
                        canBuildTowers.push(tower);
                    }
                }
                let towerIndex;
                if (canBuildTowers.length > 0) {
                    towerIndex = Tools.getRandomNum(0, canBuildTowers.length - 1);
                    canBuildTowers[towerIndex].towerBuildOrLevelUp();
                } else {
                    towerIndex = Tools.getRandomNum(0, canBuildHuman.room.towers.length - 1);
                    canBuildHuman.room.towers[towerIndex].towerBuildOrLevelUp();
                }
                commandShowWord = "[" + name + "]使用了[能力药丸]";
                this.uiManager.showTips("humanCommand", commandShowWord);
                break;
            //todo：给有人的房间进化炮塔
            case "能量电池":
                let canChangeTowerHuman = this.humans.find(human => human.name == name)
                if (!canChangeTowerHuman || canChangeTowerHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                let canChangeTowers: Tower[] = [];
                for (let tower of canChangeTowerHuman.room.towers) {
                    if (tower.level > 0 && tower.changeLevel < 5) {
                        canChangeTowers.push(tower);
                    }
                }
                if (canChangeTowers.length == 0) {
                    return;
                }
                commandShowWord = "[" + name + "]使用了[能量电池]";
                this.uiManager.showTips("humanCommand", commandShowWord);
                let changeTowerIndex = Tools.getRandomNum(0, canChangeTowers.length - 1);
                canChangeTowers[changeTowerIndex].towerChange();
                break;
            //todo：给有人的房间升级大门
            case "甜甜圈":
                let canLevelUpDoorHuman = this.humans.find(human => human.name == name)
                if (!canLevelUpDoorHuman || canLevelUpDoorHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]使用了[甜甜圈]";
                this.uiManager.showTips("humanCommand", commandShowWord);
                canLevelUpDoorHuman.room.levelUpDoor();
                break;
            //todo：给有人的房间升级一个炮塔至最高级
            case "神秘空投":
                let canMaxTowerHuman = this.humans.find(human => human.name == name)
                if (!canMaxTowerHuman || canMaxTowerHuman.isDead) {
                    console.log("玩家未加入游戏或已经死亡");
                    return;
                }
                commandShowWord = "[" + name + "]召唤了[神秘空投]";
                this.uiManager.showTips("humanCommand", commandShowWord);
                let canMaxTowers: Tower[] = [];
                for (let i = 0; i < canMaxTowerHuman.room.towers.length; i++) {
                    if (canMaxTowerHuman.room.towers[i].changeLevel < 5 && canMaxTowerHuman.room.towers[i].level > 0) {
                        canMaxTowers.push(canMaxTowerHuman.room.towers[i]);
                    }
                }
                console.log(canMaxTowers);
                if (canMaxTowers.length == 0) {
                    return;
                }
                let canMaxTowerIndex = Tools.getRandomNum(0, canMaxTowers.length - 1);
                console.log(canMaxTowerIndex);
                canMaxTowers[canMaxTowerIndex].changeToBestTower();
                break;
            case "魔法镜":
                let canChangeBossMonster = this.monsters.find(monster => monster.name == name)
                if (!canChangeBossMonster || canChangeBossMonster.isDead) {
                    console.log("玩家未加入游戏或已死亡");
                    return;
                }
                if (this.boss.level >= 4) {
                    return;
                }
                commandShowWord = "[" + name + "]使用了[魔法镜]";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                this.boss.levelUp();
                break;
            case "恶魔炸弹":
                let canBiggerBossMonster = this.monsters.find(monster => monster.name == name)
                if (!canBiggerBossMonster || canBiggerBossMonster.isDead) {
                    console.log("玩家未加入游戏或已死亡");
                    return;
                }
                if (this.boss.isBigger) {
                    return;
                }
                commandShowWord = "[" + name + "]使用了[恶魔炸弹]";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                this.boss.bossChangeBigger();
                break;
            case "超能喷射":
                let canMaxBossMonster = this.monsters.find(monster => monster.name == name)
                if (!canMaxBossMonster || canMaxBossMonster.isDead) {
                    console.log("玩家未加入游戏或已死亡");
                    return;
                }
                if (this.boss.level >= 4) {
                    return;
                }
                commandShowWord = "[" + name + "]召唤了[九尾狐]";
                this.uiManager.showTips("monsterCommand", commandShowWord);
                this.boss.levelMax();
                break;
            default:
                console.log("指令无效");
                break;
        }
    }

    onBossEnter() {
        this.bossTargetRoom = this.rooms[this.bossTarget[this.targetRoomIndex]];
        this.boss.MoveToRoom(this.bossTargetRoom);
        this.schedule(this.bossChangeTarget, 3);
        this.schedule(this.checkTower, 3);
        this.schedule(this.checkBossDie, 1);
        this.isBossEnter = true;
    }

    checkBossDie() {
        if (this.boss.hp > 0) {
            return;
        }
        this.unschedule(this.checkBossDie);
        this.uiManager.showTips("gameOver", "人类");
    }


    bossChangeTarget() {
        if (this.boss.hp <= 0) {
            this.unschedule(this.bossChangeTarget);
            return;
        }
        if (!this.boss.room.isDead) {
            return;
        }
        if (this.targetRoomIndex == 3) {
            this.unschedule(this.bossChangeTarget);
            this.unschedule(this.checkTower);
            this.isGameOver = true;
            this.uiManager.showTips("gameOver", "怪兽");
            return;
        }
        this.targetRoomIndex++;
        this.boss.MoveToRoom(this.rooms[this.bossTarget[this.targetRoomIndex]]);
        let commandShowWord = "boss攻破了房门";
        this.uiManager.showTips("monsterCommand", commandShowWord);
    }


    checkTower() {
        let canAtkTower: Tower[] = [];
        for (let tower of this.boss.room.towers) {
            if (tower.level > 0 || tower.changeLevel) {
                canAtkTower.push(tower);
            }
        }
        if (canAtkTower.length == 0) {
            return;
        }
        let canAtkTargets: any[] = [];
        //找出所有可攻击的目标
        if (!this.boss) {
            return;
        }
        canAtkTargets.push(this.boss);
        if (this.monsters.length > 0) {
            for (let monster of this.monsters) {
                if (!monster.isDead) {
                    canAtkTargets.push(monster);
                }
                if (monster.undeads.length > 0) {
                    for (let undead of monster.undeads) {
                        if (!undead.isDead) {
                            canAtkTargets.push(undead);
                        }
                    }
                }
            }
        }
        if (canAtkTargets.length == 0) {
            console.log("没有可以攻击的目标");
            return;
        }
        for (let tower of canAtkTower) {
            let atkTargetIndex = Tools.getRandomNum(0, canAtkTargets.length - 1);
            tower.atkBossOrMonsterOrUndead(canAtkTargets[atkTargetIndex]);
        }
    }
}
