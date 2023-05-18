import Boss from "./Boss";
import Monster from "./Monster";
import Room from "./Room";
import Undead from "./Undead";
import PrefabManager from "../Manager/PrefabManager";
import Tools from "../Tools";

const humanAtk = 100;
const moveSpeed: number = 100;
const stoneSpeed: number = 500;
const heartSpeed: number = 500;
const parachuteSpeed: number = 100;

export default class Human {

    roleNode: cc.Node;          //角色节点
    name: string;               //玩家名字
    atk: number;                //攻击力
    room: Room;                 //角色当前房间
    canAtk: boolean;            //角色是否可以攻击：在入场及子弹运动过程种，不可攻击
    isDead: boolean;            //角色是否死亡
    stone: cc.Node;             //子弹节点：绑定在角色身上
    heart: cc.Node;             //加血的特效
    canRehp: boolean;           //是否可以加血：需要完成一次加血动作后才可以继续加血

    animation: cc.Animation;
    atkPos: cc.Vec3;            //攻击的起始位置

    constructor(name: string, parentNode: cc.Node, pos: cc.Vec3) {
        let humanPrefab = PrefabManager.humanPrefabs[Tools.getRandomNum(0, PrefabManager.humanPrefabs.length - 1)];
        let humanNode = cc.instantiate(humanPrefab);
        humanNode.setParent(parentNode);
        humanNode.setPosition(pos);
        this.roleNode = humanNode;
        this.atk = humanAtk;
        this.canAtk = false;
        this.canRehp = false;
        this.isDead = false;
        this.animation = this.roleNode.getComponent(cc.Animation);
        this.atkPos = this.roleNode.getChildByName("AtkPos").position;
        this.stone = this.roleNode.getChildByName("Stone");
        this.heart = this.roleNode.getChildByName("Heart");
        this.name = name;
        this.roleNode.getChildByName("Name").getComponent(cc.Label).string = this.name.slice(this.name.length - 2, this.name.length);
    }


    //移动至目标房间内
    MoveToRoom(room: Room, roomIsDie?: boolean, parachute?: cc.Node) {
        this.room = room;
        this.setScaleX((this.room.roomId % 2) == 0 ? -1 : 1);

        let startPos;
        let roomPos = room.getInRoomPos();
        let moveTime;
        if (!roomIsDie) {
            this.animation.play("move");
            startPos = this.roleNode.position;
            moveTime = [];
            moveTime[0] = Math.abs((room.move.humanMovePos[0].y - startPos.y) / moveSpeed);
            moveTime[1] = Math.abs((room.move.humanMovePos[1].x - room.move.humanMovePos[0].x) / moveSpeed);
            cc.tween(this.roleNode)
                .to(moveTime[0], { position: room.move.humanMovePos[0] })
                .to(moveTime[1], { position: room.move.humanMovePos[1] })
                .call(() => {
                    let scaleX = (this.room.roomId % 2) == 0 ? 1 : -1;
                    this.roleNode.scaleX = scaleX;
                    this.roleNode.getChildByName("Name").scaleX = scaleX;
                    this.roleNode.setPosition(roomPos);
                    room.humans.push(this);
                    this.animation.play("idle");
                    this.canAtk = true;
                    this.canRehp = true;
                    if (room.isDead) {
                        this.die();
                        return;
                    }
                })
                .start();
        } else if (parachute) {
            this.animation.play("idle");
            startPos = parachute.position;
            moveTime = cc.Vec3.len(cc.Vec3.subtract(new cc.Vec3(), startPos, roomPos)) / parachuteSpeed;
            let parent = this.roleNode.parent;
            this.roleNode.setParent(parachute);
            this.roleNode.setPosition(0, 0, 0);
            cc.tween(parachute)
                .to(moveTime, { position: roomPos })
                .call(() => {
                    if (room.isDead) {
                        this.die();
                        return;
                    }
                    let scaleX = (this.room.roomId % 2) == 0 ? 1 : -1;
                    this.roleNode.scaleX = scaleX;
                    this.roleNode.getChildByName("Name").scaleX = scaleX;
                    this.roleNode.setParent(parent);
                    let roomPos = room.getInRoomPos();
                    this.roleNode.setPosition(roomPos);
                    parachute.destroy();
                    room.humans.push(this);
                    this.animation.play("idle");
                    this.canAtk = true;
                    this.canRehp = true;
                })
                .start();
        }
    }

    setScaleX(scaleX: number) {
        this.roleNode.scaleX = scaleX;
        this.roleNode.getChildByName("Name").scaleX = scaleX;
    }

    //攻击怪物阵营：boss，monster，undead
    atkBossOrMonsterOrUndead(target: Boss | Monster | Undead) {
        if (!this.canAtk || this.isDead) {
            return;
        }
        this.canAtk = false;
        this.animation.once("finished", () => {
            this.animation.play("idle");

            this.stone.setPosition(this.atkPos);
            this.stone.active = true;
            let startPos = this.atkPos;
            // let targetPos = target.roleNode.position;
            let targetPos = target.hitPos.convertToWorldSpaceAR(cc.v3(0, 0));
            targetPos = this.stone.convertToNodeSpaceAR(targetPos);
            console.log("targetPos:", targetPos);
            // 
            let time = cc.Vec3.len(cc.Vec3.subtract(new cc.Vec3(), startPos, targetPos)) / stoneSpeed;
            cc.tween(this.stone)
                .to(time, { position: targetPos })
                .call(() => {
                    this.stone.active = false;
                    target.hit(this.atk);
                    this.canAtk = true;
                }, this)
                .start();
        });
        this.animation.play("atk");
    }


    //给房间加护盾
    addRoomShield() {
        if (this.isDead) {
            return;
        }
        this.room.door.addShield();
    }

    //给房门回血
    addRoomHp() {
        if (this.isDead || !this.canRehp) {
            console.log("房门回血 返回了");
            return;
        }
        this.canRehp = false;
        this.heart.setPosition(0, 0);
        this.heart.setScale(1);
        this.heart.opacity = 255;
        this.heart.active = true;
        let startPos = this.heart.position;
        // let targetPos = target.roleNode.position;
        let target = this.room.door.door;
        let targetPos = target.convertToWorldSpaceAR(cc.v3(0, 0));
        targetPos = this.roleNode.convertToNodeSpaceAR(targetPos);
        let time = cc.Vec3.len(cc.Vec3.subtract(new cc.Vec3(), startPos, targetPos)) / heartSpeed;
        cc.tween(this.heart)
            .to(time, { position: targetPos })
            .call(() => {
                let heartAnim = this.heart.getComponent(cc.Animation);
                heartAnim.once("finished", () => {
                    this.room.addDoorHp();
                    this.heart.active = false;
                    this.canRehp = true;
                })
                heartAnim.play("heart");
            }, this)
            .start();
    }


    //升级房间大门
    levelUpRoomDoor() {
        if (this.isDead) {
            return;
        }
        this.room.levelUpDoor();
    }

    //boss死亡
    die() {
        this.isDead = true;
        this.roleNode.destroy();
    }
}
