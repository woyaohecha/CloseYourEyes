import PrefabManager from "../Manager/PrefabManager";
import Monster from "./Monster";
import Room from "./Room";

const bossMaxHps: number[] = [2000, 4000, 6000, 8000, 10000];
// const bossAtks: number[] = [1, 3, 8];
const bossAtks: number[] = [10, 20, 30, 40, 50];
const atkTime: number = 1;
const biggerScale: number = 1.2;
const biggerAddHp: number = 10000;
const biggerAddAtk: number = 10;
const moveSpeed: number = 150;

export default class Boss {
    roleNode: cc.Node = null;       //boss角色节点
    level: number;                  //等级：鸡，猪，狼
    maxHp: number;                  //血量上限
    atk: number;                    //攻击力
    hp: number;
    parent: cc.Node;                    //血量

    room: Room;                     //当前目标房间
    isBigger: boolean;              //是否已经变大

    hpProcess: cc.ProgressBar = null;
    hpLabel: cc.Label = null;
    animation: cc.Animation = null;
    hitPos: cc.Node = null;
    isMoving: boolean;
    changeEffect: cc.Animation = null;

    constructor(parent: cc.Node, pos: cc.Vec3) {
        this.level = 0;
        let bossNode = cc.instantiate(PrefabManager.bossPrefabs[this.level]);
        bossNode.setParent(parent);
        this.parent = parent;
        bossNode.setPosition(pos);
        this.roleNode = bossNode;

        this.maxHp = bossMaxHps[this.level];
        this.atk = bossAtks[this.level];
        this.hp = this.maxHp;
        this.isBigger = false;
        this.hitPos = bossNode.getChildByName("HitPos");
        this.isMoving = false;

        this.hpProcess = this.roleNode.getChildByName("Hp").getComponent(cc.ProgressBar);
        this.hpLabel = this.roleNode.getChildByName("Hp").getChildByName("Value").getComponent(cc.Label);
        this.setHp();
        this.animation = this.roleNode.getComponent(cc.Animation);
        this.changeEffect = this.roleNode.getChildByName("ChangeEffect").getComponent(cc.Animation);
    }


    //移动至目标房门
    MoveToRoom(room: Room) {
        this.room = room;
        console.log("boss移动至目标:房间" + room.roomId);
        this.isMoving = true;
        this.animation.play("move");
        let startPos = this.roleNode.getPosition();
        let targetPos = room.bossPos;
        let moveTime: number[] = [];
        moveTime[0] = Math.abs((targetPos.x - startPos.x) / moveSpeed);
        moveTime[1] = Math.abs((targetPos.y - startPos.y) / moveSpeed);
        if (targetPos.x < startPos.x) {
            this.roleNode.scaleX = this.level == 0 ? -1 : 1;
        } else {
            this.roleNode.scaleX = this.level == 0 ? 1 : -1;
        }
        this.roleNode.zIndex = room.roomId < 2 ? -1 : 1000;

        cc.tween(this.roleNode)
            .to(moveTime[0], { x: targetPos.x })
            .to(moveTime[1], { y: targetPos.y })
            .call(() => {
                this.animation.play("idle");
                if (room.roomId == 1 || room.roomId == 3) {
                    this.roleNode.scaleX = 1;
                    let hpNode = this.roleNode.getChildByName("Hp");
                    hpNode.scaleX = 1;
                } else {
                    this.roleNode.scaleX = -1;
                    let hpNode = this.roleNode.getChildByName("Hp");
                    hpNode.scaleX = -1;
                }
                this.isMoving = false;
                this.atkRoom(room);
            })
            .start();
    }

    //攻击房门
    atkInterval;
    atkRoom(room: Room) {
        this.atkInterval = setInterval(() => {
            this.animation.once("finished", () => {
                room.roomHit(this.atk);
                this.animation.play("idle");
                if (room.door.hp <= 0) {
                    clearInterval(this.atkInterval);
                    // return;
                }
            });
            this.animation.play("atk");
        }, atkTime * 1000);
    }

    //boss受击
    hit(atkValue: number) {
        if (this.hp <= 0) {
            return;
        }
        if (this.hp - atkValue <= 0) {
            this.hp = 0;
            this.hpProcess.progress = 0;
            this.hpLabel.string = String(this.hp);
            this.die();
            return;
        }
        this.hp -= atkValue;
        this.hpProcess.progress = this.hp / this.maxHp;
        this.hpLabel.string = String(this.hp);
    }

    //升级至其他boss
    //增加血量上限,增加攻击力
    levelUp() {
        if (this.level > 4 || this.isMoving) {
            return;
        }
        this.level++;
        this.maxHp = this.isBigger ? bossMaxHps[this.level] + biggerAddHp : bossMaxHps[this.level];
        this.atk = this.isBigger ? bossAtks[this.level] + biggerAddAtk : bossAtks[this.level];
        this.hp = this.maxHp;
        this.hpProcess.progress = 1;

        let pos = this.roleNode.position;
        this.roleNode.destroy();
        let prefab = PrefabManager.bossPrefabs[this.level];
        let newBoss = cc.instantiate(prefab);
        newBoss.setParent(this.parent);
        newBoss.setPosition(pos);
        newBoss.zIndex = this.room.roomId < 2 ? -1 : 1000;
        this.roleNode = newBoss;

        this.hitPos = this.roleNode.getChildByName("HitPos");

        this.hpProcess = this.roleNode.getChildByName("Hp").getComponent(cc.ProgressBar);
        this.hpLabel = this.roleNode.getChildByName("Hp").getChildByName("Value").getComponent(cc.Label);
        this.setHp();
        this.animation = this.roleNode.getComponent(cc.Animation);
        this.changeEffect = this.roleNode.getChildByName("ChangeEffect").getComponent(cc.Animation);
        this.changeEffect.play("boss_change");
    }

    levelMax() {
        if (this.level >= 4 || this.isMoving) {
            this.level = 4;
            return;
        }
        this.level = 4;
        this.maxHp = this.isBigger ? bossMaxHps[this.level] + biggerAddHp : bossMaxHps[this.level];
        this.atk = this.isBigger ? bossAtks[this.level] + biggerAddAtk : bossAtks[this.level];
        this.hp = this.maxHp;
        this.hpProcess.progress = 1;

        let pos = this.roleNode.position;
        this.roleNode.destroy();
        let prefab = PrefabManager.bossPrefabs[this.level];
        let newBoss = cc.instantiate(prefab);
        newBoss.setParent(this.parent);
        newBoss.setPosition(pos);
        newBoss.zIndex = this.room.roomId < 2 ? -1 : 1000;
        this.roleNode = newBoss;

        this.hitPos = this.roleNode.getChildByName("HitPos");

        this.hpProcess = this.roleNode.getChildByName("Hp").getComponent(cc.ProgressBar);
        this.hpLabel = this.roleNode.getChildByName("Hp").getChildByName("Value").getComponent(cc.Label);
        this.setHp();
        this.animation = this.roleNode.getComponent(cc.Animation);
        this.changeEffect = this.roleNode.getChildByName("ChangeEffect").getComponent(cc.Animation);
        this.changeEffect.play("boss_change");
    }

    //boss体型变大，血量增加，攻击力增加
    bossChangeBigger() {
        if (this.isBigger) {
            return;
        }
        this.roleNode.width *= biggerScale;
        this.roleNode.height *= biggerScale;
        this.maxHp += biggerAddHp;
        this.hp += biggerAddHp;
        this.hpProcess.progress = this.hp / this.maxHp;
        this.atk += biggerAddAtk;
    }

    //boss回血
    addHp(addValue: number) {
        if (this.hp + addValue >= this.maxHp) {
            this.hp = this.maxHp;
        } else {
            this.hp += addValue;
        }
        this.setHp();
    }

    setHp() {
        this.hpProcess.progress = this.hp / this.maxHp;
        this.hpLabel.string = this.hp + "/" + this.maxHp;
    }

    //boss死亡
    die() {
        clearInterval(this.atkInterval);
        this.roleNode.destroy();
    }
}
