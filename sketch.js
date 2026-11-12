// --- 定義全域變數 ---
let stopSheet, walkSheet, magicSheet, effectSheet, jumpSheet; // 儲存各個圖片精靈貼圖
let stopFrames = [];     // 停止動畫影格陣列 (6張)
let walkFrames = [];     // 走路動畫影格陣列 (9張)
let magicFrames = [];    // 施法動畫影格陣列 (4張)
let effectFrames = [];   // 特效動畫影格陣列 (4張)
let jumpFrames = [];     // 跳躍動畫影格陣列 (5張)

// 1. 停止動畫設定 (6張，總寬 829，高 212)
let totalStopFrames = 6;
let currentStopFrame = 0;
let stopWidth = 829 / 6;
let stopHeight = 212;

// 2. 走路動畫設定 (9張，總寬 1246，高 198)
let totalWalkFrames = 9;
let currentWalkFrame = 0;
let walkWidth = 1246 / 9;
let walkHeight = 198;

// 3. 施法動畫設定 (4張，總寬 1039，高 146)
let totalMagicFrames = 4;
let currentMagicFrame = 0;
let magicWidth = 1039 / 4;
let magicHeight = 146;

// 4. 特效動畫設定 (4張，總寬 740，高 19)
let totalEffectFrames = 4;
let effectWidth = 740 / 4;
let effectHeight = 19;

// 5. 跳躍動畫設定 (5張，總寬 690，高 190)
let totalJumpFrames = 5;
let jumpWidth = 690 / 5;
let jumpHeight = 190;

// 角色與特效的位置、狀態控制變數
let posX, posY;                  // 角色的 X 與 Y 座標
let basePosY;                    // 記住地面基準 Y 軸位置
let speed = 4;                   // 移動速度
let direction = 1;               // 1 代表面向右側，-1 代表面向左側
let isWalking = false;           // 紀錄目前是否正在走路
let isMagic = false;             // 紀錄目前是否正在施法
let isJumping = false;           // 紀錄目前是否正在跳躍

// 跳躍物理變數
let jumpVelocityY = 0;           // 垂直移動速度
let gravity = 0.8;               // 重力加速度
let jumpPower = -12;             // 起跳推力
let currentJumpFrame = 0;        // 跳躍影格進度

// 特效物件變數
let activeEffect = null;         // 儲存當前發射的特效資訊

// 圖片載入狀態旗標
let stopLoaded = false;
let walkLoaded = false;
let magicLoaded = false;
let effectLoaded = false;
let jumpLoaded = false;

// 預先載入所有圖片資源
function preload() {
  stopSheet = loadImage('1/stop/stop.png', () => { stopLoaded = true; }, () => { console.error("無法載入 1/stop/stop.png"); });
  walkSheet = loadImage('1/walk/walk.png', () => { walkLoaded = true; }, () => { console.error("無法載入 1/walk/walk.png"); });
  magicSheet = loadImage('1/magic01/magic01.png', () => { magicLoaded = true; }, () => { console.error("無法載入 1/magic01/magic01.png"); });
  effectSheet = loadImage('1/特效/特效.png', () => { effectLoaded = true; }, () => { console.error("無法載入 1/特效/特效.png"); });
  jumpSheet = loadImage('1/jump/jump.png', () => { jumpLoaded = true; }, () => { console.error("無法載入 1/jump/jump.png"); });
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 設定動畫播放速率（每秒 12 個影格）
  frameRate(12);

  // 初始化角色位置：X 軸在畫布 2/3 處，Y 軸靠齊畫布底部
  posX = (width * 2) / 3;
  basePosY = height - (height / 3) / 2;
  posY = basePosY;
}

function draw() {
  // 設定天空色背景 (RGB: 135, 206, 235)
  background(135, 206, 235);

  // 如果停止圖片還沒載入完成，顯示提示
  if (!stopLoaded) {
    fill(255, 0, 0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("正在載入圖片精靈，請確認檔案路徑是否正確...", width / 2, height / 2);
    return;
  }

  // 初始化裁切影格（確保圖片載入後只執行一次切割）
  if (stopFrames.length === 0 && stopLoaded) {
    for (let i = 0; i < totalStopFrames; i++) {
      stopFrames.push(stopSheet.get(i * stopWidth, 0, stopWidth, stopHeight));
    }
  }
  if (walkFrames.length === 0 && walkLoaded) {
    for (let i = 0; i < totalWalkFrames; i++) {
      walkFrames.push(walkSheet.get(i * walkWidth, 0, walkWidth, walkHeight));
    }
  }
  if (magicFrames.length === 0 && magicLoaded) {
    for (let i = 0; i < totalMagicFrames; i++) {
      magicFrames.push(magicSheet.get(i * magicWidth, 0, magicWidth, magicHeight));
    }
  }
  if (effectFrames.length === 0 && effectLoaded) {
    for (let i = 0; i < totalEffectFrames; i++) {
      effectFrames.push(effectSheet.get(i * effectWidth, 0, effectWidth, effectHeight));
    }
  }
  if (jumpFrames.length === 0 && jumpLoaded) {
    for (let i = 0; i < totalJumpFrames; i++) {
      jumpFrames.push(jumpSheet.get(i * jumpWidth, 0, jumpWidth, jumpHeight));
    }
  }

  // --- 1. 鍵盤互動與角色狀態判斷邏輯 ---
  isWalking = false;

  // 如果正在跳躍中
  if (isJumping) {
    // 處理跳躍物理與位置更新
    posY += jumpVelocityY;
    jumpVelocityY += gravity; // 受到重力影響往下掉

    // 動態分配跳躍影格（依據目前高度進度播放 5 張圖片）
    let progress = map(posY, basePosY, basePosY + (jumpPower * 10), 0, totalJumpFrames - 1);
    currentJumpFrame = constrain(floor(progress), 0, totalJumpFrames - 1);

    // 當角色落回到地面（或低於地面基準）時，結束跳躍
    if (posY >= basePosY) {
      posY = basePosY;
      isJumping = false;
      jumpVelocityY = 0;
    }
  } 
  // 如果正在施法中，優先執行施法（施法時禁止移動與跳躍）
  else if (isMagic) {
    // 保持施法狀態
  } 
  // 當按下鍵盤往上鍵 (UP_ARROW)，且跳躍圖片已載入，啟動跳躍
  else if (keyIsDown(UP_ARROW) && jumpLoaded) {
    isJumping = true;
    jumpVelocityY = jumpPower; // 給予向上推力
    currentJumpFrame = 0;
  }
  // 當按下鍵盤空白鍵 (KeyCode 32)，且施法圖片已成功載入時，執行施法
  else if (keyIsDown(32) && magicLoaded) {
    isMagic = true;
    currentMagicFrame = 0; // 重置施法動畫從頭播放（執行一次）
  } 
  // 當按下鍵盤右鍵
  else if (keyIsDown(RIGHT_ARROW)) {
    isWalking = true;
    direction = 1; // 設定面向右側
    let renderH = height / 3;
    let renderW = renderH * (walkWidth / walkHeight);
    let maxX = width - renderW / 2;
    if (posX < maxX) {
      posX += speed; // 角色持續往右移動
    }
  } 
  // 當按下鍵盤左鍵
  else if (keyIsDown(LEFT_ARROW)) {
    isWalking = true;
    direction = -1; // 設定面向左側
    let renderH = height / 3;
    let renderW = renderH * (walkWidth / walkHeight);
    let minX = renderW / 2;
    if (posX > minX) {
      posX -= speed; // 角色持續往左移動
    }
  }

  // --- 2. 處理與繪製魔法特效圖片 ---
  if (activeEffect && effectFrames.length > 0) {
    // 特效依據當下的面向往右（+1）或往左（-1）移動
    activeEffect.x += activeEffect.speed * activeEffect.dir;

    let effectRenderH = height / 10;
    let effectRenderW = effectRenderH * (effectWidth / effectHeight);

    imageMode(CENTER);
    let frameIdx = Math.floor(activeEffect.frameIndex) % totalEffectFrames;
    let currentEffectImg = effectFrames[frameIdx];
    
    if (currentEffectImg) {
      push();
      translate(activeEffect.x, posY); // 特效跟隨角色當前高度
      scale(activeEffect.dir, 1); // 讓特效隨角色面向做水平轉向
      image(currentEffectImg, 0, 0, effectRenderW, effectRenderH);
      pop();
    }

    // 特效影格循環播放速率
    activeEffect.frameIndex += 0.4;

    // 當特效往右移動超過畫布右端，或往左移動超過畫布左端時消失不見
    if (activeEffect.dir === 1 && activeEffect.x > width + effectRenderW) {
      activeEffect = null;
    } else if (activeEffect.dir === -1 && activeEffect.x < -effectRenderW) {
      activeEffect = null;
    }
  }

  // --- 3. 繪製角色本體 ---
  let renderHeight = height / 3;
  let renderWidth, currentImg;

  imageMode(CENTER);
  push();
  translate(posX, posY);
  scale(direction, 1); // 透過 scale 實現圖片的左右水平轉向

  if (isJumping && jumpFrames.length > 0) {
    // 執行 5 張的跳躍動畫
    let jumpAspectRatio = jumpWidth / jumpHeight;
    renderWidth = renderHeight * jumpAspectRatio;
    currentImg = jumpFrames[currentJumpFrame];
  } 
  else if (isMagic && magicFrames.length > 0) {
    // 執行 4 張的魔法施法動畫
    let magicAspectRatio = magicWidth / magicHeight;
    renderWidth = renderHeight * magicAspectRatio;
    currentImg = magicFrames[Math.floor(currentMagicFrame)];

    // 播放施法動畫（執行一次就好）
    currentMagicFrame += 0.3; // 控制播放速度
    
    // 當施法動畫播完最後一張時
    if (currentMagicFrame >= totalMagicFrames) {
      isMagic = false;       // 施法結束，回復正常狀態
      
      // 施法執行完畢後，在當前角色位置產生特效圖片，準備往面向方向移動
      if (effectFrames.length > 0) {
        activeEffect = {
          x: posX,
          dir: direction,
          speed: 12,          // 特效飛行速度
          frameIndex: 0       // 初始化特效影格索引
        };
      }
    }
  } else if (isWalking && walkFrames.length > 0) {
    // 執行 9 張的走路動畫
    let walkAspectRatio = walkWidth / walkHeight;
    renderWidth = renderHeight * walkAspectRatio;
    currentImg = walkFrames[currentWalkFrame];
    currentWalkFrame = (currentWalkFrame + 1) % totalWalkFrames;
  } else {
    // 當不按左右鍵、也沒有施法或跳躍時：回復到 6 張的停止精靈圖 (stop.png)
    let stopAspectRatio = stopWidth / stopHeight;
    renderWidth = renderHeight * stopAspectRatio;
    currentImg = stopFrames[currentStopFrame];
    currentStopFrame = (currentStopFrame + 1) % totalStopFrames;
  }

  // 繪製角色
  if (currentImg) {
    image(currentImg, 0, 0, renderWidth, renderHeight);
  }
  pop();
}

// 當視窗大小改變時自動觸發，適應不同載具與螢幕尺寸
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  basePosY = height - (height / 3) / 2;
}