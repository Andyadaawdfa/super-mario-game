import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Sky background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.SKY);

    // Ground strip at bottom
    for (let x = 0; x < GAME_WIDTH; x += 16) {
      this.add.image(x + 8, GAME_HEIGHT - 8, 'ground').setOrigin(0.5, 0.5);
    }

    // Dark overlay panel for title area (visual hierarchy)
    const panel = this.add.rectangle(GAME_WIDTH / 2, 55, GAME_WIDTH - 24, 68, 0x000000, 0.45)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0xffffff, 0.15);
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 400,
      ease: 'Sine.easeOut',
    });

    // Title — "超级玛丽" with shadow
    const titleShadow = this.add.text(GAME_WIDTH / 2 + 1, 32, '超级玛丽', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    const title = this.add.text(GAME_WIDTH / 2, 31, '超级玛丽', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [titleShadow, title],
      alpha: { from: 0, to: 1 },
      y: '+=4',
      duration: 500,
      ease: 'Back.easeOut',
      delay: 100,
    });

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 55, 'SUPER MARIO', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#e4a010',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 400,
      ease: 'Sine.easeOut',
      delay: 300,
    });

    // Mario sprite preview with bounce
    const mario = this.add.image(GAME_WIDTH / 2, 120, 'mario_small').setScale(3).setAlpha(0);
    this.tweens.add({
      targets: mario,
      alpha: 1,
      duration: 400,
      delay: 400,
      onComplete: () => {
        this.tweens.add({
          targets: mario,
          y: 115,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });

    // Controls instruction panel
    const controlPanel = this.add.rectangle(GAME_WIDTH / 2, 175, GAME_WIDTH - 32, 38, 0x000000, 0.35)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0xffffff, 0.1)
      .setAlpha(0);

    const controlTitle = this.add.text(GAME_WIDTH / 2, 163, '操作说明', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#e4a010',
    }).setOrigin(0.5).setAlpha(0);

    const controls = this.add.text(GAME_WIDTH / 2, 177, '← → 移动  ↑ 跳跃  SHIFT 奔跑  Z 射击', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [controlPanel, controlTitle, controls],
      alpha: 1,
      duration: 400,
      ease: 'Sine.easeOut',
      delay: 600,
    });

    // Start prompt with pulse
    const startText = this.add.text(GAME_WIDTH / 2, 210, '按 ENTER 或 SPACE 开始游戏', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: startText,
      alpha: 1,
      duration: 300,
      delay: 800,
      onComplete: () => {
        this.tweens.add({
          targets: startText,
          alpha: { from: 1, to: 0.2 },
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });

    // Input
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('GameScene', { level: 1 });
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.scene.start('GameScene', { level: 1 });
    });

    // Touch to start (for mobile)
    this.input.on('pointerdown', () => {
      this.scene.start('GameScene', { level: 1 });
    });
  }
}
