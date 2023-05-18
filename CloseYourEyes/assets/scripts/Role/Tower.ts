import PrefabManager from "../Manager/PrefabManager";
import Boss from "../Role/Boss";
import Monster from "../Role/Monster";
import Undead from "../Role/Undead";

const bulletSpeed: number = 500;

export default class Tower {
    roleNode: cc.Node;
    parent: cc.Node;
    id: number;
    level: number;
    changeLevel: number;
    atk: number;
    changeAtk: number[] = [0, 100, 20, 30, 40, 50];
    atkAddValue: number = 10;
    atkInterval: number;
    canAtk: boolean = false;
    isDead: boolean = false;

    constructor(parent: cc.Node, id: number) {
        let towerNode = cc.instantiate(PrefabManager.towerPrefabs[0]);
        this.parent = parent;
        towerNode.setParent(parent);
        towerNode.setPosition(0, 0);
        this.roleNode = towerNode;
        this.id = id;
        this.level = 0;
        this.changeLevel = 0;
        this.canAtk = true;
        this.roleNode.zIndex = 1003;
    }

    //建造或升级炮塔
    towerBuildOrLevelUp() {
        if (this.level == 0) {
            this.roleNode.destroy();
            let towerNode = cc.instantiate(PrefabManager.towerPrefabs[1]);
            towerNode.setParent(this.parent);
            towerNode.setPosition(0, 0);
            this.roleNode = towerNode;
            this.playLevelUpEffect()
        }
        this.level++;
        this.updateAtk();
    }

    //进化炮塔
    towerChange() {
        if (this.changeLevel >= 4 || this.level == 0) {
            return;
        }
        this.roleNode.destroy();
        this.changeLevel++;
        let towerNode = cc.instantiate(PrefabManager.towerPrefabs[this.changeLevel + 1]);
        towerNode.setParent(this.parent);
        towerNode.setPosition(0, 0);
        this.roleNode = towerNode;
        this.roleNode.zIndex = 1003;
        this.updateAtk();
        this.playLevelUpEffect();
    }

    //神秘空投
    changeToBestTower() {
        if (this.changeLevel == 5 || this.level == 0) {
            return;
        }
        this.roleNode.destroy();
        this.changeLevel = 5;
        this.roleNode.active = false;
        let towerNode = cc.instantiate(PrefabManager.towerPrefabs[this.changeLevel + 1]);
        towerNode.setParent(this.parent);
        towerNode.setPosition(0, 0);
        this.roleNode = towerNode;
        this.roleNode.zIndex = 1003;
        this.updateAtk();
        this.playLevelUpEffect();
    }

    playLevelUpEffect() {
        let levelUpEfNode = this.roleNode.getChildByName("LevelUp");
        levelUpEfNode.active = true;
        let efAnim = levelUpEfNode.getComponent(cc.Animation);
        efAnim.once("finished", () => {
            levelUpEfNode.active = false;
        })
        efAnim.play("towerLevelUp");
    }

    updateAtk() {
        if ((this.level > 0 || this.changeLevel > 0) && !this.canAtk) {
            this.canAtk = true;
        }
        this.atk = this.atkAddValue * this.level + this.changeAtk[this.changeLevel];
    }

    atkBossOrMonsterOrUndead(target: Boss | Monster | Undead) {
        if (!this.canAtk || this.level == 0 || target.hp <= 0) {
            return;
        }
        let bullet = cc.instantiate(PrefabManager.towerBulletPrefabs[this.changeLevel]);
        let atkPos = this.roleNode.getChildByName("AtkPos").position;
        bullet.setParent(this.roleNode);
        bullet.setPosition(atkPos);
        bullet.zIndex = 1003;
        let targetPos = target.hitPos.convertToWorldSpaceAR(cc.v3(0, 0));
        targetPos = this.roleNode.convertToNodeSpaceAR(targetPos);
        let dir = cc.Vec3.subtract(new cc.Vec3(), atkPos, targetPos);
        let angle = cc.v2(atkPos).signAngle(cc.v2(targetPos)) / Math.PI * 180;
        bullet.angle = angle;
        let time = cc.Vec3.len(dir) / bulletSpeed;
        cc.tween(bullet)
            .to(time, { position: targetPos })
            .call(() => {
                target.hit(this.atk);
                this.roleNode.removeChild(bullet);
                this.canAtk = true;
            }, this)
            .start();
    }

    die() {
        this.isDead = true;
        this.roleNode.destroy();
    }

}
