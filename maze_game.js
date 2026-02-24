// 게임 설정
const CELL_SIZE = 30;
const DIFFICULTIES = {
    easy: { size: 11, name: '쉬움' },
    medium: { size: 15, name: '보통' },
    hard: { size: 21, name: '어려움' }
};

// 게임 상태
let gameState = {
    maze: [],
    playerX: 1,
    playerY: 1,
    goalX: 1,
    goalY: 1,
    currentDifficulty: 'easy',
    isGameRunning: false,
    moves: 0,
    startTime: 0,
    elapsedTime: 0,
    timerInterval: null
};

// Canvas 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 난이도 선택
function setDifficulty(level) {
    gameState.currentDifficulty = level;
    const diffName = DIFFICULTIES[level].name;
    
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('difficulty').textContent = diffName;
    
    showMessage(`난이도가 ${diffName}으로 설정되었습니다.`, 'info');
}

// 게임 시작
function startGame() {
    resetGame();
    generateMaze();
    gameState.isGameRunning = true;
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 100);
    draw();
    showMessage('게임 시작! 빨간색 출구를 찾아보세요!', 'info');
}

// 게임 초기화
function resetGame() {
    gameState.moves = 0;
    gameState.elapsedTime = 0;
    gameState.isGameRunning = false;
    gameState.playerX = 1;
    gameState.playerY = 1;
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    document.getElementById('moves').textContent = '0';
    document.getElementById('time').textContent = '0초';
    document.getElementById('message').classList.remove('success', 'info');
    
    draw();
}

// 미로 생성 (재귀적 백트래킹)
function generateMaze() {
    const size = DIFFICULTIES[gameState.currentDifficulty].size;
    gameState.maze = Array(size).fill(null).map(() => Array(size).fill(1));
    
    // 시작점 설정
    gameState.playerX = 1;
    gameState.playerY = 1;
    carvePath(1, 1);
    
    // 목표점 설정 (우측 하단)
    gameState.goalX = size - 2;
    gameState.goalY = size - 2;
    gameState.maze[gameState.goalY][gameState.goalX] = 0;
    
    // 시작점 설정
    gameState.maze[gameState.playerY][gameState.playerX] = 0;
}

// 미로 경로 생성
function carvePath(x, y) {
    gameState.maze[y][x] = 0;
    
    // 방향 배열 (상, 하, 좌, 우)
    const directions = [
        [0, -2],
        [0, 2],
        [-2, 0],
        [2, 0]
    ];
    
    // 방향을 무작위로 섞기
    shuffleArray(directions);
    
    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const size = DIFFICULTIES[gameState.currentDifficulty].size;
        
        // 범위 내 && 아직 방문하지 않은 경로
        if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && gameState.maze[ny][nx] === 1) {
            // 중간 경로 제거
            gameState.maze[y + dy / 2][x + dx / 2] = 0;
            carvePath(nx, ny);
        }
    }
}

// 배열 섞기 (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 타이머 업데이트
function updateTimer() {
    if (gameState.isGameRunning) {
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        document.getElementById('time').textContent = gameState.elapsedTime + '초';
    }
}

// 플레이어 이동
function movePlayer(dx, dy) {
    if (!gameState.isGameRunning) return;
    
    const newX = gameState.playerX + dx;
    const newY = gameState.playerY + dy;
    
    // 범위 확인
    if (newX < 0 || newX >= gameState.maze[0].length || 
        newY < 0 || newY >= gameState.maze.length) {
        return;
    }
    
    // 벽 확인
    if (gameState.maze[newY][newX] === 1) {
        return;
    }
    
    gameState.playerX = newX;
    gameState.playerY = newY;
    gameState.moves++;
    document.getElementById('moves').textContent = gameState.moves;
    
    // 목표 도달 확인
    if (gameState.playerX === gameState.goalX && gameState.playerY === gameState.goalY) {
        completeGame();
    }
    
    draw();
}

// 게임 완료
function completeGame() {
    gameState.isGameRunning = false;
    clearInterval(gameState.timerInterval);
    
    const message = `🎉 성공! ${gameState.elapsedTime}초에 ${gameState.moves}번 이동했습니다!`;
    showMessage(message, 'success');
}

// 메시지 표시
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
}

// 게임 그리기
function draw() {
    if (gameState.maze.length === 0) return;
    
    const size = gameState.maze.length;
    const width = size * CELL_SIZE;
    const height = size * CELL_SIZE;
    
    canvas.width = width;
    canvas.height = height;
    
    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // 미로 그리기
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = gameState.maze[y][x];
            
            if (cell === 1) {
                // 벽
                ctx.fillStyle = '#333333';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else {
                // 길
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = '#eeeeee';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    // 목표점 그리기 (출구)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        gameState.goalX * CELL_SIZE + 2,
        gameState.goalY * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚪', gameState.goalX * CELL_SIZE + CELL_SIZE / 2, gameState.goalY * CELL_SIZE + CELL_SIZE / 2);
    
    // 플레이어 그리기
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(
        gameState.playerX * CELL_SIZE + CELL_SIZE / 2,
        gameState.playerY * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😊', gameState.playerX * CELL_SIZE + CELL_SIZE / 2, gameState.playerY * CELL_SIZE + CELL_SIZE / 2);
}

// 키보드 입력
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 'arrowdown':
        case 's':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'arrowleft':
        case 'a':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'arrowright':
        case 'd':
            e.preventDefault();
            movePlayer(1, 0);
            break;
    }
});

// 초기 그리기
window.addEventListener('DOMContentLoaded', () => {
    resetGame();
});
