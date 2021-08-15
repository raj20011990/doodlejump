// @ts-nocheck
namespace DoodleJump {
  export interface IPoint {
    x: number;
    y: number;
  }
  export class GamePlayScene extends Phaser.Scene {
    private loadingText?: Phaser.GameObjects.Text;

    private normalPlatform?: Phaser.Physics.Arcade.Group;
    private brokenPlatform?: Phaser.Physics.Arcade.Group;
    private springGroup?: Phaser.Physics.Arcade.Group;
    private chopperGroup?: Phaser.Physics.Arcade.Group;
    private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private playerMovement?: Phaser.Types.Input.Keyboard.CursorKeys;
    private platformBaseY?: number;
    private cameraY?: number;
    private isChopperAdded?: boolean;
    private platformPositions: IPoint[] = [];
    private springPositions: IPoint[] = [];
    private chopperPositions: IPoint[] = [];
    private brokenTilePositions: IPoint[] = [];
    private gameScore?: number;
    private gameScoreText?: Phaser.GameObjects.Text;
    private playerFirstBounce?: boolean;
    private retryButton?: Phaser.GameObjects.Image;;
    private gameOverText?:  Phaser.GameObjects.Text;
    private isGameFinished?: boolean;

    constructor() {
      super("Game");
    }

    /**
     * preload function
     * will load assets for the game required for this game scene.
     * Loading Text will be shown till the assets loading is not done.
     */
    preload() {
      const { width, height } = this.cameras.main;
      this.loadingText = this.make.text({
        x: width / 2,
        y: height / 2,
        text: "Assets Loading...",
        style: {
          font: "40px Arial, #ffffff",
        },
      });
      this.loadingText.setOrigin(0.5, 0.5);
      this.load.image("baseBlue", "assets/base_blue.png");
      this.load.image("baseGreen", "assets/base_green.png");
      //    this.load.image("player", "assets/player.png");
      this.load.image("spring", "assets/spring.png");
      this.load.atlas(
        "player",
        "assets/player.png",
        "assets/player_atlas.json"
      );
      this.load.image("chopper", "assets/jointer.png");
      this.load.image("retry", "assets/retry.png");
      this.load.on("complete", this.onLoadingComplete.bind(this));
    }

    /**
     * onLoadingComplete function
     * function will call after the assets loading is finished.
     * function destroys the loading text from screen.
     */
    onLoadingComplete() {
      this.loadingText?.destroy();
    }

    /**
     * this function will be called after all assets is loaded.
     * function will display all game objects.
     */
    create() {
      this.isGameFinished = false;
      this.isChopperAdded = false;
      this.playerFirstBounce = false;
      this.chopperPositions = [];
      this.brokenTilePositions = [];
      this.platformPositions = [];
      this.springPositions = [];
      this.gameScore = 0;
      this.loadingText && this.loadingText?.destroy();
      this.addGameText();
      this.createSpring();
      this.createChopper();
      this.createNormalBase();
      this.createBrokenBase();
      this.createPlayer();
      this.addColliderEvents();
      this.addPlayerMovement();
    }

    /**
     * function will create the text displayed in game
     * gameScoreText will display the score of the player.
     * gameOverText will display the game over text. During the start game text is kept hidden.
     */
    addGameText(){
      this.gameScoreText = this.make.text({
        x: 80,
        y: 20,
        text: "SCORE: 0",
        style: {
          font: "20px Arial",
        },
      }).setOrigin(0.5);
      this.gameScoreText.setScrollFactor(0);
      this.gameScoreText.depth = 2;

      this.gameOverText = this.make.text({
        x: GameConfig.gameOptions.width/2,
        y: GameConfig.gameOptions.height/2,
        text: "GAME OVER",
        style: {
          font: "40px Arial",
        },
      }).setOrigin(0.5);
      this.gameOverText.setScrollFactor(0);
      this.gameOverText.depth = 2;
      this.gameOverText.visible = false;;
    }

    /**
     * function will create the group for the broken platform for the game.
     */
    createBrokenBase() {
      this.brokenPlatform = this.physics.add.group({
        allowGravity: false,
        immovable: true,
        collideWorldBounds: true,
      });
      this.brokenPlatform.enableBody = true;
    }

    /**
     * function will create the group for the spring used in the game.
     */
    createSpring() {
      this.springGroup = this.physics.add.group({
        allowGravity: false,
        immovable: true,
        collideWorldBounds: true,
      });

      this.springGroup.enableBody = true;
    }

    /**
     * function will create the group for the chopper used in the game.
     */
    createChopper() {
      this.chopperGroup = this.physics.add.group({
        allowGravity: false,
        immovable: true,
        collideWorldBounds: true,
      });
      this.chopperGroup.enableBody = true;
    }

    /**
     * function will add the keyboard events for the player.
     */
    addPlayerMovement() {
      this.playerMovement = this.input.keyboard.createCursorKeys();
    }

    /**
     * function will add the collider events between player and different objects in the game.
     */
    addColliderEvents() {
      this.physics.add.collider(
        this.player,
        this.normalPlatform,
        this.onPlayerBounce.bind(this)
      );
      this.physics.add.collider(
        this.player,
        this.springGroup,
        this.onPlayerPowerBounce.bind(this)
      );

      this.physics.add.collider(
        this.player,
        this.brokenPlatform,
        this.onBrokenPlatormCollide.bind(this)
      );

      this.physics.add.collider(
        this.player,
        this.chopperGroup,
        this.onChopperCollide.bind(this)
      );
      this.cameraY = 99999;
      this.platformBaseY = 99999;
    }

    /**
     * function will be called when player collide with the chopper.
     * after colliding, chopper will be removed and timer event will be added for the player to move freely
     * and player frame will gets changed to flymode.
     */
    onChopperCollide() {
      this.chopperGroup.children.each((chopper) => {
        if (
          chopper.body.touching.up ||
          chopper.body.touching.left ||
          chopper.body.touching.right
        ) {
          const index = this.chopperGroup.children.entries.indexOf(chopper);
          chopper.destroy();
          index != -1 && this.chopperPositions.splice(index, 1);

          this.isChopperAdded = true;
          this.player.play("fly", true);
          this.time.delayedCall(GameConfig.CHOPPER_TIMER, this.onChopperTimerEnd.bind(this));
        }
      });
    }
    /**
     *  function will be called after the timer will finished.
     *  player frame gets reset to normal mode.
     */
    onChopperTimerEnd() {
      this.time.removeAllEvents();
      this.isChopperAdded = false;
      this.player.play("idle", true);
    }

    /**
     *  function will be called after player collided with the broken platform.
     *  platform gets removed and player bounce is set as per requirement.
     */
    onBrokenPlatormCollide() {
      this.brokenPlatform.children.each((tile) => {
        if (this.player.body.touching.down && tile.body.touching.up) {
          const index = this.brokenPlatform.children.entries.indexOf(tile);
          tile.destroy();
          this.player.setVelocityY(GameConfig.BROKEN_PLATFORM_PLAYER_BOUNCE);
          index != -1 && this.brokenTilePositions.splice(index, 1);
        }
      });
    }

     /**
     *  function will be called after player collided with the spring.
     *  player bounce is set as per requirement.
     */
    onPlayerPowerBounce() {
      this.springGroup.children.each((spring) => {
        if (this.player.body.touching.down && spring.body.touching.up) {
          spring.setScale(1, 2);
          this.player.setVelocityY(GameConfig.SPRING_PLAYER_BOUNCE);
        }
      });
    }
   
     /**
     *  function will be called after player collided with the normal and moving platform.
     *  player bounce is set as per requirement.
     */
    onPlayerBounce() {
      if (this.player.body.touching.down) {
        if(!this.playerFirstBounce){
          this.playerFirstBounce = true;
          this.player.yOrig = this.player.y;
          this.player.yChange = 0;
        }
        this.player.setVelocityY(GameConfig.PLAYER_NORMAL_BOUNCE);
      }
    }

    /**
     * function is used to create the player sprite.
     * camera focus is also set on the player.
     */
    createPlayer() {
      const xPos = GameConfig.gameOptions.width / 2;
      const yPos = GameConfig.gameOptions.height / 2;
      this.player = this.physics.add
        .sprite(xPos, yPos, "player")
        .setOrigin(0, 0)
        .setScale(0.5);
      this.player.body.checkCollision.up = false;
      this.player.body.checkCollision.left = false;
      this.player.body.checkCollision.right = false;
     
      this.cameras.main.setDeadzone(
        GameConfig.gameOptions.width,
        GameConfig.gameOptions.height / 3
      );
      this.cameras.main.startFollow(this.player, true, 0, 50, 0, 0);

      // Create an idle animation i.e the normal movement
      this.anims.create({
        key: "idle",
        frames: [{ key: "player", frame: "robo_player_0" }],
        frameRate: 10,
      });

      // Use the second frame of the atlas for chopper movement
      this.anims.create({
        key: "fly",
        frames: [{ key: "player", frame: "robo_player_1" }],
        frameRate: 10,
      });
      this.player.play("idle", true);
    }

    /**
     *  function is used to create the normal platform during game start.
     */
    createNormalBase() {
      this.normalPlatform = this.physics.add.group({
        allowGravity: false,
        immovable: true,
        collideWorldBounds: true,
      });
      this.normalPlatform.enableBody = true;

      for (let i = 0; i < GameConfig.NORMAL_PLATFORM_COUNT; i++) {
        const randomX = Phaser.Math.Between(
          25,
          this.physics.world.bounds.width - 25
        );
        this.createStaticTiles(randomX, i * 80, "baseBlue");
      }
    }

    /**
     * update function get called on every frame render.
     * main functionality is handled in this function such as
     * game over functionality
     * player movement on keyboard events.
     * chopper movement of player.
     * game score based on player movement.
     */
    update() {
      if(this.isGameFinished){
        return;
      }
      this.cameraY = Math.min(
        this.cameraY,
        this.player.y - GameConfig.gameOptions.height + 430
      );
      if (this.player.y > this.cameraY + GameConfig.gameOptions.height + 500) {
        this.GameOver();
        return;
      }
      /* track the maximum amount that the player has moved */
      /* player score is based on the movement */
      if(this.playerFirstBounce){
        this.player.yChange = Math.max(
          this.player.yChange,
          Math.abs(this.player.y - this.player.yOrig)
        );
        if(this.gameScoreText && this.player.yChange){
          this.gameScore = Math.floor(this.player.yChange) ;
          this.gameScoreText.text =  "SCORE: " + this.gameScore;
        }
        /* Dynamically change world bounds based on player pos */
        this.physics.world.setBounds(
          0,
          -this.player.yChange,
          this.physics.world.bounds.width,
          GameConfig.gameOptions.height + this.player.yChange
        );
      }
     
      /* player keboard movement handled */
      if (this.playerMovement.left.isDown) {
        this.player.setVelocityX(GameConfig.PLAYER_LEFT_VELOCITY);
      } else if (this.playerMovement.right.isDown) {
        this.player.setVelocityX(GameConfig.PLAYER_RIGHT_VELOCITY);
      } else {
        this.player.setVelocityX(0);
      }

       /* player movement is handled on chopper collision */
      if (this.isChopperAdded) {
        this.player.setVelocityY(GameConfig.CHOPPER_PLAYER_BOUNCE);
      }

      this.physics.world.wrap(this.player, this.player.width / 6);

      if(this.player.y < GameConfig.gameOptions.height){
        this.normalPlatform.children.iterate(this.addPlatform.bind(this));
        this.springGroup.children.iterate(this.removeSpring.bind(this));
        this.chopperGroup.children.iterate(this.removeChopper.bind(this));
        this.brokenPlatform.children.iterate(this.removeBrokenTile.bind(this));
      } else {
       this.GameOver();
      }
    }

    /**
     * funciton is called when player fall down.
     * all the game objects alpha set to 0 and destroyed.
     * Game over text and Score is showen with retry button.
     */
    GameOver() {
      this.isGameFinished = true;
      this.normalPlatform.setAlpha(0);
      this.player.setAlpha(0);
      this.springGroup.setAlpha(0);
      this.brokenPlatform.setAlpha(0);
      this.chopperGroup.setAlpha(0);
      this.normalPlatform.destroy();
      this.player.destroy();
      this.springGroup.destroy();
      this.brokenPlatform.destroy();
      this.chopperGroup.destroy();
      this.gameOverText.visible = true;
      this.gameScoreText.setPosition(GameConfig.gameOptions.width/2, GameConfig.gameOptions.height - 350);
      this.gameScoreText.setFontSize(40);
      this.retryButton = this.add.image(GameConfig.gameOptions.width/2, GameConfig.gameOptions.height/2 + 80, 'retry').setOrigin(0.5,0.5).setScale(0.2,0.2);
      this.retryButton.setScrollFactor(0);
      this.retryButton.setInteractive({ useHandCursor: true });
      this.retryButton.on("pointerdown", this.onRetryButtonClicked.bind(this));
     
    }
    
    /**
     * function is called when retry button is clicked
     * the current scene gets stopped and the intro scene gets started.
     */
    onRetryButtonClicked(){   
      this.scene.stop("Game");
      this.scene.start("Intro");
    }

    /**
     * function is called to remove the broken tile.
     * @param brokenTile 
     */
    removeBrokenTile(brokenTile: any) {
      this.removeItem(brokenTile, this.brokenPlatform, this.brokenTilePositions);
    }

    /**
     * function is called to remove the chopper from screen.
     * @param chopper 
     */
    removeChopper(chopper: any) {
      this.removeItem(chopper, this.chopperGroup, this.chopperPositions);
    }

    /**
     * function is called to remove the spring from the screen.
     * @param spring 
     */
    removeSpring(spring: any) {
      this.removeItem(spring, this.springGroup, this.springPositions);
    }

    /**
     *  function is called to remove the different item from screen i.e spring/chopper/broken platform.
     *  when the item is moved bottom to screen, it will be removed from screen.
     * @param item 
     * @param group 
     * @param groupPosition 
     */
    removeItem(item: any, group: any, groupPosition: any){
      const index = group.children.entries.indexOf(item);
      if (index > -1) {
        item.y = groupPosition[index].y;
      }
      if (
        item &&
        item.y > this.cameraY + GameConfig.gameOptions.height
      ) {
        item.destroy();
        index != -1 && groupPosition.splice(index, 1);
      }

    }

    /**
     * function handled all the object addition i.e platform, spring, chopper based on the probablity.
     * also extra platform gets removed.
     * @param platform 
     */
    addPlatform(platform: any) {
      // console.log(platform);
      const index = this.normalPlatform.children.entries.indexOf(platform);
      platform.y = this.platformPositions[index].y;

      if (!platform) {
        return;
      }
      var yPos = this.platformBaseY - 100;
      this.platformBaseY = Math.min(this.platformBaseY, platform.y);
     
      if (platform.y > this.cameraY + GameConfig.gameOptions.height) {
        platform.destroy();
        this.platformPositions.splice(index, 1);
        let xPos = Phaser.Math.Between(
          100,
          this.physics.world.bounds.width - 100
        );
        const random = Math.floor(Math.random() * 10);
        if (random <= GameConfig.NORMAL_PLATFORM_CHANCE) {
          const tile = this.createStaticTiles(xPos, yPos, "baseBlue");
          if (random < GameConfig.SPRING_CHANCE) {
            this.addSpring(xPos, yPos, "spring");
          }
          if (random >= GameConfig.SPRING_CHANCE && random < (GameConfig.SPRING_CHANCE + GameConfig.CHOPPER_CHANCE)) {
            if (!this.isChopperAdded) {
              this.addChopper(xPos, yPos-10, "chopper");
            }
          }
        } else {
          this.createMovingTiles(xPos, yPos, "baseBlue");
        }

        if (random < GameConfig.BROKEN_PLATFORM_CHANCE) {
          if(xPos < GameConfig.gameOptions.width / 2){
            xPos = xPos+ 150;
          } else {
            xPos = xPos - 150
          }
          this.createBrokenTiles(xPos , yPos, "baseGreen");
        }
      }
    }

    /**
     * function will add broken tile to the broken platform group
     * @param x 
     * @param y 
     * @param type 
     */
    createBrokenTiles(x: number, y: number, type: string) {
      this.brokenPlatform.create(x, y, type);
      this.brokenTilePositions.push({x, y});
    }

    /**
     * function will add static tile to the normal platform group
     * @param x 
     * @param y 
     * @param type 
     */
    createStaticTiles(x: number, y: number, type: string) {
      this.normalPlatform.create(x, y, type);
      this.platformPositions.push({ x, y });
    }

    /**
     * function will add moving tile to the normal platform group
     * @param x 
     * @param y 
     * @param type 
     */
    createMovingTiles(x: number, y: number, type: string) {
      const tile = this.normalPlatform.create(x, y, type);
      tile.setVelocityX(120);
      tile.setBounceX(1);
      this.platformPositions.push({ x, y });
    }

    /**
     * function will add chopper to the chopper group
     * @param x 
     * @param y 
     * @param type 
     */
    addChopper(x: number, y: number, type: string) {
      if (this.chopperGroup) {
        this.chopperGroup.create(x, y, type);
        this.chopperPositions.push({ x, y });
      }
    }

    /**
     * function will add spring to the spring group
     * @param x 
     * @param y 
     * @param type 
     */
    addSpring(x: number, y: number, type: string) {
      if (this.springGroup) {
        this.springGroup.create(x, y, type).setOrigin(0, 1);
        this.springPositions.push({ x, y });
      }
    }
  }
}
