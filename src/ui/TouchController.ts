import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

export class TouchController {
  private scene: Phaser.Scene;
  private leftBtn!: Phaser.GameObjects.Arc;
  private rightBtn!: Phaser.GameObjects.Arc;
  private jumpBtn!: Phaser.GameObjects.Arc;
  private runBtn!: Phaser.GameObjects.Arc;
  private isTouchDevice: boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (this.isTouchDevice) {
      this.createButtons();
    }
  }

  private createButtons() {
    const btnSize = 28;
    const margin = 16;
    const bottomY = GAME_HEIGHT - margin - btnSize;
    const alpha = 0.35;

    // Left button
    this.leftBtn = this.scene.add.circle(margin + btnSize, bottomY, btnSize, 0xffffff, alpha)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive();

    this.scene.add.text(margin + btnSize, bottomY, '◀', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Right button
    this.rightBtn = this.scene.add.circle(margin + btnSize * 3 + 12, bottomY, btnSize, 0xffffff, alpha)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive();

    this.scene.add.text(margin + btnSize * 3 + 12, bottomY, '▶', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Jump button (A)
    this.jumpBtn = this.scene.add.circle(GAME_WIDTH - margin - btnSize, bottomY, btnSize, 0x44ff44, alpha)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive();

    this.scene.add.text(GAME_WIDTH - margin - btnSize, bottomY, 'A', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Run/Fire button (B)
    this.runBtn = this.scene.add.circle(GAME_WIDTH - margin - btnSize * 3 - 12, bottomY, btnSize, 0xff4444, alpha)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive();

    this.scene.add.text(GAME_WIDTH - margin - btnSize * 3 - 12, bottomY, 'B', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Touch events
    this.setupTouchEvents();
  }

  private setupTouchEvents() {
    // Left
    this.leftBtn.on('pointerdown', () => this.simulateKey('ArrowLeft', true));
    this.leftBtn.on('pointerup', () => this.simulateKey('ArrowLeft', false));
    this.leftBtn.on('pointerout', () => this.simulateKey('ArrowLeft', false));

    // Right
    this.rightBtn.on('pointerdown', () => this.simulateKey('ArrowRight', true));
    this.rightBtn.on('pointerup', () => this.simulateKey('ArrowRight', false));
    this.rightBtn.on('pointerout', () => this.simulateKey('ArrowRight', false));

    // Jump
    this.jumpBtn.on('pointerdown', () => this.simulateKey('ArrowUp', true));
    this.jumpBtn.on('pointerup', () => this.simulateKey('ArrowUp', false));
    this.jumpBtn.on('pointerout', () => this.simulateKey('ArrowUp', false));

    // Run/Fire
    this.runBtn.on('pointerdown', () => {
      this.simulateKey('Shift', true);
      this.simulateKey('KeyZ', true);
    });
    this.runBtn.on('pointerup', () => {
      this.simulateKey('Shift', false);
      this.simulateKey('KeyZ', false);
    });
    this.runBtn.on('pointerout', () => {
      this.simulateKey('Shift', false);
      this.simulateKey('KeyZ', false);
    });
  }

  private simulateKey(code: string, down: boolean) {
    const event = new KeyboardEvent(down ? 'keydown' : 'keyup', {
      code: code,
      key: code,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  get isActive(): boolean {
    return this.isTouchDevice;
  }
}
