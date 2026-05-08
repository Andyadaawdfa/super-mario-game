import Phaser from 'phaser';
import { TILE_SIZE, KOOPA } from '../utils/constants';

export type KoopaMode = 'walking' | 'shell' | 'shell_moving';

export class Koopa extends Phaser.Physics.Arcade.Sprite {
  mode: KoopaMode = 'walking';
  private speed = KOOPA.SPEED;
  private direction = -1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'koopa');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.body!.setSize(12, 20);
    this.body!.setOffset(2, 4);
    this.setGravityY(400);
    this.setVelocityX(this.speed * this.direction);
    this.setDepth(5);
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.mode === 'walking') {
      if (body.blocked.left) {
        this.direction = 1;
        this.setVelocityX(this.speed);
        this.setFlipX(true);
      } else if (body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(this.speed * this.direction);
        this.setFlipX(false);
      }
    }

    if (this.y > 300) {
      this.destroy();
    }
  }

  stomp(): number {
    if (this.mode === 'walking') {
      this.mode = 'shell';
      this.setTexture('koopa_shell');
      this.body!.setSize(12, 12);
      this.body!.setOffset(2, 4);
      this.setVelocityX(0);
      this.y += 6;
      return 0;
    } else if (this.mode === 'shell') {
      // Kick shell
      this.mode = 'shell_moving';
      return 0;
    } else if (this.mode === 'shell_moving') {
      // Stop shell
      this.mode = 'shell';
      this.setVelocityX(0);
      return 0;
    }
    return 0;
  }

  kickShell(fromLeft: boolean) {
    if (this.mode !== 'shell') return;
    this.mode = 'shell_moving';
    this.setVelocityX(fromLeft ? KOOPA.SHELL_SPEED : -KOOPA.SHELL_SPEED);
  }

  reverseDirection() {
    if (this.mode === 'shell_moving') {
      this.setVelocityX(-this.body!.velocity.x);
    } else if (this.mode === 'walking') {
      this.direction *= -1;
      this.setVelocityX(this.speed * this.direction);
    }
  }

  isMovingShell(): boolean {
    return this.mode === 'shell_moving';
  }

  isIdleShell(): boolean {
    return this.mode === 'shell';
  }
}
