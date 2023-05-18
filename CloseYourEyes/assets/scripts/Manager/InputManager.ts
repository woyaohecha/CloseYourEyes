import UIManager from "./UIManager";

const { ccclass, property } = cc._decorator;


@ccclass
export default class InputManager extends cc.Component {
    eventNode: cc.Node = null;
    editBox: cc.EditBox = null;
    canInput: boolean = false;
    canGetCommand: boolean = false;
    uiManager: UIManager = null;

    onLoad() {
        this.eventNode = cc.find("EventNode");
        this.editBox = this.getComponent(cc.EditBox);
        this.uiManager = this.node.parent.getComponent("UIManager");

        //游戏初始化后才可以接收指令
        this.eventNode.on("canGetCommand", () => {
            this.canGetCommand = true;
        });
        this.eventNode.on("init", this.init, this);

        //监听游戏结束事件
        this.eventNode.on("gameEnd", () => {
            this.canInput = false;
        }, this)

        this.init();
    }

    init() {
        this.canInput = false;
        this.editBox.string = "";
    }


    //获取指令信息
    onEditingReturn(editBox: cc.EditBox) {
        //需要等待可以接收指令后才可以处理指令逻辑
        if (!this.canGetCommand) {
            return;
        }
        //需要在开始游戏后才可以输入指令
        if (!this.canInput && editBox.string == "开始游戏") {
            this.canInput = true;
            this.uiManager.showTips("waitStart");
            return;
        }
        let commands = editBox.string.split("+");
        if (!this.canInput || commands.length != 2 || commands[0].length == 0 || commands[1].length == 0) {
            console.log("输入不符合规范，请重新输入");
            return;
        }
        this.eventNode.emit("getCommand", commands[0], commands[1]);
        console.log("发送指令成功：", commands[0], commands[1]);
        editBox.string = "";
    }
}
