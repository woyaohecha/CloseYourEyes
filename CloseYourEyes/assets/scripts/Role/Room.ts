import Boss from "./Boss";
import Human from "./Human";
import PrefabManager from "../Manager/PrefabManager";
import Tower from "./Tower";
import Door from "./Door";
import Tools from "../Tools";

export default class Room {

    boss: Boss[] = [];
    roomNode: cc.Node = null;
    roomId: number = 0;
    towers: Tower[] = [];
    towersParent: cc.Node[] = [];
    door: Door = null;

    humans: Human[] = [];
    move: any = {};
    roomScale: cc.Vec2[] = [];
    bossPos: cc.Vec2 = cc.v2(0, 0);
    landPos: cc.Vec2;
    isDead: boolean;
    roomDieEffect: cc.Animation = null;


    constructor(room: cc.Node) {
        this.roomNode = room;
        this.roomId = room.parent.children.indexOf(room);
        this.towersParent = room.getChildByName("Tower").children;
        this.initTowers();
        this.isDead = false;


        let doorNode = this.roomNode.getChildByName("Door");
        let isBack = this.roomId < 2 ? false : true;
        this.door = new Door(doorNode, isBack);
        this.roomDieEffect = this.roomNode.getChildByName("RoomDie").getComponent(cc.Animation);
        this.roomDieEffect.node.active = false;


        let humanPosNode = room.parent.parent.getChildByName("HumanRoadPos").getChildByName("ToRoom_" + (this.roomId + 1));
        this.move.humanMovePos = [];
        for (let i = 0; i < humanPosNode.children.length; i++) {
            let movePos = humanPosNode.children[i].position;
            this.move.humanMovePos.push(movePos);
        }

        let monsterPosNode = room.parent.parent.getChildByName("MonsterRoadPos").getChildByName("ToRoom_" + (this.roomId + 1));
        this.move.monsterMovePos = [];
        for (let i = 0; i < monsterPosNode.children.length; i++) {
            let movePos = monsterPosNode.children[i].position;
            this.move.monsterMovePos.push(movePos);
        }

        this.roomScale[0] = room.getChildByName("Room").children[0].getPosition();;
        this.roomScale[1] = room.getChildByName("Room").children[1].getPosition();
        for (let i = 0; i < this.roomScale.length; i++) {
            let pos = this.roomNode.convertToWorldSpaceAR(this.roomScale[i]);
            pos = this.roomNode.parent.convertToNodeSpaceAR(pos);
            this.roomScale[i] = pos;
        }

        let pos = this.roomNode.getChildByName("BossPos").getPosition();
        pos = this.roomNode.convertToWorldSpaceAR(pos);
        this.bossPos = this.roomNode.parent.convertToNodeSpaceAR(pos);
    }

    initTowers() {
        for (let i = 0; i < this.towersParent.length; i++) {
            let tower = new Tower(this.towersParent[i], i);
            this.towers.push(tower);
        }
    }

    getInRoomPos() {
        let posX = Tools.getRandomNum(this.roomScale[0].x, this.roomScale[1].x);
        let posY = Tools.getRandomNum(this.roomScale[1].y, this.roomScale[0].y);
        return cc.v3(posX, posY);
    }

    roomHit(atkValue) {
        if (this.isDead) {
            return;
        }
        if (this.door.shieldNode.active == true) {
            this.door.shieldNode.active = false;
        } else {
            this.door.hp = this.door.hp - atkValue > 0 ? this.door.hp - atkValue : 0;
            this.door.setDoorHp();
            if (this.door.hp == 0) {
                this.roomDie();
            }
        }
    }

    addDoorShield() {
        this.door.addShield();
    }

    addDoorHp() {
        console.log()
        this.door.addHp();
    }

    levelUpDoor() {
        this.door.levelUpDoor();
    }

    roomDie() {
        this.roomDieEffect.node.active = true;
        this.roomDieEffect.play("room_die");
        console.log("play-----room_die")
        this.door.doorDie();
        this.isDead = true;
        for (let human of this.humans) {
            human.die();
        }
        this.humans = [];
        for (let tower of this.towers) {
            tower.die();
        }
        this.towers = [];
    }
}
