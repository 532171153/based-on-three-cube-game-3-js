var noNameGame = new NoNameGame({
    speed: 0.01,
    document: window.document,
    fpsElementId: 'container',
    totalScoreId: 'totalScore',
    timerId: 'timer',
    gameTipId: 'gameTip'
})

function animate() {
    requestAnimationFrame(animate);
    noNameGame.update();
};

animate();

function onSpeedChange(ev) {
    noNameGame.setSpeed(ev.target.value * 1);
}

function onModelChange(ev) {
    const num = ev.target.value * 1;
    const difficulty = document.getElementById('difficulty');
    if (num === 3) {
        difficulty.style.display = 'block';
    } else {
        difficulty.style.display = 'none';
    }
    noNameGame.changeModel(num);
}

function onDifficultyChange(ev) {
    noNameGame.changeDifficulty(ev.target.value * 1);
}

function play() {
    noNameGame.play();
}