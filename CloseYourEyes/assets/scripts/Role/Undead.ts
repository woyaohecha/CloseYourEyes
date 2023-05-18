import Boss from "./Boss";
import Monster from "./Monster";
import Room from "./Room";
import PrefabManager from "../Manager/PrefabManager";

const undeadMaxHp: number = 50;
const undeadAtk: number = 1;
const atkTime: number = 2;
const moveSpeed: number = 150;

export default class Undead {
    roleNode: cc.Node;
    name: string;
    maxHp: number;
    atk: number;
    hp: number;
    isDead: boolean;
    hitPos: cc.Node;
    isMoving: boolean;

    hpProcess: cc.ProgressBar = null;
    animation: cc.Animation = null;



    constructor(parent: cc.Node, pos: cc.Vec3, name: string) {
        let undeadNode = cc.instantiate(PrefabManager.undeadPrefab);
        undeadNode.setParent(parent);
        undeadNode.setPosition(pos);
        this.roleNode = undeadNode;
        this.name = name;
        this.roleNode.getChildByName("Name").getComponent(cc.Label).string = this.name.slice(this.name.length - 2, this.name.length);
        this.maxHp = undeadMaxHp;
        this.hp = this.maxHp;
        this.atk = undeadAtk;
        this.isDead = false;
        this.hitPos = this.roleNode.getChildByName("HitPos");
        this.isMoving = false;

        this.hpProcess = this.roleNode.getChildByName("Hp").getComponent(cc.ProgressBar);
        this.hpProcess.progress = 1;
        this.animation = this.roleNode.getComponent(cc.Animation);
    }

    //移动至目标boss周围
    moveToBoss(boss: Boss) {
        // this.animation.play("move");
        // let moveInterval = setInterval(() => {
        //     let startPos = this.roleNode.position;
        //     let targetPos = boss.roleNode.position;
        //     let moveTime = cc.Vec3.len(cc.Vec3.subtract(new cc.Vec3(), startPos, targetPos)) / moveSpeed;
        //     cc.tween(this.roleNode)
        //         .to(moveTime, { position: targetPos })
        //         .call(() => {
        //             this.animation.play("idle");
        //             this.atkRoom(boss.room);
        //         })
        //         .start();
        // }, 5)
        // if (boss.hp <= 0) {
        //     clearInterval(moveInterval);
        //     this.die();
        // }
        let targetRoom;
        let moveInterval = setInterval(() => {
            //如果boss还未入场或未开始攻击，则不移动
            if (!boss) {
                return;
            }
            //如果角色死亡或者boss死亡,则取消回调
            if (this.isDead || (boss.hp <= 0)) {
                clearInterval(moveInterval);
            }
            //如果boss在移动中或者角色在移动中，则等待
            if (boss.isMoving || this.isMoving) {
                return;
            }
            //如果目标房间未变化，则不移动
            if (targetRoom && targetRoom == boss.room) {
                return;
            }
            targetRoom = boss.room;
            this.animation.play("move");
            this.isMoving = true;
            let startPos = this.roleNode.position;
            let targetX = boss.roleNode.position.x - (Math.random() > 0.5 ? 1 : -1) * Math.random() * 150;
            let targetY = boss.room.roomId > 1 ? boss.roleNode.position.y + Math.random() * 50 : boss.roleNode.position.y - Math.random() * 50;
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
                    this.atkRoom(boss.room);
                })
                .start();
        }, 1 * 5000);
        if (boss && boss.hp <= 0) {
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
        if (this.hp - atkValue <= 0) {
            this.hp = 0;
            this.hpProcess.progress = 0;
            this.die();
            return;
        }
        this.hp -= atkValue;
        this.hpProcess.progress = this.hp / this.maxHp;
    }


    //undead死亡
    die() {
        this.isDead = true;
        this.roleNode.destroy();
    }

}
