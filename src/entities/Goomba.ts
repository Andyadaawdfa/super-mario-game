import Phaser from 'phaser';
import { TILE_SIZE, GOOMBA } from '../utils/constants';

export class Goomba extends Phaser.Physics.Arcade.Sprite {
  private speed = GOOMBA.SPEED;
  private direction = -1;
  private isSquished = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'goomba');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.body!.setSize(14, 14);
    this.body!.setOffset(1, 2);
    this.setGravityY(400);
    this.setVelocityX(this.speed * this.direction);
    this.setDepth(5);
  }

  update() {
    if (this.isSquished) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left) {
      this.direction = 1;
      this.setVelocityX(this.speed);
    } else if (body.blocked.right) {
      this.direction = -1;
      this.setVelocityX(this.speed * this.direction);
    }

    // Fall into pits
    if (this.y > 300) {
      this.destroy();
    }
  }

  squish(): number {
    if (this.isSquished) return 0;
    this.isSquished = true;
    this.setVelocityX(0);
    this.body!.enable = false;
    this.setTexture('goomba');
    this.setScale(1, 0.3);
    this.y += 8;

    this.scene.time.delayedCall(300, () => {
      this.destroy();
    });

    return GOOMBA.SCORE;
  }

  reverseDirection() {
    this.direction *= -1;
    this.setVelocityX(this.speed * this.direction);
  }
}
