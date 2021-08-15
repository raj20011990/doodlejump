"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DoodleJump;
(function (DoodleJump) {
    var GameConfig;
    (function (GameConfig) {
        GameConfig.gameOptions = {
            width: 400,
            height: 550,
            gravity: 500,
        };
        GameConfig.CHOPPER_TIMER = 4000;
        GameConfig.BROKEN_PLATFORM_PLAYER_BOUNCE = -100;
        GameConfig.SPRING_PLAYER_BOUNCE = -900;
        GameConfig.PLAYER_NORMAL_BOUNCE = -400;
        GameConfig.NORMAL_PLATFORM_COUNT = 8;
        GameConfig.PLAYER_LEFT_VELOCITY = -300;
        GameConfig.PLAYER_RIGHT_VELOCITY = 300;
        GameConfig.CHOPPER_PLAYER_BOUNCE = -500;
        GameConfig.NORMAL_PLATFORM_CHANCE = 7; // 20 percent chance of getting static platform
        GameConfig.SPRING_CHANCE = 2; // 20 percent chance of getting spring on static platform
        GameConfig.CHOPPER_CHANCE = 1; // 10 percent chance of getting chopper on static platform
        GameConfig.BROKEN_PLATFORM_CHANCE = 2; // 20 percent chance of getting broken platfrom.
    })(GameConfig = DoodleJump.GameConfig || (DoodleJump.GameConfig = {}));
})(DoodleJump || (DoodleJump = {}));
var DoodleJump;
(function (DoodleJump) {
    var GamePlayScene = /** @class */ (function (_super) {
        __extends(GamePlayScene, _super);
        function GamePlayScene() {
            var _this = _super.call(this, "Game") || this;
            _this.platformPositions = [];
            _this.springPositions = [];
            _this.chopperPositions = [];
            _this.brokenTilePositions = [];
            return _this;
        }
        ;
        /**
         * preload function
         * will load assets for the game required for this game scene.
         * Loading Text will be shown till the assets loading is not done.
         */
        GamePlayScene.prototype.preload = function () {
            var _a = this.cameras.main, width = _a.width, height = _a.height;
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
            this.load.atlas("player", "assets/player.png", "assets/player_atlas.json");
            this.load.image("chopper", "assets/jointer.png");
            this.load.image("retry", "assets/retry.png");
            this.load.on("complete", this.onLoadingComplete.bind(this));
        };
        /**
         * onLoadingComplete function
         * function will call after the assets loading is finished.
         * function destroys the loading text from screen.
         */
        GamePlayScene.prototype.onLoadingComplete = function () {
            var _a;
            (_a = this.loadingText) === null || _a === void 0 ? void 0 : _a.destroy();
        };
        /**
         * this function will be called after all assets is loaded.
         * function will display all game objects.
         */
        GamePlayScene.prototype.create = function () {
            var _a;
            this.isGameFinished = false;
            this.isChopperAdded = false;
            this.playerFirstBounce = false;
            this.chopperPositions = [];
            this.brokenTilePositions = [];
            this.platformPositions = [];
            this.springPositions = [];
            this.gameScore = 0;
            this.loadingText && ((_a = this.loadingText) === null || _a === void 0 ? void 0 : _a.destroy());
            this.addGameText();
            this.createSpring();
            this.createChopper();
            this.createNormalBase();
            this.createBrokenBase();
            this.createPlayer();
            this.addColliderEvents();
            this.addPlayerMovement();
        };
        /**
         * function will create the text displayed in game
         * gameScoreText will display the score of the player.
         * gameOverText will display the game over text. During the start game text is kept hidden.
         */
        GamePlayScene.prototype.addGameText = function () {
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
                x: DoodleJump.GameConfig.gameOptions.width / 2,
                y: DoodleJump.GameConfig.gameOptions.height / 2,
                text: "GAME OVER",
                style: {
                    font: "40px Arial",
                },
            }).setOrigin(0.5);
            this.gameOverText.setScrollFactor(0);
            this.gameOverText.depth = 2;
            this.gameOverText.visible = false;
            ;
        };
        /**
         * function will create the group for the broken platform for the game.
         */
        GamePlayScene.prototype.createBrokenBase = function () {
            this.brokenPlatform = this.physics.add.group({
                allowGravity: false,
                immovable: true,
                collideWorldBounds: true,
            });
            this.brokenPlatform.enableBody = true;
        };
        /**
         * function will create the group for the spring used in the game.
         */
        GamePlayScene.prototype.createSpring = function () {
            this.springGroup = this.physics.add.group({
                allowGravity: false,
                immovable: true,
                collideWorldBounds: true,
            });
            this.springGroup.enableBody = true;
        };
        /**
         * function will create the group for the chopper used in the game.
         */
        GamePlayScene.prototype.createChopper = function () {
            this.chopperGroup = this.physics.add.group({
                allowGravity: false,
                immovable: true,
                collideWorldBounds: true,
            });
            this.chopperGroup.enableBody = true;
        };
        /**
         * function will add the keyboard events for the player.
         */
        GamePlayScene.prototype.addPlayerMovement = function () {
            this.playerMovement = this.input.keyboard.createCursorKeys();
        };
        /**
         * function will add the collider events between player and different objects in the game.
         */
        GamePlayScene.prototype.addColliderEvents = function () {
            this.physics.add.collider(this.player, this.normalPlatform, this.onPlayerBounce.bind(this));
            this.physics.add.collider(this.player, this.springGroup, this.onPlayerPowerBounce.bind(this));
            this.physics.add.collider(this.player, this.brokenPlatform, this.onBrokenPlatormCollide.bind(this));
            this.physics.add.collider(this.player, this.chopperGroup, this.onChopperCollide.bind(this));
            this.cameraY = 99999;
            this.platformBaseY = 99999;
        };
        /**
         * function will be called when player collide with the chopper.
         * after colliding, chopper will be removed and timer event will be added for the player to move freely
         * and player frame will gets changed to flymode.
         */
        GamePlayScene.prototype.onChopperCollide = function () {
            var _this = this;
            this.chopperGroup.children.each(function (chopper) {
                if (chopper.body.touching.up ||
                    chopper.body.touching.left ||
                    chopper.body.touching.right) {
                    var index = _this.chopperGroup.children.entries.indexOf(chopper);
                    chopper.destroy();
                    index != -1 && _this.chopperPositions.splice(index, 1);
                    _this.isChopperAdded = true;
                    _this.player.play("fly", true);
                    _this.time.delayedCall(DoodleJump.GameConfig.CHOPPER_TIMER, _this.onChopperTimerEnd.bind(_this));
                }
            });
        };
        /**
         *  function will be called after the timer will finished.
         *  player frame gets reset to normal mode.
         */
        GamePlayScene.prototype.onChopperTimerEnd = function () {
            this.time.removeAllEvents();
            this.isChopperAdded = false;
            this.player.play("idle", true);
        };
        /**
         *  function will be called after player collided with the broken platform.
         *  platform gets removed and player bounce is set as per requirement.
         */
        GamePlayScene.prototype.onBrokenPlatormCollide = function () {
            var _this = this;
            this.brokenPlatform.children.each(function (tile) {
                if (_this.player.body.touching.down && tile.body.touching.up) {
                    var index = _this.brokenPlatform.children.entries.indexOf(tile);
                    tile.destroy();
                    _this.player.setVelocityY(DoodleJump.GameConfig.BROKEN_PLATFORM_PLAYER_BOUNCE);
                    index != -1 && _this.brokenTilePositions.splice(index, 1);
                }
            });
        };
        /**
        *  function will be called after player collided with the spring.
        *  player bounce is set as per requirement.
        */
        GamePlayScene.prototype.onPlayerPowerBounce = function () {
            var _this = this;
            this.springGroup.children.each(function (spring) {
                if (_this.player.body.touching.down && spring.body.touching.up) {
                    spring.setScale(1, 2);
                    _this.player.setVelocityY(DoodleJump.GameConfig.SPRING_PLAYER_BOUNCE);
                }
            });
        };
        /**
        *  function will be called after player collided with the normal and moving platform.
        *  player bounce is set as per requirement.
        */
        GamePlayScene.prototype.onPlayerBounce = function () {
            if (this.player.body.touching.down) {
                if (!this.playerFirstBounce) {
                    this.playerFirstBounce = true;
                    this.player.yOrig = this.player.y;
                    this.player.yChange = 0;
                }
                this.player.setVelocityY(DoodleJump.GameConfig.PLAYER_NORMAL_BOUNCE);
            }
        };
        /**
         * function is used to create the player sprite.
         * camera focus is also set on the player.
         */
        GamePlayScene.prototype.createPlayer = function () {
            var xPos = DoodleJump.GameConfig.gameOptions.width / 2;
            var yPos = DoodleJump.GameConfig.gameOptions.height / 2;
            this.player = this.physics.add
                .sprite(xPos, yPos, "player")
                .setOrigin(0, 0)
                .setScale(0.5);
            this.player.body.checkCollision.up = false;
            this.player.body.checkCollision.left = false;
            this.player.body.checkCollision.right = false;
            this.cameras.main.setDeadzone(DoodleJump.GameConfig.gameOptions.width, DoodleJump.GameConfig.gameOptions.height / 3);
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
        };
        /**
         *  function is used to create the normal platform during game start.
         */
        GamePlayScene.prototype.createNormalBase = function () {
            this.normalPlatform = this.physics.add.group({
                allowGravity: false,
                immovable: true,
                collideWorldBounds: true,
            });
            this.normalPlatform.enableBody = true;
            for (var i = 0; i < DoodleJump.GameConfig.NORMAL_PLATFORM_COUNT; i++) {
                var randomX = Phaser.Math.Between(25, this.physics.world.bounds.width - 25);
                this.createStaticTiles(randomX, i * 80, "baseBlue");
            }
        };
        /**
         * update function get called on every frame render.
         * main functionality is handled in this function such as
         * game over functionality
         * player movement on keyboard events.
         * chopper movement of player.
         * game score based on player movement.
         */
        GamePlayScene.prototype.update = function () {
            if (this.isGameFinished) {
                return;
            }
            this.cameraY = Math.min(this.cameraY, this.player.y - DoodleJump.GameConfig.gameOptions.height + 430);
            if (this.player.y > this.cameraY + DoodleJump.GameConfig.gameOptions.height + 500) {
                this.GameOver();
                return;
            }
            /* track the maximum amount that the player has moved */
            /* player score is based on the movement */
            if (this.playerFirstBounce) {
                this.player.yChange = Math.max(this.player.yChange, Math.abs(this.player.y - this.player.yOrig));
                if (this.gameScoreText && this.player.yChange) {
                    this.gameScore = Math.floor(this.player.yChange);
                    this.gameScoreText.text = "SCORE: " + this.gameScore;
                }
                /* Dynamically change world bounds based on player pos */
                this.physics.world.setBounds(0, -this.player.yChange, this.physics.world.bounds.width, DoodleJump.GameConfig.gameOptions.height + this.player.yChange);
            }
            /* player keboard movement handled */
            if (this.playerMovement.left.isDown) {
                this.player.setVelocityX(DoodleJump.GameConfig.PLAYER_LEFT_VELOCITY);
            }
            else if (this.playerMovement.right.isDown) {
                this.player.setVelocityX(DoodleJump.GameConfig.PLAYER_RIGHT_VELOCITY);
            }
            else {
                this.player.setVelocityX(0);
            }
            /* player movement is handled on chopper collision */
            if (this.isChopperAdded) {
                this.player.setVelocityY(DoodleJump.GameConfig.CHOPPER_PLAYER_BOUNCE);
            }
            this.physics.world.wrap(this.player, this.player.width / 6);
            if (this.player.y < DoodleJump.GameConfig.gameOptions.height) {
                this.normalPlatform.children.iterate(this.addPlatform.bind(this));
                this.springGroup.children.iterate(this.removeSpring.bind(this));
                this.chopperGroup.children.iterate(this.removeChopper.bind(this));
                this.brokenPlatform.children.iterate(this.removeBrokenTile.bind(this));
            }
            else {
                this.GameOver();
            }
        };
        /**
         * funciton is called when player fall down.
         * all the game objects alpha set to 0 and destroyed.
         * Game over text and Score is showen with retry button.
         */
        GamePlayScene.prototype.GameOver = function () {
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
            this.gameScoreText.setPosition(DoodleJump.GameConfig.gameOptions.width / 2, DoodleJump.GameConfig.gameOptions.height - 350);
            this.gameScoreText.setFontSize(40);
            this.retryButton = this.add.image(DoodleJump.GameConfig.gameOptions.width / 2, DoodleJump.GameConfig.gameOptions.height / 2 + 80, 'retry').setOrigin(0.5, 0.5).setScale(0.2, 0.2);
            this.retryButton.setScrollFactor(0);
            this.retryButton.setInteractive({ useHandCursor: true });
            this.retryButton.on("pointerdown", this.onRetryButtonClicked.bind(this));
        };
        /**
         * function is called when retry button is clicked
         * the current scene gets stopped and the intro scene gets started.
         */
        GamePlayScene.prototype.onRetryButtonClicked = function () {
            this.scene.stop("Game");
            this.scene.start("Intro");
        };
        /**
         * function is called to remove the broken tile.
         * @param brokenTile
         */
        GamePlayScene.prototype.removeBrokenTile = function (brokenTile) {
            this.removeItem(brokenTile, this.brokenPlatform, this.brokenTilePositions);
        };
        /**
         * function is called to remove the chopper from screen.
         * @param chopper
         */
        GamePlayScene.prototype.removeChopper = function (chopper) {
            this.removeItem(chopper, this.chopperGroup, this.chopperPositions);
        };
        /**
         * function is called to remove the spring from the screen.
         * @param spring
         */
        GamePlayScene.prototype.removeSpring = function (spring) {
            this.removeItem(spring, this.springGroup, this.springPositions);
        };
        /**
         *  function is called to remove the different item from screen i.e spring/chopper/broken platform.
         *  when the item is moved bottom to screen, it will be removed from screen.
         * @param item
         * @param group
         * @param groupPosition
         */
        GamePlayScene.prototype.removeItem = function (item, group, groupPosition) {
            var index = group.children.entries.indexOf(item);
            if (index > -1) {
                item.y = groupPosition[index].y;
            }
            if (item &&
                item.y > this.cameraY + DoodleJump.GameConfig.gameOptions.height) {
                item.destroy();
                index != -1 && groupPosition.splice(index, 1);
            }
        };
        /**
         * function handled all the object addition i.e platform, spring, chopper based on the probablity.
         * also extra platform gets removed.
         * @param platform
         */
        GamePlayScene.prototype.addPlatform = function (platform) {
            // console.log(platform);
            var index = this.normalPlatform.children.entries.indexOf(platform);
            platform.y = this.platformPositions[index].y;
            if (!platform) {
                return;
            }
            var yPos = this.platformBaseY - 100;
            this.platformBaseY = Math.min(this.platformBaseY, platform.y);
            if (platform.y > this.cameraY + DoodleJump.GameConfig.gameOptions.height) {
                platform.destroy();
                this.platformPositions.splice(index, 1);
                var xPos = Phaser.Math.Between(100, this.physics.world.bounds.width - 100);
                var random = Math.floor(Math.random() * 10);
                if (random <= DoodleJump.GameConfig.NORMAL_PLATFORM_CHANCE) {
                    var tile = this.createStaticTiles(xPos, yPos, "baseBlue");
                    if (random < DoodleJump.GameConfig.SPRING_CHANCE) {
                        this.addSpring(xPos, yPos, "spring");
                    }
                    if (random >= DoodleJump.GameConfig.SPRING_CHANCE && random < (DoodleJump.GameConfig.SPRING_CHANCE + DoodleJump.GameConfig.CHOPPER_CHANCE)) {
                        if (!this.isChopperAdded) {
                            this.addChopper(xPos, yPos - 10, "chopper");
                        }
                    }
                }
                else {
                    this.createMovingTiles(xPos, yPos, "baseBlue");
                }
                if (random < DoodleJump.GameConfig.BROKEN_PLATFORM_CHANCE) {
                    if (xPos < DoodleJump.GameConfig.gameOptions.width / 2) {
                        xPos = xPos + 150;
                    }
                    else {
                        xPos = xPos - 150;
                    }
                    this.createBrokenTiles(xPos, yPos, "baseGreen");
                }
            }
        };
        /**
         * function will add broken tile to the broken platform group
         * @param x
         * @param y
         * @param type
         */
        GamePlayScene.prototype.createBrokenTiles = function (x, y, type) {
            this.brokenPlatform.create(x, y, type);
            this.brokenTilePositions.push({ x: x, y: y });
        };
        /**
         * function will add static tile to the normal platform group
         * @param x
         * @param y
         * @param type
         */
        GamePlayScene.prototype.createStaticTiles = function (x, y, type) {
            this.normalPlatform.create(x, y, type);
            this.platformPositions.push({ x: x, y: y });
        };
        /**
         * function will add moving tile to the normal platform group
         * @param x
         * @param y
         * @param type
         */
        GamePlayScene.prototype.createMovingTiles = function (x, y, type) {
            var tile = this.normalPlatform.create(x, y, type);
            tile.setVelocityX(120);
            tile.setBounceX(1);
            this.platformPositions.push({ x: x, y: y });
        };
        /**
         * function will add chopper to the chopper group
         * @param x
         * @param y
         * @param type
         */
        GamePlayScene.prototype.addChopper = function (x, y, type) {
            if (this.chopperGroup) {
                this.chopperGroup.create(x, y, type);
                this.chopperPositions.push({ x: x, y: y });
            }
        };
        /**
         * function will add spring to the spring group
         * @param x
         * @param y
         * @param type
         */
        GamePlayScene.prototype.addSpring = function (x, y, type) {
            if (this.springGroup) {
                this.springGroup.create(x, y, type).setOrigin(0, 1);
                this.springPositions.push({ x: x, y: y });
            }
        };
        return GamePlayScene;
    }(Phaser.Scene));
    DoodleJump.GamePlayScene = GamePlayScene;
})(DoodleJump || (DoodleJump = {}));
var DoodleJump;
(function (DoodleJump) {
    var IntroScene = /** @class */ (function (_super) {
        __extends(IntroScene, _super);
        function IntroScene() {
            return _super.call(this, "Intro") || this;
        }
        /**
         * preload funciton
         * used to load the assets.
         */
        IntroScene.prototype.preload = function () {
            this.load.image('start', 'assets/start.png');
        };
        /**
         * create funciton
         * display the assets on screen.
         * click event is added on start button;
         */
        IntroScene.prototype.create = function () {
            this.add.text(18, 150, "DOODLE JUMP GAME", { font: "35px Arial", align: "center" });
            this.start = this.add.image(200, 300, 'start').setOrigin(0.5, 0.5).setScale(0.2, 0.2);
            this.start.setInteractive({ useHandCursor: true });
            this.start.on("pointerdown", this.onStartButtonClicked.bind(this));
        };
        /**
         * Start button click event Handler.
         * function will start the Game state.
         */
        IntroScene.prototype.onStartButtonClicked = function () {
            this.scene.start('Game');
        };
        /**
         * update function.
         * currently left blank
         */
        IntroScene.prototype.update = function () {
        };
        return IntroScene;
    }(Phaser.Scene));
    DoodleJump.IntroScene = IntroScene;
})(DoodleJump || (DoodleJump = {}));
/// <reference path="GameConfig.ts" />
/// <reference path="GamePlayScene.ts" />
/// <reference path="IntroScene.ts" />
var DoodleJump;
/// <reference path="GameConfig.ts" />
/// <reference path="GamePlayScene.ts" />
/// <reference path="IntroScene.ts" />
(function (DoodleJump) {
    var config = {
        type: Phaser.AUTO,
        width: DoodleJump.GameConfig.gameOptions.width,
        height: DoodleJump.GameConfig.gameOptions.height,
        physics: {
            default: 'arcade',
            arcade: {
                // debug: true,
                gravity: {
                    y: DoodleJump.GameConfig.gameOptions.gravity,
                },
            },
        }
    };
    var Main = /** @class */ (function (_super) {
        __extends(Main, _super);
        function Main() {
            var _this = _super.call(this, config) || this;
            _this.scene.add('Intro', DoodleJump.IntroScene);
            _this.scene.add('Game', DoodleJump.GamePlayScene);
            _this.scene.start('Intro');
            return _this;
        }
        return Main;
    }(Phaser.Game));
    DoodleJump.Main = Main;
    DoodleJump.mainGame = new Main();
})(DoodleJump || (DoodleJump = {}));
//# sourceMappingURL=main.js.map