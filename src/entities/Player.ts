import Phaser from 'phaser';
import { TILE_SIZE, PLAYER } from '../utils/constants';

export type PlayerState = 'small' | 'big' | 'fire';

export class Player extends Phaser.Physics.Arcade.Sprite {
  state: PlayerState = 'small';
  isDead = false;
  isInvincible = false;
  isCrouching = false;
  private invincibleTimer?: Phaser.Time.TimerEvent;
  private facing: 'left' | 'right' = 'right';
  private isRunning = false;
  private isJumping = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'mario_small');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.body!.setSize(12, 16);
    this.body!.setOffset(2, 0);
    this.setGravityY(PLAYER.GRAVITY);
    this.setDepth(10);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, runKey: Phaser.Input.Keyboard.Key, fireKey: Phaser.Input.Keyboard.Key) {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isRunning = runKey.isDown;

    // Horizontal movement
    if (cursors.left.isDown) {
      this.setVelocityX(this.isRunning ? -PLAYER.RUN_SPEED : -PLAYER.WALK_SPEED);
      this.facing = 'left';
      this.setFlipX(true);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.isRunning ? PLAYER.RUN_SPEED : PLAYER.WALK_SPEED);
      this.facing = 'right';
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // Jumping — classic Mario style: hold longer = jump higher
    const canJump = body.blocked.down || body.touching.down;

    if (canJump && this.body!.velocity.y >= 0) {
      this.isJumping = false;
    }

    if (cursors.up.isDown && canJump && !this.isJumping) {
      this.isJumping = true;
      this.setVelocityY(PLAYER.JUMP_VELOCITY);
    }

    // While holding jump and ascending, partially cancel gravity for a higher arc.
    // Release early → full gravity → short jump. Hold → slow deceleration → tall jump.
    if (this.isJumping && cursors.up.isDown && this.body!.velocity.y < 0) {
      this.setVelocityY(this.body!.velocity.y - 6);
    }

    // Update texture based on state
    this.updateTexture();

    // Don't fall off left edge of the world
    if (this.x < 8) {
      this.x = 8;
    }
  }

  private updateTexture() {
    if (this.state === 'fire') {
      this.setTexture('mario_fire');
    } else if (this.state === 'big') {
      this.setTexture('mario_big');
    } else {
      this.setTexture('mario_small');
    }
  }

  powerUp() {
    if (this.state === 'small') {
      this.state = 'big';
      this.body!.setSize(12, 28);
      this.body!.setOffset(2, 4);
      this.y -= TILE_SIZE;
      this.updateTexture();
    } else if (this.state === 'big') {
      this.state = 'fire';
      this.updateTexture();
    }
  }

  hit(): boolean {
    if (this.isInvincible) return false;

    if (this.state !== 'small') {
      this.state = 'small';
      this.body!.setSize(12, 16);
      this.body!.setOffset(2, 0);
      this.updateTexture();
      this.makeInvincible();
      return false;
    }

    this.die();
    return true;
  }

  die() {
    this.isDead = true;
    this.setVelocity(0, -200);
    this.setCollideWorldBounds(false);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
  }

  makeInvincible() {
    this.isInvincible = true;
    this.invincibleTimer = this.scene.time.delayedCall(2000, () => {
      this.isInvincible = false;
    });

    // Flicker effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 20,
      onComplete: () => {
        this.setAlpha(1);
      },
    });
  }

  stompBounce() {
    this.setVelocityY(PLAYER.BOUNCE_VELOCITY);
  }

  getFacing(): 'left' | 'right' {
    return this.facing;
  }
}
