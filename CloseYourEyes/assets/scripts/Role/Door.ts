import PrefabManager from "../Manager/PrefabManager";
import Room from "./Room";

const doorMaxHps = [500, 1000, 2000, 3000, 5000];
const doorLevelLimitAddHp = 1000;
const doorMaxHp = 10000;
const addValue = 30;

export default class Door {
    doorNode: cc.Node;  //节点
    door: cc.Node;
    level: number;                  //等级
    maxHp: number;                  //血量上限
    hp: number;                     //当前血量
    hpProgressBar: cc.ProgressBar;
    hpLabel: cc.Label;
    shieldNode: cc.Node;
    boomAnim: cc.Animation;            //护盾节点
    isBack: boolean;

    constructor(doorNode: cc.Node, isBack: boolean) {
        this.doorNode = doorNode;
        this.doorNode.active = true;
        this.level = 0;
        this.maxHp = doorMaxHps[this.level];
        this.hp = this.maxHp;
        this.hpProgressBar = this.doorNode.getChildByName("Hp").getComponent(cc.ProgressBar);
        this.hpLabel = this.doorNode.getChildByName("Hp").getChildByName("Value").getComponent(cc.Label);
        this.door = this.doorNode.getChildByName("Door");
        this.setDoorHp();
        this.shieldNode = this.doorNode.getChildByName("Shield");
        this.boomAnim = this.doorNode.getChildByName("Boom").getComponent(cc.Animation);
        this.boomAnim.node.active = false;
        this.shieldNode.active = false;
        this.isBack = isBack;
    }

    //设置房门血条
    setDoorHp() {
        this.hpProgressBar.progress = this.hp / this.maxHp;
        this.hpLabel.string = this.hp + "/" + this.maxHp;
    }

    //给门增加护盾
    addShield() {
        this.shieldNode.active = true;
    }

    //给门增加血量
    addHp() {
        this.hp = this.hp + addValue > this.maxHp ? this.maxHp : this.hp + addValue;
        this.setDoorHp();
    }

    //升级门
    levelUpDoor() {
        if (this.maxHp >= doorMaxHp) {
            return;
        }
        this.level++;
        let lastMaxHp = this.maxHp;
        if (this.level < 5) {
            this.maxHp = doorMaxHps[this.level];
        } else {
            this.maxHp = doorMaxHps[4] + (this.level - 4) * doorLevelLimitAddHp;
        }
        this.hp += (this.maxHp - lastMaxHp);
        this.setDoorHp();
        if (this.level < 5) {
            let pos = this.door.position;
            this.door.destroy();
            let prefab = this.isBack ? PrefabManager.doorBackPrefabs[this.level] : PrefabManager.doorFrontPrefabs[this.level];
            let newDoor = cc.instantiate(prefab);
            newDoor.setParent(this.doorNode);
            newDoor.setPosition(pos);
            newDoor.zIndex = -1;
            this.door = newDoor;
        }
        this.playLevelUpEffect();
    }

    playLevelUpEffect() {
        let efAnimNode = this.doorNode.getChildByName("LevelUp");
        let efAnim = efAnimNode.getComponent(cc.Animation);
        efAnimNode.active = true;
        efAnim.once("finished", () => {
            efAnimNode.active = false;
        })
        efAnim.play("doorLevelUp");
    }

    //门死亡
    doorDie() {
        this.boomAnim.once("finished", () => {
            this.doorNode.active = false;
        })
        this.boomAnim.node.active = true;
        this.boomAnim.play("doorBoom");
        console.log("play-----doorBoom")
    }
}