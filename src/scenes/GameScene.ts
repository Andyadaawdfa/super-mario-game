import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, GAME, PLAYER, COIN, COLORS } from '../utils/constants';
import { Player } from '../entities/Player';
import { Goomba } from '../entities/Goomba';
import { Koopa } from '../entities/Koopa';
import { HUD } from '../ui/HUD';
import { TouchController } from '../ui/TouchController';

interface BlockData {
  sprite: Phaser.Physics.Arcade.Sprite;
  type: 'question' | 'brick';
  content: 'coin' | 'mushroom' | 'fireflower';
  used: boolean;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private runKey!: Phaser.Input.Keyboard.Key;
  private fireKey!: Phaser.Input.Keyboard.Key;

  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private blocks: BlockData[] = [];
  private goombas!: Phaser.Physics.Arcade.Group;
  private koopas!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private mushrooms!: Phaser.Physics.Arcade.Group;
  private fireFlowers!: Phaser.Physics.Arcade.Group;
  private pipes!: Phaser.Physics.Arcade.StaticGroup;
  private flagPole!: Phaser.Physics.Arcade.Sprite;

  private hud!: HUD;
  private score = 0;
  private coinCount = 0;
  private lives = GAME.LIVES;
  private timeLeft = GAME.TIME_LIMIT;
  private timerEvent?: Phaser.Time.TimerEvent;
  private levelComplete = false;
  private deathHandled = false;
  private currentLevel = 1;
  private touchController!: TouchController;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data: { level?: number }) {
    this.currentLevel = data?.level || 1;
    this.levelComplete = false;
    this.deathHandled = false;

    // World bounds - level is about 210 tiles wide
    const levelWidth = 210 * TILE_SIZE;
    this.physics.world.setBounds(0, 0, levelWidth, GAME_HEIGHT + 100);

    // Sky background - different color per level (using UI/UX Pro Max Dark Premium palette)
    const skyColors: Record<number, number> = { 1: COLORS.SKY, 2: 0x0a0a1a, 3: 0x0f0518 };
    this.add.rectangle(levelWidth / 2, GAME_HEIGHT / 2, levelWidth, GAME_HEIGHT, skyColors[this.currentLevel] || COLORS.SKY).setDepth(-1);

    // Add clouds
    this.addClouds(levelWidth);

    // Level 3: Night sky with stars (UI/UX Pro Max atmospheric design)
    if (this.currentLevel === 3) {
      this.addStars(levelWidth);
    }

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.runKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // Touch controls for mobile
    this.touchController = new TouchController(this);

    // Groups
    this.groundGroup = this.physics.add.staticGroup();
    this.goombas = this.physics.add.group();
    this.koopas = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.mushrooms = this.physics.add.group();
    this.fireFlowers = this.physics.add.group();
    this.pipes = this.physics.add.staticGroup();

    // Build level based on current level
    if (this.currentLevel === 1) {
      this.buildLevel();
    } else if (this.currentLevel === 2) {
      this.buildLevel2();
    } else {
      this.buildLevel3();
    }

    // Player
    this.player = new Player(this, 3 * TILE_SIZE, 13 * TILE_SIZE);

    // HUD
    this.hud = new HUD(this, this.currentLevel);

    // Camera
    this.cameras.main.setBounds(0, 0, levelWidth, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(20, 0);

    // Collisions
    this.setupCollisions();

    // Timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true,
    });
  }

  private addClouds(levelWidth: number) {
    // Add clouds at various positions across the level
    const cloudPositions = [
      { x: 100, y: 40 },
      { x: 300, y: 60 },
      { x: 500, y: 30 },
      { x: 700, y: 50 },
      { x: 900, y: 40 },
      { x: 1100, y: 70 },
      { x: 1300, y: 35 },
      { x: 1500, y: 55 },
      { x: 1700, y: 45 },
      { x: 1900, y: 65 },
      { x: 2100, y: 30 },
      { x: 2300, y: 50 },
      { x: 2500, y: 40 },
      { x: 2700, y: 60 },
      { x: 2900, y: 35 },
      { x: 3100, y: 55 },
    ];

    cloudPositions.forEach(pos => {
      if (pos.x < levelWidth) {
        const cloud = this.add.image(pos.x, pos.y, 'cloud');
        cloud.setDepth(-1); // Behind everything
        // Add slight parallax effect (clouds move slower than camera)
        cloud.setScrollFactor(0.8);
      }
    });
  }

  private addStars(levelWidth: number) {
    // Night sky stars for Level 3 — scattered white dots with twinkle animation
    const starPositions = [
      { x: 50, y: 15 }, { x: 120, y: 25 }, { x: 200, y: 10 }, { x: 280, y: 30 },
      { x: 350, y: 18 }, { x: 420, y: 8 }, { x: 500, y: 28 }, { x: 580, y: 12 },
      { x: 650, y: 22 }, { x: 720, y: 35 }, { x: 800, y: 5 }, { x: 880, y: 20 },
      { x: 950, y: 32 }, { x: 1020, y: 14 }, { x: 1100, y: 28 }, { x: 1180, y: 8 },
      { x: 1250, y: 24 }, { x: 1320, y: 16 }, { x: 1400, y: 30 }, { x: 1480, y: 10 },
      { x: 1550, y: 26 }, { x: 1620, y: 18 }, { x: 1700, y: 32 }, { x: 1780, y: 12 },
      { x: 1850, y: 28 }, { x: 1920, y: 20 }, { x: 2000, y: 34 }, { x: 2080, y: 15 },
      { x: 2150, y: 25 }, { x: 2220, y: 10 }, { x: 2300, y: 30 }, { x: 2380, y: 22 },
      { x: 2450, y: 8 }, { x: 2520, y: 28 }, { x: 2600, y: 16 }, { x: 2680, y: 32 },
      { x: 2750, y: 12 }, { x: 2820, y: 24 }, { x: 2900, y: 18 }, { x: 2980, y: 30 },
      { x: 3050, y: 10 }, { x: 3120, y: 26 }, { x: 3200, y: 15 }, { x: 3280, y: 34 },
    ];

    starPositions.forEach(pos => {
      if (pos.x < levelWidth) {
        const size = Math.random() > 0.6 ? 2 : 1;
        const alpha = 0.3 + Math.random() * 0.7;
        const luminosity = 0xaa + Math.floor(Math.random() * 0x55);
        const star = this.add.rectangle(pos.x, pos.y, size, size, (luminosity << 16) | (luminosity << 8) | luminosity, alpha)
          .setDepth(-1)
          .setScrollFactor(0.7);

        // Subtle twinkle animation
        this.tweens.add({
          targets: star,
          alpha: { from: alpha, to: alpha * 0.2 },
          duration: 800 + Math.random() * 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: Math.random() * 2000,
        });
      }
    });
  }

  update() {
    if (this.levelComplete || this.deathHandled) return;

    this.player.update(this.cursors, this.runKey, this.fireKey);

    // Update enemies
    this.goombas.getChildren().forEach(g => (g as Goomba).update());
    this.koopas.getChildren().forEach(k => (k as Koopa).update());

    // Camera boundary - player can't go back
    const camLeft = this.cameras.main.scrollX;
    if (this.player.x < camLeft + 8) {
      this.player.x = camLeft + 8;
    }

    // Fall into pit
    if (this.player.y > GAME_HEIGHT + 20 && !this.player.isDead) {
      this.handlePlayerDeath();
    }

    // Remove off-screen enemies
    this.goombas.getChildren().forEach(g => {
      const goomba = g as Goomba;
      if (goomba.x < this.cameras.main.scrollX - 100) goomba.destroy();
    });
  }

  private buildLevel() {
    // Ground: rows 14-15 (bottom 2 rows)
    // Gaps at specific positions
    const groundGaps = [
      [69, 70], [86, 87],
    ];

    for (let col = 0; col < 210; col++) {
      if (groundGaps.some(([s, e]) => col >= s && col <= e)) continue;
      this.addGround(col, 14);
      this.addGround(col, 15);
    }

    // Question blocks (row 10 = 4 tiles above ground)
    const questionBlocks = [
      { col: 16, row: 10, content: 'coin' as const },
      { col: 21, row: 10, content: 'mushroom' as const },
      { col: 22, row: 7, content: 'coin' as const },  // High block
      { col: 23, row: 10, content: 'coin' as const },
      { col: 24, row: 10, content: 'coin' as const },
      { col: 23, row: 7, content: 'fireflower' as const },
      { col: 78, row: 10, content: 'coin' as const },
      { col: 94, row: 10, content: 'coin' as const },
      { col: 106, row: 10, content: 'mushroom' as const },
      { col: 109, row: 7, content: 'coin' as const },
      { col: 110, row: 7, content: 'coin' as const },
      { col: 111, row: 7, content: 'coin' as const },
      { col: 129, row: 10, content: 'coin' as const },
      { col: 130, row: 10, content: 'coin' as const },
      { col: 170, row: 10, content: 'fireflower' as const },
    ];

    questionBlocks.forEach(b => {
      this.addQuestionBlock(b.col, b.row, b.content);
    });

    // Brick blocks
    const brickPositions = [
      { col: 20, row: 10 },
      { col: 22, row: 10 },
      { col: 23, row: 10 },  // next to question
      { col: 24, row: 10 },
      { col: 25, row: 10 },
      { col: 77, row: 10 },
      { col: 79, row: 10 },
      { col: 80, row: 10 },
      { col: 81, row: 7 },
      { col: 82, row: 7 },
      { col: 83, row: 7 },
      { col: 84, row: 7 },
      { col: 85, row: 7 },
      { col: 86, row: 7 },
      { col: 87, row: 7 },
      { col: 88, row: 7 },
      { col: 91, row: 7 },
      { col: 92, row: 7 },
      { col: 93, row: 7 },
      { col: 94, row: 7 },
      { col: 100, row: 10 },
      { col: 101, row: 10 },
      { col: 118, row: 10 },
      { col: 119, row: 10 },
      { col: 120, row: 10 },
      { col: 128, row: 10 },
      { col: 131, row: 10 },
      { col: 168, row: 10 },
      { col: 169, row: 10 },
      { col: 171, row: 10 },
    ];

    brickPositions.forEach(b => {
      this.addBrick(b.col, b.row);
    });

    // Pipes
    const pipePositions = [
      { col: 28, row: 12, height: 2 },
      { col: 38, row: 11, height: 3 },
      { col: 46, row: 10, height: 4 },
      { col: 57, row: 10, height: 4 },
      { col: 163, row: 12, height: 2 },
      { col: 179, row: 12, height: 2 },
    ];

    pipePositions.forEach(p => {
      this.addPipe(p.col, p.row, p.height);
    });

    // Goombas
    const goombaPositions = [22, 40, 51, 52, 80, 82, 97, 98, 114, 115, 124, 125, 128, 129, 174, 175];
    goombaPositions.forEach(col => {
      this.addGoomba(col * TILE_SIZE, 13 * TILE_SIZE);
    });

    // Koopas
    const koopaPositions = [32, 107, 160];
    koopaPositions.forEach(col => {
      this.addKoopa(col * TILE_SIZE, 12 * TILE_SIZE);
    });

    // Flag pole
    this.addFlagPole(198, 4);

    // Castle
    this.add.image(205 * TILE_SIZE, 11 * TILE_SIZE, 'castle').setOrigin(0, 1);
  }

  private buildLevel2() {
    // Level 2 - Underground theme with more challenging layout
    // Ground: rows 14-15 (bottom 2 rows)
    // More gaps and platforms
    const groundGaps = [
      [15, 16], [30, 32], [45, 46], [60, 62], [75, 77], [90, 92], [105, 107], [120, 122], [135, 137], [150, 152], [165, 167], [180, 182],
    ];

    for (let col = 0; col < 210; col++) {
      if (groundGaps.some(([s, e]) => col >= s && col <= e)) continue;
      this.addGround(col, 14);
      this.addGround(col, 15);
    }

    // Additional floating platforms
    const platforms = [
      // Platform 1
      { col: 17, row: 12, length: 3 },
      // Platform 2
      { col: 33, row: 11, length: 4 },
      // Platform 3
      { col: 47, row: 10, length: 3 },
      // Platform 4
      { col: 63, row: 12, length: 3 },
      // Platform 5
      { col: 78, row: 11, length: 4 },
      // Platform 6
      { col: 93, row: 10, length: 3 },
      // Platform 7
      { col: 108, row: 12, length: 3 },
      // Platform 8
      { col: 123, row: 11, length: 4 },
      // Platform 9
      { col: 138, row: 10, length: 3 },
      // Platform 10
      { col: 153, row: 12, length: 3 },
      // Platform 11
      { col: 168, row: 11, length: 4 },
      // Platform 12
      { col: 183, row: 10, length: 3 },
    ];

    platforms.forEach(p => {
      for (let i = 0; i < p.length; i++) {
        this.addPlatform(p.col + i, p.row);
      }
    });

    // Question blocks
    const questionBlocks = [
      { col: 10, row: 10, content: 'mushroom' as const },
      { col: 25, row: 10, content: 'coin' as const },
      { col: 40, row: 10, content: 'fireflower' as const },
      { col: 55, row: 10, content: 'coin' as const },
      { col: 70, row: 10, content: 'mushroom' as const },
      { col: 85, row: 10, content: 'coin' as const },
      { col: 100, row: 10, content: 'fireflower' as const },
      { col: 115, row: 10, content: 'coin' as const },
      { col: 130, row: 10, content: 'mushroom' as const },
      { col: 145, row: 10, content: 'coin' as const },
      { col: 160, row: 10, content: 'fireflower' as const },
      { col: 175, row: 10, content: 'coin' as const },
      { col: 190, row: 10, content: 'mushroom' as const },
    ];

    questionBlocks.forEach(b => {
      this.addQuestionBlock(b.col, b.row, b.content);
    });

    // Pipes (more varied heights)
    const pipePositions = [
      { col: 5, row: 12, height: 2 },
      { col: 20, row: 11, height: 3 },
      { col: 35, row: 10, height: 4 },
      { col: 50, row: 12, height: 2 },
      { col: 65, row: 11, height: 3 },
      { col: 80, row: 10, height: 4 },
      { col: 95, row: 12, height: 2 },
      { col: 110, row: 11, height: 3 },
      { col: 125, row: 10, height: 4 },
      { col: 140, row: 12, height: 2 },
      { col: 155, row: 11, height: 3 },
      { col: 170, row: 10, height: 4 },
      { col: 185, row: 12, height: 2 },
    ];

    pipePositions.forEach(p => {
      this.addPipe(p.col, p.row, p.height);
    });

    // Goombas (more enemies)
    const goombaPositions = [8, 18, 28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148, 158, 168, 178, 188, 198];
    goombaPositions.forEach(col => {
      this.addGoomba(col * TILE_SIZE, 13 * TILE_SIZE);
    });

    // Koopas (more koopas)
    const koopaPositions = [12, 32, 52, 72, 92, 112, 132, 152, 172, 192];
    koopaPositions.forEach(col => {
      this.addKoopa(col * TILE_SIZE, 12 * TILE_SIZE);
    });

    // Flag pole
    this.addFlagPole(200, 4);

    // Castle
    this.add.image(207 * TILE_SIZE, 11 * TILE_SIZE, 'castle').setOrigin(0, 1);
  }

  private buildLevel3() {
    // Level 3 - "暗夜堡垒" (Night Fortress) — Final level
    // Dark Premium theme (UI/UX Pro Max style: deep navy sky, golden accents, fortress atmosphere)
    // Design: hardest difficulty with wide gaps, dense enemies, strategic power-up placement

    // Ground: more gaps than level 2, wider gaps requiring precise jumps
    const groundGaps = [
      [10, 12], [22, 25], [34, 37], [46, 49], [58, 61],
      [70, 73], [82, 85], [94, 97], [106, 109], [118, 121],
      [130, 133], [142, 145], [154, 157], [166, 169], [178, 181],
    ];

    for (let col = 0; col < 210; col++) {
      if (groundGaps.some(([s, e]) => col >= s && col <= e)) continue;
      this.addGround(col, 14);
      this.addGround(col, 15);
    }

    // Floating brick platforms bridging gaps — narrower than level 2 for precision platforming
    const platforms = [
      { col: 13, row: 12, length: 3 },
      { col: 26, row: 11, length: 3 },
      { col: 38, row: 10, length: 3 },
      { col: 50, row: 12, length: 3 },
      { col: 62, row: 11, length: 3 },
      { col: 74, row: 10, length: 3 },
      { col: 86, row: 12, length: 3 },
      { col: 98, row: 11, length: 3 },
      { col: 110, row: 10, length: 3 },
      { col: 122, row: 12, length: 3 },
      { col: 134, row: 11, length: 3 },
      { col: 146, row: 10, length: 3 },
      { col: 158, row: 12, length: 3 },
      { col: 170, row: 11, length: 3 },
      { col: 182, row: 10, length: 3 },
      // Stairway ascent near end for visual drama
      { col: 176, row: 8, length: 4 },
      { col: 176, row: 5, length: 4 },
    ];

    platforms.forEach(p => {
      for (let i = 0; i < p.length; i++) {
        this.addPlatform(p.col + i, p.row);
      }
    });

    // Question blocks with strategic placement — power-ups before difficult sections
    const questionBlocks = [
      { col: 8, row: 10, content: 'mushroom' as const },
      { col: 20, row: 10, content: 'coin' as const },
      { col: 30, row: 10, content: 'fireflower' as const },
      { col: 44, row: 10, content: 'mushroom' as const },
      { col: 56, row: 10, content: 'coin' as const },
      { col: 68, row: 10, content: 'fireflower' as const },
      { col: 80, row: 7, content: 'coin' as const },
      { col: 81, row: 7, content: 'coin' as const },
      { col: 93, row: 10, content: 'mushroom' as const },
      { col: 104, row: 10, content: 'coin' as const },
      { col: 116, row: 10, content: 'fireflower' as const },
      { col: 128, row: 10, content: 'mushroom' as const },
      { col: 140, row: 10, content: 'coin' as const },
      { col: 150, row: 10, content: 'fireflower' as const },
      { col: 162, row: 7, content: 'coin' as const },
      { col: 163, row: 7, content: 'coin' as const },
      { col: 164, row: 7, content: 'coin' as const },
      { col: 174, row: 10, content: 'mushroom' as const },
      { col: 186, row: 10, content: 'fireflower' as const },
    ];

    questionBlocks.forEach(b => {
      this.addQuestionBlock(b.col, b.row, b.content);
    });

    // Pipes as fortress obstacles (varied heights)
    const pipePositions = [
      { col: 16, row: 12, height: 2 },
      { col: 36, row: 11, height: 3 },
      { col: 52, row: 10, height: 4 },
      { col: 66, row: 12, height: 2 },
      { col: 88, row: 11, height: 3 },
      { col: 102, row: 10, height: 4 },
      { col: 114, row: 12, height: 2 },
      { col: 132, row: 11, height: 3 },
      { col: 148, row: 10, height: 4 },
      { col: 164, row: 12, height: 2 },
      { col: 176, row: 11, height: 3 },
      { col: 188, row: 10, height: 4 },
    ];

    pipePositions.forEach(p => {
      this.addPipe(p.col, p.row, p.height);
    });

    // Goombas — dense patrols across the fortress
    const goombaPositions = [15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 175, 185, 195];
    goombaPositions.forEach(col => {
      this.addGoomba(col * TILE_SIZE, 13 * TILE_SIZE);
    });

    // Koopas — elite guards
    const koopaPositions = [28, 48, 68, 88, 108, 128, 148, 168, 188];
    koopaPositions.forEach(col => {
      this.addKoopa(col * TILE_SIZE, 12 * TILE_SIZE);
    });

    // Flag pole
    this.addFlagPole(196, 4);

    // Castle (fortress)
    this.add.image(203 * TILE_SIZE, 11 * TILE_SIZE, 'castle').setOrigin(0, 1);
  }

  private addGround(col: number, row: number) {
    const g = this.groundGroup.create(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, 'ground');
    g.setDepth(1);
  }

  private addQuestionBlock(col: number, row: number, content: 'coin' | 'mushroom' | 'fireflower') {
    const sprite = this.physics.add.staticSprite(
      col * TILE_SIZE + TILE_SIZE / 2,
      row * TILE_SIZE + TILE_SIZE / 2,
      'question'
    );
    sprite.setDepth(1);
    sprite.body!.setSize(TILE_SIZE, TILE_SIZE);
    this.blocks.push({ sprite, type: 'question', content, used: false });
  }

  private addBrick(col: number, row: number) {
    const sprite = this.physics.add.staticSprite(
      col * TILE_SIZE + TILE_SIZE / 2,
      row * TILE_SIZE + TILE_SIZE / 2,
      'brick'
    );
    sprite.setDepth(1);
    sprite.body!.setSize(TILE_SIZE, TILE_SIZE);
    this.blocks.push({ sprite, type: 'brick', content: 'coin', used: false });
  }

  private addPlatform(col: number, row: number) {
    const g = this.groundGroup.create(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, 'brick');
    g.setDepth(1);
  }

  private addPipe(col: number, row: number, heightTiles: number) {
    for (let r = 0; r < heightTiles; r++) {
      const pipe = this.pipes.create(
        col * TILE_SIZE + TILE_SIZE,
        row * TILE_SIZE + r * TILE_SIZE + TILE_SIZE / 2,
        'pipe'
      );
      pipe.setDepth(1);
      // Adjust body for pipe top
      if (r === 0) {
        pipe.body!.setSize(TILE_SIZE * 2 - 4, TILE_SIZE);
        pipe.body!.setOffset(2, 0);
      }
    }
  }

  private addGoomba(x: number, y: number) {
    const goomba = new Goomba(this, x, y);
    this.goombas.add(goomba);
  }

  private addKoopa(x: number, y: number) {
    const koopa = new Koopa(this, x, y);
    this.koopas.add(koopa);
  }

  private addFlagPole(col: number, topRow: number) {
    const flagY = topRow * TILE_SIZE;
    const flagHeight = (14 - topRow) * TILE_SIZE;
    this.flagPole = this.physics.add.staticSprite(
      col * TILE_SIZE + TILE_SIZE / 2,
      flagY + flagHeight / 2,
      'flag_pole'
    );
    this.flagPole.setDepth(2);
    this.flagPole.body!.setSize(4, flagHeight);
    this.flagPole.body!.setOffset(6, 0);
  }

  private setupCollisions() {
    // Player vs ground
    this.physics.add.collider(this.player, this.groundGroup);
    // Player vs pipes
    this.physics.add.collider(this.player, this.pipes);
    // Player vs blocks (top collision only)
    this.physics.add.collider(this.player, this.blocks.map(b => b.sprite), undefined, (_player, block) => {
      return this.handleBlockHit(block as Phaser.Physics.Arcade.Sprite);
    });

    // Enemies vs ground
    this.physics.add.collider(this.goombas, this.groundGroup);
    this.physics.add.collider(this.koopas, this.groundGroup);
    // Enemies vs pipes
    this.physics.add.collider(this.goombas, this.pipes, (goomba) => {
      (goomba as Goomba).reverseDirection();
    });
    this.physics.add.collider(this.koopas, this.pipes, (koopa) => {
      (koopa as Koopa).reverseDirection();
    });
    // Enemies vs blocks
    this.physics.add.collider(this.goombas, this.blocks.map(b => b.sprite), (goomba) => {
      (goomba as Goomba).reverseDirection();
    });
    this.physics.add.collider(this.koopas, this.blocks.map(b => b.sprite), (koopa) => {
      (koopa as Koopa).reverseDirection();
    });

    // Player vs enemies
    this.physics.add.overlap(this.player, this.goombas, (_player, goomba) => {
      this.handleGoombaCollision(goomba as Goomba);
    });
    this.physics.add.overlap(this.player, this.koopas, (_player, koopa) => {
      this.handleKoopaCollision(koopa as Koopa);
    });

    // Items vs ground
    this.physics.add.collider(this.mushrooms, this.groundGroup);
    this.physics.add.collider(this.mushrooms, this.blocks.map(b => b.sprite));
    this.physics.add.collider(this.fireFlowers, this.groundGroup);
    this.physics.add.collider(this.fireFlowers, this.blocks.map(b => b.sprite));
    // Mushrooms vs pipes
    this.physics.add.collider(this.mushrooms, this.pipes, (mushroom) => {
      const m = mushroom as Phaser.Physics.Arcade.Sprite;
      m.setVelocityX(-m.body!.velocity.x);
    });

    // Player vs items
    this.physics.add.overlap(this.player, this.mushrooms, (_player, mushroom) => {
      this.collectMushroom(mushroom as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.player, this.fireFlowers, (_player, flower) => {
      this.collectFireFlower(flower as Phaser.Physics.Arcade.Sprite);
    });

    // Player vs coins
    this.physics.add.overlap(this.player, this.coins, (_player, coin) => {
      this.collectCoin(coin as Phaser.Physics.Arcade.Sprite);
    });

    // Player vs flag pole
    this.physics.add.overlap(this.player, this.flagPole, () => {
      if (!this.levelComplete) this.completeLevel();
    });

    // Moving shell vs enemies
    this.koopas.getChildren().forEach(koopa => {
      this.physics.add.overlap(koopa, this.goombas, (k, g) => {
        if ((k as Koopa).isMovingShell()) {
          this.killGoombaByShell(g as Goomba);
        }
      });
      this.physics.add.overlap(koopa, this.koopas, (k1, k2) => {
        if (k1 !== k2 && (k1 as Koopa).isMovingShell()) {
          (k2 as Koopa).stomp();
          k2.destroy();
        }
      });
    });

    // Koopa shell vs player (when moving shell)
    this.koopas.getChildren().forEach(koopa => {
      this.physics.add.overlap(this.player, koopa, () => {
        const k = koopa as Koopa;
        if (k.isMovingShell()) {
          if (this.player.hit()) {
            this.handlePlayerDeath();
          }
        }
      });
    });

    // Koopa shell vs blocks
    this.koopas.getChildren().forEach(koopa => {
      this.blocks.forEach(block => {
        this.physics.add.collider(koopa, block.sprite, () => {
          if ((koopa as Koopa).isMovingShell()) {
            this.hitBlock(block);
          }
        });
      });
    });
  }

  private handleBlockHit(blockSprite: Phaser.Physics.Arcade.Sprite): boolean {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Only trigger when player is hitting from below
    if (playerBody.velocity.y >= 0) return true;

    const block = this.blocks.find(b => b.sprite === blockSprite);
    if (block) {
      this.hitBlock(block);
    }

    return true;
  }

  private hitBlock(block: BlockData) {
    if (block.type === 'question' && !block.used) {
      block.used = true;
      block.sprite.setTexture('question_empty');

      if (block.content === 'coin') {
        this.spawnCoinFromBlock(block);
      } else if (block.content === 'mushroom') {
        this.spawnMushroom(block);
      } else if (block.content === 'fireflower') {
        this.spawnFireFlower(block);
      }

      // Bounce animation
      this.tweens.add({
        targets: block.sprite,
        y: block.sprite.y - 8,
        duration: 80,
        yoyo: true,
      });
    } else if (block.type === 'brick') {
      if (this.player.state !== 'small') {
        // Break brick
        this.spawnBrickParticles(block.sprite.x, block.sprite.y);
        block.sprite.destroy();
        const idx = this.blocks.indexOf(block);
        if (idx !== -1) this.blocks.splice(idx, 1);
      } else {
        // Bounce only
        this.tweens.add({
          targets: block.sprite,
          y: block.sprite.y - 4,
          duration: 60,
          yoyo: true,
        });
      }
    }
  }

  private spawnCoinFromBlock(block: BlockData) {
    const coin = this.coins.create(block.sprite.x, block.sprite.y - TILE_SIZE, 'coin');
    coin.body!.allowGravity = true;
    coin.setVelocityY(COIN.BOUNCE);
    coin.setDepth(8);

    // Collect immediately
    this.time.delayedCall(100, () => {
      if (coin.active) {
        this.collectCoin(coin);
      }
    });
  }

  private spawnMushroom(block: BlockData) {
    const mushroom = this.mushrooms.create(block.sprite.x, block.sprite.y - TILE_SIZE, 'mushroom');
    mushroom.body!.allowGravity = true;
    mushroom.setVelocityX(MUSHROOM_SPEED);
    mushroom.setDepth(8);
    mushroom.body!.setSize(14, 14);
  }

  private spawnFireFlower(block: BlockData) {
    const flower = this.fireFlowers.create(block.sprite.x, block.sprite.y - TILE_SIZE, 'fireflower');
    flower.body!.allowGravity = false;
    flower.setDepth(8);
  }

  private spawnBrickParticles(x: number, y: number) {
    const colors = [0xc84c0c, 0x801800, 0xffa040];
    for (let i = 0; i < 4; i++) {
      const px = x + (i % 2 === 0 ? -4 : 4);
      const py = y + (i < 2 ? -4 : 4);
      const particle = this.add.rectangle(px, py, 8, 8, colors[i % 3]).setDepth(15);

      const targetX = px + (i % 2 === 0 ? -35 : 35);
      const targetY = py - 70 - Math.random() * 30;

      // Arc motion: rise fast, then fade — ease-out for natural deceleration
      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        angle: (i % 2 === 0 ? -90 : 90),
        duration: 550,
        ease: 'Sine.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private collectCoin(coin: Phaser.Physics.Arcade.Sprite) {
    if (!coin.active) return;
    this.coinCount++;
    this.score += COIN.SCORE;
    this.hud.updateCoins(this.coinCount);
    this.hud.updateScore(this.score);

    // Pop-up coin with ease-out arc
    this.tweens.add({
      targets: coin,
      y: coin.y - 30,
      alpha: 0,
      duration: 250,
      ease: 'Sine.easeOut',
      onComplete: () => coin.destroy(),
    });

    // Score popup — rises with ease-out, fades smoothly (UX: meaningful motion)
    this.showScorePopup(coin.x, coin.y, '200');
  }

  private collectMushroom(mushroom: Phaser.Physics.Arcade.Sprite) {
    if (!mushroom.active) return;
    const mx = mushroom.x;
    const my = mushroom.y;
    mushroom.destroy();
    this.player.powerUp();
    this.score += 1000;
    this.hud.updateScore(this.score);

    this.showScorePopup(mx, my, '1UP');
    this.flashScreen(0x00ff00, 0.15);
  }

  private collectFireFlower(flower: Phaser.Physics.Arcade.Sprite) {
    if (!flower.active) return;
    const fx = flower.x;
    const fy = flower.y;
    flower.destroy();
    this.player.powerUp();
    this.score += 1000;
    this.hud.updateScore(this.score);

    this.showScorePopup(fx, fy, 'FIRE!');
    this.flashScreen(0xff6600, 0.15);
  }

  private flashScreen(color: number, alpha: number) {
    const flash = this.add.rectangle(
      this.cameras.main.scrollX + GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, color, alpha
    ).setDepth(40);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      ease: 'Sine.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private showScorePopup(x: number, y: number, text: string) {
    const popup = this.add.text(x, y - 10, text, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20).setAlpha(0).setScale(0.5);

    // Scale-in + rise with ease-out (UX: spring-like feel, spatial continuity)
    this.tweens.add({
      targets: popup,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 120,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: popup,
          y: popup.y - 28,
          alpha: 0,
          duration: 600,
          ease: 'Sine.easeIn',
          onComplete: () => popup.destroy(),
        });
      },
    });
  }

  private handleGoombaCollision(goomba: Goomba) {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const goombaBody = goomba.body as Phaser.Physics.Arcade.Body;

    // Stomp: player falling and hitting top of goomba
    if (playerBody.velocity.y > 0 && this.player.y < goomba.y - 8) {
      const pts = goomba.squish();
      this.score += pts;
      this.hud.updateScore(this.score);
      this.player.stompBounce();
      this.showScorePopup(goomba.x, goomba.y, pts.toString());
    } else {
      // Player gets hurt
      if (this.player.hit()) {
        this.handlePlayerDeath();
      }
    }
  }

  private handleKoopaCollision(koopa: Koopa) {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    if (koopa.isIdleShell()) {
      // Kick shell in direction player is facing
      koopa.kickShell(this.player.getFacing() === 'right');
      return;
    }

    if (koopa.isMovingShell()) {
      // Check if stomping
      if (playerBody.velocity.y > 0 && this.player.y < koopa.y - 8) {
        koopa.stomp();
        this.player.stompBounce();
      } else {
        if (this.player.hit()) {
          this.handlePlayerDeath();
        }
      }
      return;
    }

    // Walking koopa - stomp
    if (playerBody.velocity.y > 0 && this.player.y < koopa.y - 8) {
      const pts = koopa.stomp();
      this.player.stompBounce();
      if (pts > 0) {
        this.score += pts;
        this.hud.updateScore(this.score);
      }
    } else {
      if (this.player.hit()) {
        this.handlePlayerDeath();
      }
    }
  }

  private killGoombaByShell(goomba: Goomba) {
    const pts = goomba.squish();
    this.score += pts;
    this.hud.updateScore(this.score);
    this.showScorePopup(goomba.x, goomba.y, pts.toString());
  }

  private handlePlayerDeath() {
    if (this.deathHandled) return;
    this.deathHandled = true;

    if (this.timerEvent) this.timerEvent.remove();

    this.player.die();
    this.lives--;
    this.hud.updateLives(this.lives);

    this.time.delayedCall(1500, () => {
      if (this.lives <= 0) {
        this.showGameOver();
      } else {
        this.scene.restart();
      }
    });
  }

  private showGameOver() {
    const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;

    // Fade-in overlay (UX: smooth transition, not instant snap)
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setDepth(50);
    this.tweens.add({
      targets: overlay,
      alpha: 0.75,
      duration: 400,
      ease: 'Sine.easeOut',
    });

    // GAME OVER text — scale-in from center
    const gameOverText = this.add.text(cx, GAME_HEIGHT / 2 - 20, 'GAME OVER', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51).setScale(0).setAlpha(0);

    this.tweens.add({
      targets: gameOverText,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 350,
      ease: 'Back.easeOut',
      delay: 200,
    });

    // Score — fade in
    const scoreText = this.add.text(cx, GAME_HEIGHT / 2 + 10, `SCORE: ${this.score}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#e4a010',
    }).setOrigin(0.5).setDepth(51).setAlpha(0);

    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 300,
      delay: 500,
    });

    // Restart prompt — fade in then pulse
    const restartText = this.add.text(cx, GAME_HEIGHT / 2 + 40, '按 ENTER 重新开始', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(51).setAlpha(0);

    this.tweens.add({
      targets: restartText,
      alpha: 1,
      duration: 300,
      delay: 700,
      onComplete: () => {
        this.tweens.add({
          targets: restartText,
          alpha: { from: 1, to: 0.25 },
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });

    this.input.keyboard!.once('keydown-ENTER', () => {
      this.score = 0;
      this.coinCount = 0;
      this.lives = GAME.LIVES;
      this.scene.restart();
    });
  }

  private completeLevel() {
    this.levelComplete = true;
    if (this.timerEvent) this.timerEvent.remove();

    // Time bonus
    const timeBonus = this.timeLeft * 50;
    this.score += timeBonus;
    this.hud.updateScore(this.score);

    // Slide down flag pole
    this.tweens.add({
      targets: this.player,
      y: 13 * TILE_SIZE,
      duration: 500,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.player.setVelocity(0, 0);
        (this.player.body as Phaser.Physics.Arcade.Body).enable = false;

        // Walk to castle
        this.tweens.add({
          targets: this.player,
          x: this.player.x + 50,
          duration: 800,
          onComplete: () => {
            this.showLevelComplete(timeBonus);
          },
        });
      },
    });
  }

  private showLevelComplete(timeBonus: number) {
    const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;

    // Fade-in overlay
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setDepth(50);
    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 400,
      ease: 'Sine.easeOut',
    });

    const isFinalLevel = this.currentLevel === 3;

    // Title — bounce in
    const titleText = this.add.text(cx, GAME_HEIGHT / 2 - 30, isFinalLevel ? '恭喜通关!' : '关卡完成!', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: isFinalLevel ? '#FFD700' : '#44ff44',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51).setScale(0).setAlpha(0);

    this.tweens.add({
      targets: titleText,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut',
      delay: 200,
    });

    // Time bonus — fade in
    const bonusText = this.add.text(cx, GAME_HEIGHT / 2, `时间奖励: ${timeBonus}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#e4a010',
    }).setOrigin(0.5).setDepth(51).setAlpha(0);

    this.tweens.add({
      targets: bonusText,
      alpha: 1,
      y: GAME_HEIGHT / 2 - 2,
      duration: 300,
      ease: 'Sine.easeOut',
      delay: 500,
    });

    // Total score — fade in
    const scoreText = this.add.text(cx, GAME_HEIGHT / 2 + 20, `总分: ${this.score}`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51).setAlpha(0);

    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 300,
      delay: 700,
    });

    // Restart prompt — fade in then pulse
    const nextLevelText = this.add.text(cx, GAME_HEIGHT / 2 + 50, isFinalLevel ? '按 ENTER 返回主菜单' : '按 ENTER 进入下一关', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(51).setAlpha(0);

    this.tweens.add({
      targets: nextLevelText,
      alpha: 1,
      duration: 300,
      delay: 900,
      onComplete: () => {
        this.tweens.add({
          targets: nextLevelText,
          alpha: { from: 1, to: 0.25 },
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });

    this.input.keyboard!.once('keydown-ENTER', () => {
      // Move to next level
      const nextLevel = this.currentLevel + 1;
      if (nextLevel <= 3) {
        // Go to next level
        this.scene.start('GameScene', { level: nextLevel });
      } else {
        // All levels completed - return to menu
        this.score = 0;
        this.coinCount = 0;
        this.lives = GAME.LIVES;
        this.scene.start('MenuScene');
      }
    });
  }

  private tickTimer() {
    if (this.levelComplete || this.deathHandled) return;
    this.timeLeft--;
    this.hud.updateTime(this.timeLeft);

    if (this.timeLeft <= 0) {
      this.handlePlayerDeath();
    }
  }
}

const MUSHROOM_SPEED = 80;
