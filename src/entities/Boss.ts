import Phaser from 'phaser';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  stompCount = 0;
  readonly maxStomps = 10;
  private moveSpeed = 28;
  private moveDirection = 1;
  private minX: number;
  private maxX: number;
  isDefeated = false;
  private wasStomped = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Boss at ~3x player small size (player is 16x18 → boss ~48x60)
    // Boss PNG is 303x385
    this.setScale(48 / 303, 60 / 385);
    this.body!.setSize(280 * this.scaleX, 330 * this.scaleY);
    this.setGravityY(800);
    this.setDepth(10);
    this.setFlipX(false);

    // Movement bounds (oscillate around spawn x)
    this.minX = x - 64;
    this.maxX = x + 64;
    this.setVelocityX(this.moveSpeed);

    // Continuous wobble/shake for intimidation
    scene.tweens.add({
      targets: this,
      angle: { from: -5, to: 5 },
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update() {
    if (this.isDefeated) return;

    // Reverse at boundaries
    if (this.x <= this.minX) {
      this.moveDirection = 1;
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
    } else if (this.x >= this.maxX) {
      this.moveDirection = -1;
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
    }

    // Fall off screen
    if (this.y > 300) this.destroy();
  }

  stomp(): boolean {
    if (this.isDefeated || this.wasStomped) return false;
    this.wasStomped = true;
    this.stompCount++;

    // Squish feedback animation
    this.scene.tweens.add({
      targets: this,
      scaleY: this.scaleY * 0.55,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => { this.wasStomped = false; },
    });

    if (this.stompCount >= this.maxStomps) {
      this.defeat();
      return true;
    }
    return false;
  }

  private defeat() {
    this.isDefeated = true;
    this.setVelocity(0, 0);

    // Shrink + spin + fade
    this.scene.tweens.add({
      targets: this,
      scaleY: 0,
      alpha: 0,
      angle: 720,
      duration: 800,
      ease: 'Sine.easeIn',
      onComplete: () => this.destroy(),
    });
  }

  getRemaining(): number {
    return this.maxStomps - this.stompCount;
  }
}
