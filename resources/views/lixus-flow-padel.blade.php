<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Adu Padel - Versi Dinamis</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #F5A623 0%, #FF8C42 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
            touch-action: none;
        }

        #gameContainer {
            width: 100%;
            max-width: 400px;
            height: 100vh;
            max-height: 812px;
            position: relative;
            background: #F5A623;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        #header {
            height: 80px;
            background: linear-gradient(180deg, #F5A623 0%, #FF8C42 100%);
            display: flex;
            align-items: center;
            justify-content: space-around;
            position: relative;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10;
        }

        .score-display {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .player-indicator {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .player-indicator.player {
            background: #FF6B35;
            color: white;
        }

        .player-indicator.ai {
            background: #17A2B8;
            color: white;
        }

        .score {
            background: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            min-width: 50px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .timer-display {
            background: white;
            padding: 10px 15px;
            border-radius: 50%;
            font-size: 20px;
            font-weight: bold;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        #gameCanvas {
            width: 100%;
            height: calc(100% - 80px);
            display: block;
            cursor: pointer;
            position: absolute;
            top: 80px;
            left: 0;
        }

        #startScreen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #F5A623 0%, #FF8C42 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 100;
        }

        #startScreen.hidden {
            display: none;
        }

        .logo-container {
            background: white;
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .game-title {
            font-size: 42px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        }

        .game-title .adu {
            color: #333;
        }

        .game-title .padel {
            color: #FF6B35;
        }

        .racket-emoji {
            font-size: 60px;
            text-align: center;
        }

        .subtitle {
            color: #666;
            font-size: 14px;
            text-align: center;
            margin-top: 10px;
        }

        .play-btn {
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
            color: white;
            border: none;
            padding: 18px 60px;
            font-size: 28px;
            font-weight: bold;
            border-radius: 40px;
            cursor: pointer;
            box-shadow: 0 8px 0 #D55030, 0 10px 20px rgba(0,0,0,0.3);
            transition: all 0.1s;
            letter-spacing: 2px;
        }

        .play-btn:active {
            transform: translateY(4px);
            box-shadow: 0 4px 0 #D55030, 0 5px 10px rgba(0,0,0,0.3);
        }
        
        .game-over-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 90;
        }

        .game-over-screen.show {
            display: flex;
        }

        .result-box {
            background: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .result-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .win { color: #4CAF50; }
        .lose { color: #f44336; }
        .draw { color: #FF9800; }

        .final-score {
            font-size: 48px;
            font-weight: bold;
            margin: 20px 0;
        }

        .play-again-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 20px;
            box-shadow: 0 4px 0 #388E3C;
        }

        .play-again-btn:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #388E3C;
        }
        
        #pointResultPopup {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 110;
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
            pointer-events: none;
        }

        #pointResultPopup.show {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        #pointResultPopup .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        #pointResultPopup .title.win {
            color: #76ff03;
        }

        #pointResultPopup .title.lose {
            color: #f44336;
        }

        #pointResultPopup .reason {
            font-size: 14px;
            color: #ccc;
        }

    </style>
</head>
<body>
    <div id="gameContainer">
        <div id="header">
            <div class="score-display">
                <div class="player-indicator player">P</div>
                <div class="score" id="playerScore">0</div>
            </div>
            <div class="timer-display" id="timer">60</div>
            <div class="score-display">
                <div class="score" id="aiScore">0</div>
                <div class="player-indicator ai">AI</div>
            </div>
        </div>
        
        <canvas id="gameCanvas"></canvas>
        
        <div id="pointResultPopup">
            <div id="pointResultTitle" class="title"></div>
            <div id="pointResultReason" class="reason"></div>
        </div>
        
        <div id="startScreen">
            <div class="logo-container">
                <div class="game-title">
                    <span class="adu">ADU</span>
                    <span class="padel">PADEL</span>
                </div>
                <div class="racket-emoji">🏸</div>
                <div class="subtitle">Danamon Challenge</div>
            </div>
            <button class="play-btn" onclick="startGame()">MAIN</button>
        </div>
        
        <div class="game-over-screen" id="gameOverScreen">
            <div class="result-box">
                <div class="result-title" id="resultTitle"></div>
                <div class="final-score">
                    <span id="finalPlayerScore">0</span> - <span id="finalAiScore">0</span>
                </div>
                <button class="play-again-btn" onclick="resetGame()">Main Lagi</button>
            </div>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const startScreen = document.getElementById('startScreen');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const playerScoreEl = document.getElementById('playerScore');
        const aiScoreEl = document.getElementById('aiScore');
        const timerEl = document.getElementById('timer');
        const resultTitle = document.getElementById('resultTitle');
        const finalPlayerScoreEl = document.getElementById('finalPlayerScore');
        const finalAiScoreEl = document.getElementById('finalAiScore');
        const pointResultPopup = document.getElementById('pointResultPopup');
        const pointResultTitle = document.getElementById('pointResultTitle');
        const pointResultReason = document.getElementById('pointResultReason');

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        window.addEventListener('resize', resizeCanvas, false);
        
        let gameRunning = false;
        let playerScore = 0;
        let aiScore = 0;
        let gameTime = 60;
        let timerInterval;
        let gameState = 'start';
        // **FIX 1: Variabel baru untuk mengelola state serve**
        let serveState = null; // null, 'readyToDrop', 'dropping', 'readyToHit', 'inFlight'
        let server = 'player';
        let servingSide = 'right';
        let targetServiceBox = null;
        let serveFlash = 0;


        const court = {
            width: 0, height: 0, x: 0, y: 0,
            wallHeight: 30, netHeight: 15,
            perspectiveOffset: 20,
            zones: {},
            init() {
                this.width = canvas.width * 0.8;
                this.height = canvas.height * 0.75;
                this.x = (canvas.width - this.width) / 2;
                this.y = (canvas.height - this.height) / 2;
                
                const netY = this.y + this.height / 2;
                const serviceLineDepth = (this.height / 2) * 0.7; 

                const aiServiceLineY = this.y + (this.height / 2) - serviceLineDepth;
                const playerServiceLineY = netY + serviceLineDepth;

                this.zones = {
                    aiLeft: { x: this.x, y: aiServiceLineY, width: this.width / 2, height: serviceLineDepth },
                    aiRight: { x: this.x + this.width / 2, y: aiServiceLineY, width: this.width / 2, height: serviceLineDepth },
                    playerLeft: { x: this.x, y: netY, width: this.width / 2, height: serviceLineDepth },
                    playerRight: { x: this.x + this.width / 2, y: netY, width: this.width / 2, height: serviceLineDepth },
                    aiServiceLineY: aiServiceLineY,
                    playerServiceLineY: playerServiceLineY
                }
            }
        };

        const player = {
            x: 0, y: 0,
            width: 30, height: 40,
            color: '#FF6B35',
            scaleX: 1, scaleY: 1,
        };

        const ai = {
            x: 0, y: 0,
            width: 30, height: 40,
            targetX: 0, targetY: 0,
            speed: 0.08,
            color: '#17A2B8',
            scaleX: 1, scaleY: 1
        };

        const ball = {
            x: 0, y: 0, z: 25,
            radius: 7,
            speedX: 0, speedY: 0, speedZ: 0,
            baseSpeed: 7.5, // Kecepatan pukulan serve
            maxSpeed: 12,
            color: '#FFE135',
            trail: [],
            gravity: 0.35,
            bounceForce: 0.8,
            scaleX: 1, scaleY: 1,
            hitCooldown: 0,
            bounces: 0,
            lastCourtSide: null, 
            lastHitBy: null,
            canBeHit: false 
        };

        let input = { x: 0, y: 0, active: false, tapped: false };

        function handleInput(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches ? e.touches[0] : e;
            input.x = touch.clientX - rect.left;
            input.y = touch.clientY - rect.top;
            input.active = true;

            // Hanya proses tap sekali per frame untuk menghindari double trigger
            if (!input.tapped) {
                if (gameState === 'serving' && server === 'player') {
                    if (serveState === 'readyToDrop') {
                        dropBall();
                    } else if (serveState === 'readyToHit') {
                        hitServe();
                    }
                }
                input.tapped = true;
            }
        }

        canvas.addEventListener('touchstart', handleInput, { passive: false });
        canvas.addEventListener('touchmove', handleInput, { passive: false });
        canvas.addEventListener('touchend', () => {
            input.active = false;
            input.tapped = false; // Reset status tap saat jari diangkat
        });
        canvas.addEventListener('mousedown', handleInput);
        canvas.addEventListener('mousemove', (e) => { if (e.buttons === 1) handleInput(e); });
        canvas.addEventListener('mouseup', () => {
            input.active = false;
            input.tapped = false;
        });

        function startGame() {
            startScreen.classList.add('hidden');
            resizeCanvas();
            court.init();
            resetGame();
            gameRunning = true;
            gameState = 'serving';
            gameLoop();
            
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (!gameRunning) return;
                gameTime--;
                timerEl.textContent = gameTime;
                if (gameTime <= 0) endGame();
            }, 1000);
        }

        function resetGame() {
            gameOverScreen.classList.remove('show');
            playerScore = 0;
            aiScore = 0;
            gameTime = 60;
            playerScoreEl.textContent = '0';
            aiScoreEl.textContent = '0';
            timerEl.textContent = '60';
            server = 'player';
            servingSide = 'right';
            prepareServe();
        }

        function showPointResult(title, reason, type) {
            pointResultTitle.textContent = title;
            pointResultReason.textContent = reason;
            pointResultTitle.className = `title ${type}`;
            pointResultPopup.classList.add('show');

            setTimeout(() => {
                pointResultPopup.classList.remove('show');
                if (gameState !== 'gameOver') {
                    prepareServe();
                }
            }, 1500);
        }

        function pointWon(winner, reason) {
            if (gameState === 'pointScored') return;
            gameState = 'pointScored';
            serveState = null;

            if (winner === 'player') {
                playerScore++;
                playerScoreEl.textContent = playerScore;
                server = 'player';
                showPointResult('WIN', reason, 'win');
            } else {
                aiScore++;
                aiScoreEl.textContent = aiScore;
                server = 'ai';
                showPointResult('LOSE', reason, 'lose');
            }
            servingSide = servingSide === 'left' ? 'right' : 'left';
        }

        function prepareServe() {
            gameState = 'serving';
            ball.bounces = 0;
            ball.speedX = 0;
            ball.speedY = 0;
            ball.speedZ = 0;
            ball.z = 40; // Posisi awal bola di udara
            ball.canBeHit = false;

            if (server === 'player') {
                serveState = 'readyToDrop';
                player.y = court.y + court.height - player.height - 5;
                player.x = servingSide === 'right' ? court.x + court.width * 0.75 - player.width / 2 : court.x + court.width * 0.25 - player.width / 2;
                ball.x = player.x + player.width / 2;
                ball.y = player.y - player.height; // Bola di depan pemain
                targetServiceBox = servingSide === 'right' ? court.zones.aiLeft : court.zones.aiRight;
            } else {
                serveState = 'inFlight'; // AI langsung memukul
                ai.y = court.y + 5;
                ai.x = servingSide === 'right' ? court.x + court.width * 0.75 - ai.width / 2 : court.x + court.width * 0.25 - ai.width / 2;
                ball.x = ai.x + ai.width / 2;
                ball.y = ai.y + ai.height + 20;
                targetServiceBox = servingSide === 'right' ? court.zones.playerLeft : court.zones.playerRight;
                setTimeout(hitServe, 1000); // AI serve setelah 1 detik
            }
        }
        
        // **FIX 1: Fungsi baru untuk tahap 1 serve (menjatuhkan bola)**
        function dropBall() {
            if (serveState !== 'readyToDrop') return;
            serveState = 'dropping';
            // Biarkan gravitasi yang bekerja, tidak perlu speed awal
        }

        // **FIX 1: Fungsi ini sekarang untuk memukul serve (tahap 2)**
        function hitServe() {
            ball.lastHitBy = server;
            const targetX = targetServiceBox.x + targetServiceBox.width / 2;
            const targetY = targetServiceBox.y + targetServiceBox.height / 2;

            const angle = Math.atan2(targetY - ball.y, targetX - ball.x);
            const serveSpeed = ball.baseSpeed;
            ball.speedX = Math.cos(angle) * serveSpeed;
            ball.speedY = Math.sin(angle) * serveSpeed;
            ball.speedZ = 6; // Beri sedikit pantulan ke atas saat dipukul
            ball.canBeHit = false;
            
            if (server === 'player') {
                serveState = 'inFlight';
                applySquash(player, 0.3, 120);
            }
            applySquash(ball, 0.5, 120);
        }
        
        function applySquash(entity, intensity, duration) {
            entity.scaleX = 1 + intensity;
            entity.scaleY = 1 - intensity;
            setTimeout(() => {
                entity.scaleX = 1;
                entity.scaleY = 1;
            }, duration);
        }

        function updatePlayer() {
            if (serveState === 'readyToDrop' || serveState === 'dropping') return;

            if (input.active) {
                player.x = input.x - player.width / 2;
                player.y = input.y - player.height / 2;
            }
            
            player.x = Math.max(court.x, Math.min(court.x + court.width - player.width, player.x));
            player.y = Math.max(court.y + court.height / 2, Math.min(court.y + court.height - player.height, player.y));
        }

        function updateAI() {
             if (gameState === 'serving' && server === 'ai') return;
            ai.targetX = ball.x - ai.width / 2;
            ai.targetY = court.y + court.height * (ball.speedY < 0 ? 0.25 : 0.1);
            const dx = ai.targetX - ai.x;
            const dy = ai.targetY - ai.y;
            ai.x += dx * ai.speed;
            ai.y += dy * ai.speed;
            ai.x = Math.max(court.x, Math.min(court.x + court.width - ai.width, ai.x));
            ai.y = Math.max(court.y, Math.min(court.y + court.height / 2 - ai.height, ai.y));
        }

        function updateBall() {
            if (ball.hitCooldown > 0) ball.hitCooldown--;
            
            // Hanya update posisi jika game tidak sedang menunggu serve drop
            if (serveState !== 'readyToDrop') {
                ball.trail.push({ x: ball.x, y: ball.y, z: ball.z, r: ball.radius * (1 + ball.z / 100) });
                if (ball.trail.length > 15) ball.trail.shift();
                
                ball.x += ball.speedX;
                ball.y += ball.speedY;
                ball.z += ball.speedZ;
                ball.speedZ -= ball.gravity;
            }
            
            if (ball.z < 0) {
                ball.z = 0;
                ball.speedZ *= -ball.bounceForce;
                applySquash(ball, 0.4, 100);
                
                ball.canBeHit = true; 

                // **FIX 1: Logika baru untuk menangani state serve**
                if (gameState === 'serving') {
                    const currentSide = ball.y > court.y + court.height / 2 ? 'player' : 'ai';
                    
                    if (serveState === 'dropping' && currentSide === 'player') {
                        // Bola sudah memantul di area kita, siap dipukul
                        serveState = 'readyToHit';
                    } else if (serveState === 'inFlight') {
                        // Cek apakah serve masuk setelah dipukul
                        const isInTargetBox = ball.x > targetServiceBox.x && ball.x < targetServiceBox.x + targetServiceBox.width &&
                                              ball.y > targetServiceBox.y && ball.y < targetServiceBox.y + targetServiceBox.height;
                        if (isInTargetBox) {
                            gameState = 'playing';
                            serveState = null;
                        } else {
                            pointWon(server === 'player' ? 'ai' : 'player', 'Serve gagal');
                            return;
                        }
                    }
                }
                
                if (gameState === 'playing') {
                    const currentSide = ball.y > court.y + court.height / 2 ? 'player' : 'ai';
                    if (ball.lastCourtSide === currentSide) {
                        ball.bounces++;
                    } else {
                        ball.bounces = 1;
                        ball.lastCourtSide = currentSide;
                    }

                    if (ball.bounces >= 2) {
                        pointWon(currentSide === 'player' ? 'ai' : 'player', 'Bola memantul 2x');
                    }
                }
            }
            
            const netY = court.y + court.height / 2;
            if (gameState !== 'serving' && ball.y > netY - ball.radius && ball.y < netY + ball.radius && ball.z < court.netHeight) {
                pointWon(ball.lastHitBy === 'player' ? 'ai' : 'player', 'Bola kena net');
                return;
            }

            if (gameState === 'playing' && ball.z <=0) {
                if (ball.y + ball.radius > court.y + court.height || ball.y - ball.radius < court.y) {
                    pointWon(ball.lastHitBy === 'player' ? 'ai' : 'player', 'Bola keluar');
                }
            }

            if (ball.x - ball.radius < court.x || ball.x + ball.radius > court.x + court.width) {
                ball.speedX *= -0.9;
                ball.x = ball.x - ball.radius < court.x ? court.x + ball.radius : court.x + court.width - ball.radius;
                applySquash(ball, 0.2, 100);
            }
            
            checkCollision(player);
            checkCollision(ai);
        }

        function checkCollision(char) {
            // Pemain tidak bisa memukul bola saat sedang proses drop serve
            if (ball.hitCooldown > 0 || serveState === 'dropping' || serveState === 'readyToDrop') return;
            
            // Pemain hanya bisa memukul bola serve saat state-nya 'readyToHit'
            if (gameState === 'serving' && serveState !== 'readyToHit') return;

            const isPlayer = char === player;
            if (isPlayer && gameState === 'playing' && input.tapped) {
                 // Logika pukulan biasa saat reli bisa ditambahkan di sini jika perlu
            }

            const receiver = isPlayer ? 'player' : 'ai';
            
            const pupilDirX = (ball.x - char.x) / canvas.width;
            const racketAngle = pupilDirX * 1.5;
            const racketHandX = char.x + (isPlayer ? char.width : 0);
            const racketHandY = char.y + char.height * 0.6;
            const racketLength = 28;
            const racketHeadRadius = 14;
            const racketHeadX = racketHandX + Math.cos(racketAngle) * racketLength;
            const racketHeadY = racketHandY + Math.sin(racketAngle) * racketLength;
            const dx = ball.x - racketHeadX;
            const dy = ball.y - racketHeadY;
            const dz = ball.z;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < racketHeadRadius + ball.radius && dz < char.height && dz > 0 && gameState === 'playing') {
                if (ball.canBeHit) {
                    const hitAngle = Math.atan2(dy, dx);
                    const newSpeed = Math.min(ball.maxSpeed, ball.baseSpeed * 1.5);

                    ball.speedX = Math.cos(hitAngle) * newSpeed;
                    ball.speedY = Math.sin(hitAngle) * newSpeed;
                    
                    ball.speedZ = 5 + Math.random() * 3;
                    ball.hitCooldown = 10;
                    ball.bounces = 0;
                    ball.lastHitBy = isPlayer ? 'player' : 'ai';
                    ball.canBeHit = false;
                    
                    applySquash(ball, 0.5, 120);
                    applySquash(char, 0.3, 120);
                }
            }
        }

        function drawCourt() {
            const floorGradient = ctx.createLinearGradient(0, court.y, 0, court.y + court.height);
            floorGradient.addColorStop(0, '#4A90E2');
            floorGradient.addColorStop(1, '#3A7BD5');
            ctx.fillStyle = floorGradient;
            ctx.fillRect(court.x, court.y, court.width, court.height);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 4;
            ctx.strokeRect(court.x, court.y, court.width, court.height);
            
            ctx.lineWidth = 2;
            const { aiServiceLineY, playerServiceLineY } = court.zones;
            
            ctx.beginPath();
            ctx.moveTo(court.x, aiServiceLineY);
            ctx.lineTo(court.x + court.width, aiServiceLineY);
            ctx.moveTo(court.x, playerServiceLineY);
            ctx.lineTo(court.x + court.width, playerServiceLineY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(court.x + court.width / 2, aiServiceLineY);
            ctx.lineTo(court.x + court.width / 2, playerServiceLineY);
            ctx.stroke();

            const netY = court.y + court.height / 2;
            const shadowGradient = ctx.createLinearGradient(0, netY - 5, 0, netY + 15);
            shadowGradient.addColorStop(0, 'transparent');
            shadowGradient.addColorStop(1, 'rgba(0,0,0,0.3)');
            ctx.fillStyle = shadowGradient;
            ctx.fillRect(court.x, netY - 5, court.width, 20);

            ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
            ctx.fillRect(court.x - 2, netY - court.netHeight, court.width + 4, court.netHeight);
            ctx.fillStyle = 'white';
            ctx.fillRect(court.x - 2, netY - court.netHeight, court.width + 4, 2);

            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillStyle = 'rgba(210, 230, 240, 0.15)';
            ctx.lineWidth = 2;
            const p = court.perspectiveOffset;

             ctx.beginPath();
            ctx.moveTo(court.x - p, court.y - court.wallHeight);
            ctx.lineTo(court.x + court.width + p, court.y - court.wallHeight);
            ctx.lineTo(court.x + court.width, court.y);
            ctx.lineTo(court.x, court.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(court.x, court.y + court.height);
            ctx.lineTo(court.x + court.width, court.y + court.height);
            ctx.lineTo(court.x + court.width + p, court.y + court.height + court.wallHeight);
            ctx.lineTo(court.x - p, court.y + court.height + court.wallHeight);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(court.x, court.y);
            ctx.lineTo(court.x - p, court.y - court.wallHeight);
            ctx.lineTo(court.x - p, court.y + court.height + court.wallHeight);
            ctx.lineTo(court.x, court.y + court.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(court.x + court.width, court.y);
            ctx.lineTo(court.x + court.width + p, court.y - court.wallHeight);
            ctx.lineTo(court.x + court.width + p, court.y + court.height + court.wallHeight);
            ctx.lineTo(court.x + court.width, court.y + court.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        function drawCharacter(char) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(char.x + char.width / 2, char.y + char.height, char.width * 0.4, 5, 0, 0, 2 * Math.PI);
            ctx.fill();

            const bodyX = char.x + char.width / 2;
            const bodyY = char.y + char.height / 2;
            ctx.translate(bodyX, bodyY);
            ctx.scale(char.scaleX, char.scaleY);
            ctx.translate(-bodyX, -bodyY);

            ctx.fillStyle = char.color;
            ctx.beginPath();
            ctx.roundRect(char.x, char.y, char.width, char.height, 15);
            ctx.fill();

            ctx.save();
            const isPlayer = char === player;
            const pupilDirX = (ball.x - char.x) / canvas.width;
            const racketAngle = pupilDirX * 1.5;
            const racketHandX = char.x + (isPlayer ? char.width : 0);
            const racketHandY = char.y + char.height * 0.6;

            ctx.translate(racketHandX, racketHandY);
            ctx.rotate(racketAngle);

            ctx.fillStyle = '#6b4226';
            ctx.fillRect(0, -2, 20, 4);

            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.ellipse(28, 0, 10, 14, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = char.color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.ellipse(28, 0, 8, 12, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.restore();

            ctx.fillStyle = 'white';
            const eyeY = char.y + char.height * 0.4;
            ctx.beginPath();
            ctx.arc(char.x + char.width * 0.3, eyeY, 4, 0, 2 * Math.PI);
            ctx.arc(char.x + char.width * 0.7, eyeY, 4, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = 'black';
            const pupilDirY = (ball.y - char.y) / canvas.height;
            ctx.beginPath();
            ctx.arc(char.x + char.width * 0.3 + pupilDirX * 2, eyeY + pupilDirY * 2, 2, 0, 2 * Math.PI);
            ctx.arc(char.x + char.width * 0.7 + pupilDirX * 2, eyeY + pupilDirY * 2, 2, 0, 2 * Math.PI);
            ctx.fill();

            ctx.restore();
        }

        function drawBall() {
            const shadowRadius = ball.radius * (1 - ball.z / 200);
            const shadowAlpha = 0.3 * (1 - ball.z / 150);
            if (shadowAlpha > 0) {
                ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
                ctx.beginPath();
                ctx.ellipse(ball.x, ball.y, shadowRadius, shadowRadius / 2, 0, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.save();
            for (let i = ball.trail.length - 1; i > 0; i--) {
                const pos = ball.trail[i];
                const prevPos = ball.trail[i - 1];
                const alpha = (i / ball.trail.length) * 0.5;
                ctx.beginPath();
                ctx.moveTo(prevPos.x, prevPos.y - prevPos.z);
                ctx.lineTo(pos.x, pos.y - pos.z);
                ctx.strokeStyle = `rgba(255, 255, 150, ${alpha})`;
                ctx.lineWidth = pos.r * 1.5 * (alpha);
                ctx.stroke();
            }
            ctx.restore();

            const ballRenderY = ball.y - ball.z;
            const ballRenderRadius = ball.radius * (1 + ball.z / 150);
            
            ctx.save();
            ctx.translate(ball.x, ballRenderY);
            ctx.scale(ball.scaleX, ball.scaleY);
            
            const gradient = ctx.createRadialGradient( -ballRenderRadius/3, -ballRenderRadius/3, 1, 0, 0, ballRenderRadius);
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.5, ball.color);
            gradient.addColorStop(1, '#E8AE00');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, ballRenderRadius, 0, 2 * Math.PI);
            ctx.fill();

            // **FIX 1: Tambahkan efek glow saat bola siap dipukul**
            if (serveState === 'readyToHit') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(0, 0, ballRenderRadius * 1.5, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.restore();
        }
        
        function endGame() {
            gameRunning = false;
            clearInterval(timerInterval);
            gameState = 'gameOver';
            gameOverScreen.classList.add('show');
            finalPlayerScoreEl.textContent = playerScore;
            finalAiScoreEl.textContent = aiScore;
            
            if (playerScore > aiScore) {
                resultTitle.textContent = 'MENANG!';
                resultTitle.className = 'result-title win';
            } else if (aiScore > playerScore) {
                resultTitle.textContent = 'KALAH';
                resultTitle.className = 'result-title lose';
            } else {
                resultTitle.textContent = 'SERI';
                resultTitle.className = 'result-title draw';
            }
        }

        function gameLoop(timestamp) {
            if (!gameRunning) {
                if(gameState !== 'pointScored') return;
            };
            
            requestAnimationFrame(gameLoop);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawCourt();
            
            if(gameState !== 'pointScored'){
                updatePlayer();
                updateAI();
                updateBall();
            }
            
            if (gameState === 'serving' && serveState === 'inFlight') {
                serveFlash += 0.1;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(serveFlash) * 0.1})`;
                ctx.fillRect(targetServiceBox.x, targetServiceBox.y, targetServiceBox.width, targetServiceBox.height);
            }
            
            const entities = [player, ai, ball].sort((a, b) => (a.y + (a.height || 0)) - (b.y + (b.height || 0)));
            entities.forEach(entity => {
                if (entity === ball) drawBall();
                else drawCharacter(entity);
            });
            
            // Reset status tap di akhir setiap frame
            input.tapped = false;
        }

        resizeCanvas();
    </script>
</body>
</html>