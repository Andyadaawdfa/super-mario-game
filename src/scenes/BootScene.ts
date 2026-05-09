import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.image('xiaoheizi', '美术资源/小黑子.png');
    this.load.image('boss', '美术资源/boss.png');
  }

  create() {
    this.generateTextures();
    this.generateMarioFromImage();
    this.generateBossTexture();
    this.scene.start('MenuScene');
  }

  private generateMarioFromImage() {
    const xiaoheizi = this.textures.get('xiaoheizi');
    const source = xiaoheizi.getSourceImage() as CanvasImageSource;

    // mario_small: 16x18
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = 16;
    smallCanvas.height = 18;
    const smallCtx = smallCanvas.getContext('2d')!;
    smallCtx.drawImage(source, 0, 0, 16, 18);
    this.textures.addCanvas('mario_small', smallCanvas);

    // mario_big: 16x32
    const bigCanvas = document.createElement('canvas');
    bigCanvas.width = 16;
    bigCanvas.height = 32;
    const bigCtx = bigCanvas.getContext('2d')!;
    bigCtx.drawImage(source, 0, 0, 16, 32);
    this.textures.addCanvas('mario_big', bigCanvas);

    // mario_fire: 16x32
    const fireCanvas = document.createElement('canvas');
    fireCanvas.width = 16;
    fireCanvas.height = 32;
    const fireCtx = fireCanvas.getContext('2d')!;
    fireCtx.drawImage(source, 0, 0, 16, 32);
    this.textures.addCanvas('mario_fire', fireCanvas);
  }

  private generateBossTexture() {
    const bossImg = this.textures.get('boss');
    const source = bossImg.getSourceImage() as CanvasImageSource;
    // Boss at 3x player size (player small is 16x18 → boss 48x60)
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(source, 0, 0, 48, 60);
    this.textures.addCanvas('boss_sprite', canvas);
  }

  private generateTextures() {
    this.generateGoomba();
    this.generateKoopa();
    this.generateKoopaShell();
    this.generateGround();
    this.generateBrick();
    this.generateQuestionBlock();
    this.generateQuestionBlockEmpty();
    this.generateCoin();
    this.generatePipe();
    this.generateMushroom();
    this.generateFireFlower();
    this.generateFlagPole();
    this.generateSky();
    this.generateCastle();
    this.generateCloud();
    this.generateBasketball();
  }

  private generateGoomba() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    // Body
    g.fillStyle(COLORS.GOOMBA_BODY);
    g.fillRect(2, 0, 12, 8);
    g.fillRect(1, 2, 14, 6);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillRect(3, 2, 4, 4);
    g.fillRect(9, 2, 4, 4);
    g.fillStyle(0x000000);
    g.fillRect(3, 3, 2, 3);
    g.fillRect(11, 3, 2, 3);
    // Feet
    g.fillStyle(COLORS.GOOMBA_FEET);
    g.fillRect(0, 10, 6, 4);
    g.fillRect(2, 9, 4, 5);
    g.fillRect(8, 10, 6, 4);
    g.fillRect(10, 9, 4, 5);

    g.generateTexture('goomba', s, s);
    g.destroy();
  }

  private generateKoopa() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = TILE_SIZE;
    const h = TILE_SIZE + 4;
    // Shell
    g.fillStyle(COLORS.KOOPA_SHELL);
    g.fillRect(2, 4, 12, 10);
    g.fillRect(3, 2, 10, 14);
    g.fillStyle(0x005800);
    g.fillRect(4, 6, 8, 8);
    // Head
    g.fillStyle(0x00a800);
    g.fillRect(0, 0, 6, 6);
    // Eye
    g.fillStyle(0xffffff);
    g.fillRect(1, 1, 3, 3);
    g.fillStyle(0x000000);
    g.fillRect(2, 2, 2, 2);
    // Feet
    g.fillStyle(COLORS.KOOPA_FEET);
    g.fillRect(2, 16, 4, 4);
    g.fillRect(10, 16, 4, 4);

    g.generateTexture('koopa', w, h);
    g.destroy();
  }

  private generateKoopaShell() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    g.fillStyle(COLORS.KOOPA_SHELL);
    g.fillRect(2, 2, 12, 12);
    g.fillRect(3, 1, 10, 14);
    g.fillStyle(0x005800);
    g.fillRect(4, 4, 8, 8);

    g.generateTexture('koopa_shell', s, s);
    g.destroy();
  }

  private generateGround() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    g.fillStyle(COLORS.GROUND);
    g.fillRect(0, 0, s, s);
    g.fillStyle(0x801800);
    g.fillRect(0, 0, s, 1);
    g.fillRect(0, 7, s, 1);
    g.fillRect(7, 0, 1, s);
    g.fillRect(0, 0, 1, s);

    g.generateTexture('ground', s, s);
    g.destroy();
  }

  private generateBrick() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    g.fillStyle(COLORS.BRICK);
    g.fillRect(0, 0, s, s);
    g.fillStyle(COLORS.BRICK_LINE);
    g.fillRect(0, 0, s, 1);
    g.fillRect(0, 7, s, 1);
    g.fillRect(0, 14, s, 1);
    g.fillRect(7, 0, 1, 7);
    g.fillRect(3, 7, 1, 8);
    g.fillRect(11, 7, 1, 8);

    g.generateTexture('brick', s, s);
    g.destroy();
  }

  private generateQuestionBlock() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    g.fillStyle(COLORS.QUESTION);
    g.fillRect(0, 0, s, s);
    g.fillStyle(0x805800);
    g.fillRect(0, 0, s, 1);
    g.fillRect(0, 0, 1, s);
    g.fillRect(0, s - 1, s, 1);
    g.fillRect(s - 1, 0, 1, s);
    g.fillStyle(COLORS.QUESTION_MARK);
    g.fillRect(5, 3, 5, 2);
    g.fillRect(8, 3, 2, 5);
    g.fillRect(6, 7, 3, 2);
    g.fillRect(7, 9, 2, 2);
    g.fillRect(7, 13, 2, 2);

    g.generateTexture('question', s, s);
    g.destroy();
  }

  private generateQuestionBlockEmpty() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    g.fillStyle(0x6b3000);
    g.fillRect(0, 0, s, s);
    g.fillStyle(0x3b1800);
    g.fillRect(0, 0, s, 1);
    g.fillRect(0, 0, 1, s);
    g.fillRect(0, s - 1, s, 1);
    g.fillRect(s - 1, 0, 1, s);

    g.generateTexture('question_empty', s, s);
    g.destroy();
  }

  private generateCoin() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(COLORS.COIN);
    g.fillRect(4, 1, 8, 14);
    g.fillRect(3, 3, 10, 10);
    g.fillStyle(0x805800);
    g.fillRect(5, 3, 2, 10);
    g.fillRect(9, 3, 2, 10);

    g.generateTexture('coin', TILE_SIZE, TILE_SIZE);
    g.destroy();
  }

  private generatePipe() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = TILE_SIZE * 2;
    const h = TILE_SIZE * 2;
    // Left pipe body
    g.fillStyle(COLORS.PIPE_LIGHT);
    g.fillRect(2, 0, 12, 32);
    g.fillRect(0, 0, 32, 32);
    // Dark edge
    g.fillStyle(COLORS.PIPE_DARK);
    g.fillRect(0, 0, 4, 32);
    g.fillRect(28, 0, 4, 32);
    // Highlight
    g.fillStyle(0x00e800);
    g.fillRect(6, 0, 2, 32);

    g.generateTexture('pipe', w, h);
    g.destroy();
  }

  private generateMushroom() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    // Cap
    g.fillStyle(COLORS.MUSHROOM_CAP);
    g.fillRect(1, 0, 14, 6);
    g.fillRect(3, 6, 10, 2);
    // Spots
    g.fillStyle(COLORS.MUSHROOM_SPOT);
    g.fillRect(3, 1, 4, 4);
    g.fillRect(9, 1, 4, 4);
    // Face
    g.fillStyle(COLORS.MUSHROOM_FACE);
    g.fillRect(4, 8, 8, 6);
    g.fillRect(3, 9, 10, 4);
    // Eyes
    g.fillStyle(0x000000);
    g.fillRect(4, 9, 2, 2);
    g.fillRect(10, 9, 2, 2);

    g.generateTexture('mushroom', s, s);
    g.destroy();
  }

  private generateFireFlower() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    // Petals
    g.fillStyle(0xb81010);
    g.fillRect(3, 0, 10, 4);
    g.fillRect(0, 3, 16, 4);
    g.fillRect(3, 7, 10, 4);
    // Center
    g.fillStyle(0xe4a010);
    g.fillRect(5, 3, 6, 6);
    // Stem
    g.fillStyle(0x00a800);
    g.fillRect(7, 11, 2, 5);

    g.generateTexture('fireflower', s, s);
    g.destroy();
  }

  private generateFlagPole() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(COLORS.FLAG_POLE);
    g.fillRect(7, 0, 2, TILE_SIZE * 12);
    // Flag
    g.fillStyle(COLORS.FLAG_GREEN);
    g.fillRect(0, 0, 7, 8);
    // Ball on top
    g.fillStyle(0xe4a010);
    g.fillRect(6, 0, 4, 4);

    g.generateTexture('flag_pole', TILE_SIZE, TILE_SIZE * 12);
    g.destroy();
  }

  private generateSky() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(COLORS.SKY);
    g.fillRect(0, 0, 16, 16);
    g.generateTexture('sky', 16, 16);
    g.destroy();
  }

  private generateCastle() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    g.fillStyle(COLORS.CASTLE_GRAY);
    g.fillRect(0, 0, s * 5, s * 5);
    // Door
    g.fillStyle(0x000000);
    g.fillRect(s * 2, s * 3, s, s * 2);
    // Windows
    g.fillRect(s, s, s, s);
    g.fillRect(s * 3, s, s, s);
    // Battlements
    g.fillStyle(0x000000);
    g.fillRect(0, 0, s, s);
    g.fillRect(s * 2, 0, s, s);
    g.fillRect(s * 4, 0, s, s);

    g.generateTexture('castle', s * 5, s * 5);
    g.destroy();
  }

  private generateCloud() {
    // Generate a cloud texture using simple shapes
    const g = this.make.graphics({ x: 0, y: 0 });

    // Cloud color (white with slight transparency)
    g.fillStyle(0xffffff, 0.9);

    // Main cloud body (elliptical shape made of overlapping circles/rectangles)
    g.fillEllipse(32, 20, 64, 24);  // Main body
    g.fillEllipse(20, 14, 28, 20);  // Left bump
    g.fillEllipse(44, 14, 28, 20);  // Right bump
    g.fillEllipse(32, 10, 20, 16);  // Top center

    // Generate texture (size fits the cloud)
    g.generateTexture('cloud', 64, 30);
    g.destroy();
  }

  private generateBasketball() {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = TILE_SIZE;
    // Orange ball body (pixel art)
    g.fillStyle(0xd4692a);
    g.fillRect(1, 0, 14, 16);
    g.fillRect(0, 1, 16, 14);
    // Brown seam lines
    g.fillStyle(0x5c3a1e);
    g.fillRect(0, 7, 16, 2);
    g.fillRect(7, 0, 2, 16);
    // Highlight
    g.fillStyle(0xff8c42);
    g.fillRect(3, 3, 4, 3);
    g.fillRect(10, 3, 3, 2);
    g.generateTexture('basketball', s, s);
    g.destroy();
  }
}
