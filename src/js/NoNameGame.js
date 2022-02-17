/**
 * 1.休闲模式
 * 2.限时模式
 * 3.挑战模式
 *  1)简单
 *  2)中等
 *  3)困难
 */
class NoNameGame {
    constructor(options) {
        this.speed = options.speed || 0.01;
        this.changeColorSpeed = options.changeColorSpeed || [2,2,2];
        this.document = options.document;
        this.fpsElementId = options.fpsElementId;
        this.totalScoreId = options.totalScoreId;
        this.timerId = options.timerId;
        this.gameTipId = options.gameTipId;
        
        this.totalScore = 0;
        this.position = [0, 0, 0]; // 主要方块坐标
        this.direction = [0, 0, 0]; // 主要方块移动速度
        this.bigBorder = 1.2; // 主要方块最大移动边界
        this.color = [0, 0, 0]; // 颜色
        this.tempCube = null; // 临时方块
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer({
            antialias:true,
            alpha:true
        });
        this.status = false; // true 开始 false 结束
        this.startTime = 0;
        this.playTime = 0;
        this.gameModel = 1;
        this.difficulty = 10;
        this.showFPS = true;
        this.init();
    }

    init() {
        this.initRenderer();
        this.initGame();
        this.initStats();
        this.initTimer();
        this.startTimer();
        this.initGameTip();
        this.initTotalScoreContainer();
        this.initControls();
        this.initDirection();
        this.genericPoint();
        this.render();
    }

    initRenderer() {
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.document.body.appendChild( this.renderer.domElement );
    }

    // 初始化游戏
    initGame() {
        const smallGeometry = new THREE.BoxGeometry();
        const smallMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const smallCubeEdges = new THREE.EdgesGeometry(smallGeometry, 1);
        const smallEdgesMtl =  new THREE.LineBasicMaterial({color: 0xffffff});
        const smallCubeLine = new THREE.LineSegments(smallCubeEdges, smallEdgesMtl);
        this.smallCube = new THREE.Mesh( smallGeometry, smallMaterial );
        this.smallCube.add(smallCubeLine);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
        this.cube = new THREE.Mesh( geometry, material );
        this.cube.add(this.smallCube);
        this.scene.add(this.cube);

        const bigGeometry = new THREE.BoxGeometry();
        const bigMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        const bigCubeEdges = new THREE.EdgesGeometry(bigGeometry, 1);
        const bigEdgesMtl =  new THREE.LineBasicMaterial({color: 0x000000});
        const bigCubeLine = new THREE.LineSegments(bigCubeEdges, bigEdgesMtl);
        bigMaterial.transparent = true;//是否透明
        bigMaterial.opacity = 0.03;//透明度
        bigEdgesMtl.transparent = true;
        bigEdgesMtl.opacity = 0.1;
        this.bigCube = new THREE.Mesh( bigGeometry, bigMaterial );
        this.bigCube.add(bigCubeLine);
        this.bigCube.scale.set(3,3,3);

        this.cube.scale.set(0.5,0.5,0.5);
        this.scene.add( this.bigCube );

        this.camera.position.set(0,0,6);
        console.log(this.cube);
    }

    // 初始化fps显示
    initStats() {
        const container = this.document.getElementById(this.fpsElementId);
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.left = 'auto';
        this.stats.domElement.style.right = '0px';
        container.appendChild(this.stats.domElement);
    }

    initTotalScoreContainer() {
        this.totalScoreContainer = this.document.getElementById(this.totalScoreId);
        this.totalScoreContainer.innerHTML = '总分: ' + this.totalScore;
    }

    initTimer() {
        this.timerContainer = this.document.getElementById(this.timerId);
        this.timerContainer.innerHTML = '00:00:00';
    }

    initGameTip() {
        this.gameTipcontainer = this.document.getElementById(this.gameTipId);
    }

    // 初始化全局事件
    initControls() {
        const controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        controls.minDistance = 1;
        controls.maxDistance = 8;
        controls.target.set( 0, 0, 0 );
        controls.noPan = true; // 禁用右键
        controls.update();
    }

    // 初始化核心方块移动速度
    initDirection() {
        this.direction[0] = this.random();
        this.direction[1] = this.random();
        this.direction[2] = this.random();
    }

    // 随机数
    random(k = 1) {
        return Math.random() * k;
    }

    // 核心方块移动方向
    shouldChangeDirection() {
        if (this.position[0] > this.bigBorder) {
            this.direction[0] = -Math.abs(this.random());
        } else if (this.position[0] < -this.bigBorder) {
            this.direction[0] = Math.abs(this.random());
        } else if (this.position[1] > this.bigBorder) {
            this.direction[1] = -Math.abs(this.random());
        } else if (this.position[1] < -this.bigBorder) {
            this.direction[1] = Math.abs(this.random());
        } else if (this.position[2] > this.bigBorder) {
            this.direction[2] = -Math.abs(this.random());
        } else if (this.position[2] < -this.bigBorder) {
            this.direction[2] = Math.abs(this.random());
        }
    }

    // 改变核心方块位置
    changePosition() {
        this.shouldChangeDirection();
        this.cube.translateX(this.direction[0] * this.speed); // 控制父元素，自身rotation会影响position
        this.cube.translateY(this.direction[1] * this.speed);
        this.cube.translateZ(this.direction[2] * this.speed);
        this.position[0] = this.cube.position.x;
        this.position[1] = this.cube.position.y;
        this.position[2] = this.cube.position.z;
    }
    
    // 改变方块旋转角度
    changeRotation(x, y, z) {
        this.smallCube.rotation.x += x;
        this.smallCube.rotation.y += y;
        this.smallCube.rotation.z += z;
        if (this.tempCube) {
            this.tempCube.rotation.x += x;
            this.tempCube.rotation.y += y;
            this.tempCube.rotation.z += z;
        }
    }

    // 改变颜色
    changeColor(num) {
        this.color[num] = this.color[num] + this.changeColorSpeed[num];
        if (this.color[num] >= 253) {
            this.changeColorSpeed[num] = -2;
        } else if (this.color[num] <= 2) {
            this.changeColorSpeed[num] = 2;
        }
        const newColor = new THREE.Color('rgb(' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ')');
        const material = new THREE.MeshMatcapMaterial( { color: newColor } );
        this.smallCube.material = material;
        if (this.tempCube && this.tempCube.children.length > 0) {
            this.tempCube.children[0].material = material;
        }
    }

    // 颜色渐变方向
    colorAnimate() {
        const num = this.random();
        if (num > 0.7) {
            this.changeColor(2);
        } else if (num < 0.3) {
            this.changeColor(0);
        } else {
            this.changeColor(1);
        }
    }

    // 判断是否得分
    judgeScore() {
        if (this.camera && this.tempCube && this.cube) {
            const ccxy = this.getAnglebyTan((this.camera.position.x - this.cube.position.x) / (this.camera.position.y - this.cube.position.y));
            const tcxy = this.getAnglebyTan((this.tempCube.position.x - this.cube.position.x) / (this.tempCube.position.y - this.cube.position.y));
            const ccxz = this.getAnglebyTan((this.camera.position.x - this.cube.position.x) / (this.camera.position.z - this.cube.position.z));
            const tcxz = this.getAnglebyTan((this.tempCube.position.x - this.cube.position.x) / (this.tempCube.position.z - this.cube.position.z));
            const x = Math.abs(this.tempCube.position.x - this.cube.position.x);
            const y = Math.abs(this.tempCube.position.y - this.cube.position.y);
            const z = Math.abs(this.tempCube.position.z - this.cube.position.z);
            const error = 1 + 1 / ((x + y + z) / 3);
            if (ccxy - tcxy > -error && ccxy - tcxy < error && ccxz - tcxz > -error && ccxz - tcxz < error) { // 三点直线顺序未判断
                console.log('success');
                this.totalScore++;
                this.totalScoreContainer.setAttribute("class","ani");
                this.totalScoreContainer.innerHTML = '总分: ' + this.totalScore;
                this.removeTempCube();
                if (this.gameModel === 3) {
                    this.startTime = this.getNowDate();
                }
                setTimeout(() => {
                    this.totalScoreContainer.setAttribute("class","");
                    this.genericPoint();
                }, 300)
            }
        }
    }

    // 根据tan获取角度
    getAnglebyTan(tan) {
        return Math.atan(tan) * 180 / Math.PI;
    }

    // 临时方块生成位置
    genericPoint() {
        const num = this.random();
        const x = this.random(3) - 1.5;
        const y = this.random(3) - 1.5;
        if (num < 0.16) {
            this.genericTempCube(x,1.5,y);
        } else if (num < 0.16 * 2) {
            this.genericTempCube(x,-1.5,y);
        } else if (num < 0.16 * 3) {
            this.genericTempCube(-1.5,x,y);
        } else if (num < 0.16 * 4) {
            this.genericTempCube(1.5,x,y);
        } else if (num < 0.16 * 5) {
            this.genericTempCube(x,y,1.5);
        } else {
            this.genericTempCube(x,y,-1.5);
        }
    }

    // 创建临时方块
    genericTempCube(x, y, z) {
        const g = new THREE.BoxGeometry();
        const m = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
        const c = new THREE.EdgesGeometry(g, 1);
        const e =  new THREE.LineBasicMaterial({color: 0xffffff});
        const l = new THREE.LineSegments(c, e);
        this.tempCube = new THREE.Mesh( g, m );
        this.tempCube.add(l);
        this.tempCube.position.set(x, y, z);
        this.tempCube.scale.set(0.25,0.25,0.25);
        this.scene.add(this.tempCube);
    }

    // 移除临时方块
    removeTempCube() {
        this.scene.remove(this.tempCube);
        this.tempCube = null;
    }

    // threejs渲染
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    showStatsFPS(bool) {
        this.showFPS = bool;
        if (this.showFPS) {
            this.stats.domElement.style.display = 'block';
        } else {
            this.stats.domElement.style.display = 'none';
        }
    }

    // 更新
    update() {
        if (this.stats && this.showFPS) {
            this.stats.update();
        }
        if (this.status) {
            this.gameRenderer();
        }
    };

    // 初始化渲染
    gameRenderer() {
        this.changeRotation(0.01, 0.01, 0.01);
        this.colorAnimate();
        this.changePosition();
        this.render();
        this.judgeScore();
        this.changeTimer();
        this.shouldStop();
    }

    // 设置速度
    setSpeed(num) {
        this.speed = num;
    }

    // 是否游戏结束
    shouldStop() {
        if (this.playTime <= 0) {
            this.playTime = 0;
            this.status = false;
            this.timerContainer.innerHTML = '00:00:00';
            this.gameTipcontainer.innerHTML = '游戏结束!';
        }
    }

    // 重置游戏结束提示
    resetGameTip() {
        this.gameTipcontainer.innerHTML = '';
    }

    // 切换游戏模式
    changeModel(num) {
        this.gameModel = num;
        this.reset();
        if (this.gameModel === 1) {
            console.log('休闲模式');
        } else if (this.gameModel === 2) {
            console.log('限时模式');
            this.timerContainer.innerHTML = this.formatTime(60 * 1000);
        } else if (this.gameModel === 3) {
            console.log('挑战模式');
            this.timerContainer.innerHTML = this.formatTime(this.difficulty * 1000);
        }
    }

    // 挑战模式   this.gameModel === 3
    changeDifficulty(num) {
        this.reset();
        this.difficulty = num;
        this.timerContainer.innerHTML = this.formatTime(this.difficulty * 1000);
    }

    // 初始化游戏时间
    startTimer() {
        this.startTime = this.getNowDate();
    }

    // 获取当前时间戳
    getNowDate() {
        return new Date().getTime();
    }

    // 更新时间计时器
    changeTimer() {
        const nowTime = this.getNowDate();
        if (this.gameModel === 1) {
            this.playTime = nowTime - this.startTime;
        } else if (this.gameModel === 2) {
            this.playTime = 1000 * 60 - (nowTime - this.startTime);
        } else {
            this.playTime = 1000 * this.difficulty - (nowTime - this.startTime);
        }
        if (this.timerContainer) {
            this.timerContainer.innerHTML = this.formatTime();
        }
    }

    // 格式化时间计时器
    formatTime(time) {
        const playTime = time ?? this.playTime;
        let minutes = Math.floor(playTime / 1000 / 60);
        minutes = minutes > 9 ? minutes : '0' + minutes;
        let second = Math.floor((playTime - minutes * 1000 * 60) / 1000);
        second = second > 9 ? second : '0' + second;
        const playTimeStr = playTime + '';
        const milliseconds = playTimeStr.substring(playTimeStr.length - 3, playTimeStr.length - 1).padStart(2, '0');
        return minutes + ':' + second + ':' + milliseconds;
    }

    // 重置
    reset() {
        this.cube.position.set(0,0,0);
        this.tempCube.rotation.set(0,0,0);
        this.smallCube.rotation.set(0,0,0);
        this.camera.position.set(0,0,6);
        this.camera.rotation.set(0,0,0);
        this.totalScore = 0;
        this.totalScoreContainer.innerHTML = '总分: ' + this.totalScore;
        this.timerContainer.innerHTML = '00:00:00';
        this.resetGameTip();
        this.render();
        this.status = false;
    }

    // 开始
    play() {
        this.reset();
        this.status = true;
        this.startTime = this.getNowDate();
    }

}