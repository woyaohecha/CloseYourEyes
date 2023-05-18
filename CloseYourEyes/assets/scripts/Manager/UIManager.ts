const { ccclass, property } = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {

    @property(cc.Label)
    winner: cc.Label = null;

    eventNode: cc.Node = null;
    titleTips: cc.Node = null;
    rankPanel: cc.Node = null;
    canShowTips: boolean = true;

    onLoad() {
        this.eventNode = cc.find("EventNode");
        // this.playerCountLabel = this.node.getChildByName("PlayerCount").getComponent(cc.Label);
        // this.enemyCountLabel = this.node.getChildByName("EnemyCount").getComponent(cc.Label);
        this.titleTips = this.node.getChildByName("TitleTips");
        this.rankPanel = this.node.getChildByName("Rank");
    }

    start() {

    }

    init() {
        this.titleTips.active = false;
        this.rankPanel.active = false;
        this.canShowTips = false;
    }

    showTips(tips: string, command?: string) {
        this.unscheduleAllCallbacks();
        for (let child of this.titleTips.children) {
            child.active = false;
        }

        switch (tips) {
            case "waitStart":
                this.titleTips.getChildByName("WaitStart").active = true;
                this.scheduleOnce(() => {
                    this.closeTips();
                    this.showTips("startCount");
                }, 5);
                break;
            case "startCount":
                let startCount = this.titleTips.getChildByName("StartCount");
                startCount.active = true
                let count = 10;
                let countLabel = startCount.getChildByName("CountBg").getChildByName("Count").getComponent(cc.Label);
                countLabel.string = String(count);
                let callback = () => {
                    count--;
                    countLabel.string = String(count);
                    if (count <= 0) {
                        this.unschedule(callback);
                        this.closeTips();
                        this.showTips("monsterComing");
                    }
                }
                this.schedule(callback, 1);
                break;
            case "monsterComing":
                this.titleTips.getChildByName("MonsterComing").active = true;;
                this.scheduleOnce(() => {
                    this.closeTips();
                    this.eventNode.emit("bossEnter");
                    this.canShowTips = true;
                }, 2)
                break;
            case "humanCommand":
                if (!this.canShowTips) {
                    return;
                }
                // return;
                let humanCommand = this.titleTips.getChildByName("HumanCommand");
                let humanCommandLabel: cc.Label = humanCommand.getChildByName("Command").getComponent(cc.Label);
                humanCommandLabel.string = command;
                humanCommand.active = true;
                this.scheduleOnce(() => {
                    this.closeTips();
                }, 2)
                break;
            case "monsterCommand":
                if (!this.canShowTips) {
                    return;
                }
                // return;
                let monsterCommand = this.titleTips.getChildByName("MonsterCommand");
                let monsterCommandLabel: cc.Label = monsterCommand.getChildByName("Command").getComponent(cc.Label);
                monsterCommandLabel.string = command;
                monsterCommand.active = true;
                this.scheduleOnce(() => {
                    this.closeTips();
                }, 2)
                break;
            case "gameOver":
                console.log("GameOver");
                this.canShowTips = false;
                let gameOver = this.titleTips.getChildByName("GameOver");
                gameOver.active = true;
                this.scheduleOnce(() => {
                    this.closeTips();
                    if (command && command == "人类") {
                        this.winner.string = command;
                        this.winner.node.color = new cc.Color().fromHEX("#21B1FB");
                    } else {
                        this.winner.string = command;
                        this.winner.node.color = cc.Color.RED;
                    }
                    this.rankPanel.active = true;
                }, 2);
                break;

            default:
                break;
        }
        this.titleTips.active = true;

    }

    gameOver() {

    }

    closeTips() {
        this.titleTips.active = false;
    }

}
