export default class Tools {

    public static platform: string;

    static showToast(message: string) {
        switch (Tools.platform) {
            case "qg":
                window["qg"].showToast({
                    message: message
                });
                break;
            case "qq":
                window["qq"].showToast({
                    title: message
                });
                break;
            case "ks":
                window["ks"].showToast({
                    title: message,
                    icon: "none"
                })
                break;
            case "tt":
                window["tt"].showToast({
                    title: message,
                    icon: "none"
                })
                break;
            default:
                break;
        }
    }

    static getPlatformInfo() {
        if (window["qq"]) {
            Tools.platform = "qq";
            console.log("qq平台");
        }
        if (window["qg"]) {
            Tools.platform = "qg";
            console.log("vivo平台");
        }
        if (window["ks"]) {
            Tools.platform = "ks";
            console.log("快手平台");
        }
        if (window["tt"]) {
            Tools.platform = "tt";
            console.log("头条平台");
        }
    }

    static shuffle(array) {
        let j, x, i;
        for (i = array.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = array[i - 1];
            array[i - 1] = array[j];
            array[j] = x;
        }
        return array;
    }

    static deepCopy(array) {
        if (array.length <= 0) {
            return;
        }
        return [].concat(JSON.parse(JSON.stringify(array)))
    }

    static totalShuffle(array, correctCount?) {
        if (array.length == 0) {
            return;
        }
        if (correctCount > 0) {
            let correctIndex = [];
            for (let i = 0; i < correctCount; i++) {
                let randomIndex = this.getRandomNum(i * Math.floor(array / correctCount), (i + 1) * Math.floor(array / correctCount));
                correctIndex.push(randomIndex);
            }
        }
        let arrB = Tools.deepCopy(array);
        arrB = this.shuffle(arrB);
        for (let i = 0; i < array.length; i++) {
            if (array[i] == arrB[i]) {
                let index;
                if (i < arrB.length / 2) {
                    index = i + 1;
                } else {
                    index = i - 1;
                }
                let temp = arrB[index];
                arrB[index] = arrB[i];
                arrB[i] = temp;

                console.log("交换了：", arrB[i], arrB[index]);
            }
        }

        return arrB;
    }

    static getRandomNum(min: number, max: number) {
        let range = Math.abs(max - min);
        let rand = Math.random();

        return (Math.round(min) + Math.round(rand * range));
    }

    // 去除字符串中的所有空格
    static trim2(str: string) {
        const reg = /\s+/g;
        return str.replace(reg, '');
    }

    static splitGroup(list, count) {
        if (list.length < 0 || list.length < count) {
            return;
        }
        let group = [];
        for (let i = 0; i < count; i++) {
            group[i] = [];
        }

        let countIndex = 0;

        while (countIndex < count) {
            for (let i = 0; i < count; i++) {
                if (list[i * count + countIndex] == undefined) {
                    break;
                }
                group[i].push(list[i * count + countIndex]);
            }
            countIndex++;
        }
        return group;
    }

    public static setSceneDir(canvas: cc.Canvas, dir: number) {
        let frameSize = cc.view.getFrameSize();
        if (dir == 0) {
            cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT)
        } else {
            cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE)
        }


        if (frameSize.height > frameSize.width)
            cc.view.setFrameSize(frameSize.height, frameSize.width)

        // canvas 为当前fire场景的画板  
        canvas.designResolution = cc.size(1920, 1080);
    }
}
