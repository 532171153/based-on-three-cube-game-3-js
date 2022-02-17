var speed = 0.01; // 移动速度
var totalScore = 0; // 总分
const color = [0,0,0]; // 颜色
const changeColorSpeed = [2,2,2]; // 颜色变换速度
const position = [0,0,0]; // 坐标
const direction = [0,0,0]; // 随机移动速度和方向
const bigBorder = 1.2; // 最大移动距离
let tempCube = null; // 预制体


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({
    antialias:true,
    alpha:true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const smallGeometry = new THREE.BoxGeometry();
const smallMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const smallCubeEdges = new THREE.EdgesGeometry(smallGeometry, 1);
const smallEdgesMtl =  new THREE.LineBasicMaterial({color: 0xffffff});
const smallCubeLine = new THREE.LineSegments(smallCubeEdges, smallEdgesMtl);
const smallCube = new THREE.Mesh( smallGeometry, smallMaterial );
smallCube.add(smallCubeLine);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
const cube = new THREE.Mesh( geometry, material );
cube.add(smallCube);
scene.add(cube);

const bigGeometry = new THREE.BoxGeometry();
const bigMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
const bigCubeEdges = new THREE.EdgesGeometry(bigGeometry, 1);
const bigEdgesMtl =  new THREE.LineBasicMaterial({color: 0x000000});
const bigCubeLine = new THREE.LineSegments(bigCubeEdges, bigEdgesMtl);
bigMaterial.transparent = true;//是否透明
bigMaterial.opacity = 0.03;//透明度
bigEdgesMtl.transparent = true;
bigEdgesMtl.opacity = 0.1;
const bigCube = new THREE.Mesh( bigGeometry, bigMaterial );
bigCube.add(bigCubeLine);
bigCube.scale.set(3,3,3);

cube.scale.set(0.5,0.5,0.5);
scene.add( bigCube );


camera.position.set(0,0,5);
console.log(cube);

const container = document.getElementById('container');
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px'; //显示在屏幕左上角的地方。
container.appendChild( stats.domElement );//添加到container之后


const totalScoreContainer = document.getElementById('totalScore');
totalScoreContainer.innerHTML = '总分: ' + totalScore;


const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.minDistance = 1;
controls.maxDistance = 8;
controls.target.set( 0, 0, 0 );
controls.noPan = true; // 禁用右键
controls.update();


function initDirection() {
    direction[0] = random();
    direction[1] = random();
    direction[2] = random();
}

function shouldChangeDirection() {
    if (position[0] > bigBorder) {
        direction[0] = -Math.abs(direction[0]);
    } else if (position[0] < -bigBorder) {
        direction[0] = Math.abs(direction[0]);
    } else if (position[1] > bigBorder) {
        direction[1] = -Math.abs(direction[1]);
    } else if (position[1] < -bigBorder) {
        direction[1] = Math.abs(direction[1]);
    } else if (position[2] > bigBorder) {
        direction[2] = -Math.abs(direction[2]);
    } else if (position[2] < -bigBorder) {
        direction[2] = Math.abs(direction[2]);
    }
}

function changePosition() {
    shouldChangeDirection();
    cube.translateX(direction[0] * speed); // 需要父元素，自身rotation会影响position
    cube.translateY(direction[1] * speed);
    cube.translateZ(direction[2] * speed);
    position[0] = cube.position.x;
    position[1] = cube.position.y;
    position[2] = cube.position.z;
}

function changeColor(num) {
    color[num] = color[num] + changeColorSpeed[num];
    if (color[num] >= 253) {
        changeColorSpeed[num] = -2;
    } else if (color[num] <= 2) {
        changeColorSpeed[num] = 2;
    }
    const newColor = new THREE.Color('rgb('+color[0]+','+color[1]+','+color[2]+')');
    const material = new THREE.MeshMatcapMaterial( { color: newColor } );
    smallCube.material = material;
    if (tempCube && tempCube.children.length > 0) {
        tempCube.children[0].material = material;
    }
}

function changeRotation(x, y, z) {
    smallCube.rotation.x += x;
    smallCube.rotation.y += y;
    smallCube.rotation.z += z;
    if (tempCube) {
        tempCube.rotation.x += x;
        tempCube.rotation.y += y;
        tempCube.rotation.z += z;
    }
}

function colorAnimate() {
    const num = random();
    if (num > 0.7) {
        changeColor(2);
    } else if (num < 0.3) {
        changeColor(0);
    } else {
        changeColor(1);
    }
}

function animate() {
    requestAnimationFrame( animate );
    changeRotation(0.01, 0.01, 0.01);
    colorAnimate();
    changePosition();
    render();
    stats.update();
    listenCameraPosition();
};

function listenCameraPosition() {
    if (camera && tempCube && cube) {
        const cxy = getAnglebyTan((camera.position.x - cube.position.x) / (camera.position.y - cube.position.y));
        const txy = getAnglebyTan((tempCube.position.x - cube.position.x) / (tempCube.position.y - cube.position.y));
        const cxz = getAnglebyTan((camera.position.x - cube.position.x) / (camera.position.z - cube.position.z));
        const txz = getAnglebyTan((tempCube.position.x - cube.position.x) / (tempCube.position.z - cube.position.z));
        if (cxy - txy > -1 && cxy - txy < 1 && cxz - txz > -1 && cxz - txz < 1) { // 直线顺序未判断
            console.log('success');
            totalScore++;
            totalScoreContainer.setAttribute("class","ani");
            totalScoreContainer.innerHTML = '总分: ' + totalScore;
            removeTempCube();
            setTimeout(() => {
                totalScoreContainer.setAttribute("class","");
                genericPoint();
            }, 300)
        }
    }
}

function getAnglebyTan(tan) {
    return Math.atan(tan) * 180 / Math.PI;
}

function random(k = 1) {
    return Math.random() * k;
}

function genericPoint() {
    const num = random();
    const x = random(3) - 1.5;
    const y = random(3) - 1.5;
    if (num < 0.16) {
        genericTempCube(x,1.5,y);
    } else if (num < 0.16 * 2) {
        genericTempCube(x,-1.5,y);
    } else if (num < 0.16 * 3) {
        genericTempCube(-1.5,x,y);
    } else if (num < 0.16 * 4) {
        genericTempCube(1.5,x,y);
    } else if (num < 0.16 * 5) {
        genericTempCube(x,y,1.5);
    } else {
        genericTempCube(x,y,-1.5);
    }
}

function genericTempCube(x, y, z) {
    const g = new THREE.BoxGeometry();
    const m = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
    const c = new THREE.EdgesGeometry(g, 1);
    const e =  new THREE.LineBasicMaterial({color: 0xffffff});
    const l = new THREE.LineSegments(c, e);
    tempCube = new THREE.Mesh( g, m );
    tempCube.add(l);
    tempCube.position.set(x, y, z);
    tempCube.scale.set(0.25,0.25,0.25);
    scene.add(tempCube);
}

function removeTempCube() {
    scene.remove(tempCube);
    tempCube = null;
}

function render() {
    renderer.render( scene, camera );
}

initDirection();
animate();
genericPoint();
