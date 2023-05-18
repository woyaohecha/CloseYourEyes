import Boss from "./Boss";
import Room from "./Room";
import Tools from "../Tools";
import Undead from "./Undead";
import PrefabManager from "../Manager/PrefabManager";

const monsterMaxHp: number = 100;
const monsterAtk: number = 1;
const atkTime: number = 1.5;
const moveSpeed: number = 150;
const addValue: number = 100;

export default class Monster {
    roleNode: cc.Node;
    name: string;
    maxHp: number;
    atk: number;
    hp: number;
    isDead: boolean = false;
    boss: Boss;
    parent: cc.Node;
    pos: cc.Vec3;
    undeads: Undead[] = [];
    hitPos: cc.Node;
    canAtk: boolean;
    isMoving: boolean;



    hpProcess: cc.ProgressBar;
    animation: cc.Animation;



    constructor(name: string, parent: cc.Node, pos: cc.Vec3) {
        let monsterNode = cc.instantiate(PrefabManager.monsterPrefab);
        this.parent = parent;
        this.pos = pos;
        monsterNode.setParent(parent);
        monsterNode.setPosition(pos);
        this.roleNode = monsterNode;
        this.hitPos = this.roleNode.getChildByName("HitPos");
        this.name = name;
        this.roleNode.getChildByName("Name").getComponent(cc.Label).string = this.name.slice(this.name.length - 2, this.name.length);
        this.maxHp = monsterMaxHp;
        this.hp = this.maxHp;
        this.atk = monsterAtk;
        this.isDead = false;
        this.isMoving = false;

        this.hpProcess = this.roleNode.getChildByName("Hp").getComponent(cc.ProgressBar);
        this.hpProcess.progress = 1;
        this.animation = this.roleNode.getComponent(cc.Animation);
    }

    moveToBoss() {
        let targetRoom;
        let moveInterval = setInterval(() => {
            //如果boss还未入场或未开始攻击，则不移动
            if (!this.boss) {
                return;
            }
            //如果角色死亡或者boss死亡,则取消回调
            if (this.isDead || (this.boss.hp <= 0)) {
                clearInterval(moveInterval);
            }
            //如果boss在移动中或者角色在移动中，则等待
            if (this.boss.isMoving || this.isMoving) {
                return;
            }
            //如果目标房间未变化，则不移动
            if (targetRoom && targetRoom == this.boss.room) {
                return;
            }
            targetRoom = this.boss.room;
            this.animation.play("move");
            this.isMoving = true;
            let startPos = this.roleNode.position;
            let targetX = this.boss.roleNode.position.x - (Math.random() > 0.5 ? 1 : -1) * Math.random() * 150;
            let targetY = this.boss.room.roomId > 1 ? this.boss.roleNode.position.y + Math.random() * 50 : this.boss.roleNode.position.y - Math.random() * 50;
            let targetPos = cc.v3(targetX, targetY);
            if (targetX < startPos.x) {
                this.setScaleX(-1);
            } else {
                this.setScaleX(1);
            }
            let moveTime = cc.Vec3.len(cc.Vec3.subtract(new cc.Vec3(), startPos, targetPos)) / moveSpeed;
            cc.tween(this.roleNode)
                .to(moveTime, { position: targetPos })
                .call(() => {
                    this.animation.play("idle");
                    this.isMoving = false;
                    this.atkRoom(this.boss.room);
                })
                .start();
        }, 500);
        if (this.boss && this.boss.hp <= 0) {
            clearInterval(moveInterval);
            this.die();
        }
    }

    setScaleX(scaleX: number) {
        this.roleNode.scaleX = scaleX;
        this.roleNode.getChildByName("Hp").scaleX = scaleX
        this.roleNode.getChildByName("Name").scaleX = scaleX;
    }

    //攻击房门
    atkRoom(room: Room) {
        this.animation.play("idle");
        let atkInterval = setInterval(() => {
            if (this.isMoving || this.isDead || room.door.hp <= 0) {
                clearInterval(atkInterval);
                return;
            }
            this.animation.once("finished", () => {
                room.roomHit(this.atk);
                this.animation.play("idle");
            });
            this.animation.play("atk");
        }, atkTime * 1000);
    }

    //怪物受击
    hit(atkValue: number) {
        if (this.isDead) {
            return;
        }
        if (this.hp - atkValue <= 0) {
            this.hp = 0;
            this.hpProcess.progress = 0;
            this.die();
            return;
        }
        this.hp -= atkValue;
        this.hpProcess.progress = this.hp / this.maxHp;
    }

    //给boss回血
    addHp() {
        if (this.isDead) {
            return;
        }
        this.boss.addHp(addValue);
    }

    //召唤亡灵
    callUndead() {
        let undead = new Undead(this.parent, this.pos, this.name);
        undead.moveToBoss(this.boss);
        this.undeads.push(undead);
    }

    //monster死亡
    die(clear?: boolean) {
        this.isDead = true;
        this.roleNode.destroy();
        if (clear) {
            if (this.undeads.length > 0) {
                for (let undead of this.undeads) {
                    undead.die();
                    undead = null;
                }
                this.undeads = [];
            }
        }
    }
}
