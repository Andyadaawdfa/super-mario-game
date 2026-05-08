import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

export class HUD {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private coinIcon!: Phaser.GameObjects.Image;
  private worldText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, level: number = 1) {
    this.scene = scene;
    this.create(level);
  }

  private create(level: number) {
    // Semi-transparent HUD bar for contrast (UX: visual hierarchy, readability)
    const barHeight = 24;
    this.scene.add.rectangle(GAME_WIDTH / 2, barHeight / 2, GAME_WIDTH, barHeight, 0x000000, 0.4)
      .setScrollFactor(0).setDepth(99);

    // Thin accent line at bottom of HUD bar
    this.scene.add.rectangle(GAME_WIDTH / 2, barHeight, GAME_WIDTH, 1, 0xffffff, 0.08)
      .setScrollFactor(0).setDepth(99);

    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
    };

    const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    };

    // SCORE section
    this.scene.add.text(8, 3, 'SCORE', labelStyle).setScrollFactor(0).setDepth(100);
    this.scoreText = this.scene.add.text(8, 13, '000000', valueStyle)
      .setScrollFactor(0).setDepth(100);

    // COIN section
    this.coinIcon = this.scene.add.image(98, 12, 'coin').setScale(0.7).setScrollFactor(0).setDepth(100);
    this.scene.add.text(107, 3, 'COIN', labelStyle).setScrollFactor(0).setDepth(100);
    this.coinText = this.scene.add.text(112, 13, '00', valueStyle).setScrollFactor(0).setDepth(100);

    // WORLD section
    this.scene.add.text(155, 3, 'WORLD', labelStyle).setScrollFactor(0).setDepth(100);
    this.worldText = this.scene.add.text(160, 13, `1-${level}`, valueStyle).setScrollFactor(0).setDepth(100);

    // TIME section
    this.scene.add.text(205, 3, 'TIME', labelStyle).setScrollFactor(0).setDepth(100);
    this.timeText = this.scene.add.text(210, 13, '300', valueStyle).setScrollFactor(0).setDepth(100);

    // Lives (shown during game over flow)
    this.livesText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, '× 3', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);
  }

  updateScore(score: number) {
    this.scoreText.setText(score.toString().padStart(6, '0'));
  }

  updateCoins(coins: number) {
    this.coinText.setText(coins.toString().padStart(2, '0'));
    // Brief scale pulse on coin collect (UX: micro-interaction feedback)
    this.scene.tweens.add({
      targets: this.coinText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  updateTime(time: number) {
    const val = Math.max(0, time);
    this.timeText.setText(val.toString());
    // Warn when time is low — turn red (UX: color as semantic feedback)
    if (val <= 50) {
      this.timeText.setColor('#ff4444');
    } else {
      this.timeText.setColor('#ffffff');
    }
  }

  updateLives(lives: number) {
    this.livesText.setText(`× ${lives}`);
  }

  showLives(lives: number) {
    this.livesText.setVisible(true);
    this.updateLives(lives);
  }

  hideLives() {
    this.livesText.setVisible(false);
  }
}
