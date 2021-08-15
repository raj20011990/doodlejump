/// <reference path="GameConfig.ts" />
/// <reference path="GamePlayScene.ts" />
/// <reference path="IntroScene.ts" />

namespace DoodleJump {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GameConfig.gameOptions.width,
    height: GameConfig.gameOptions.height,
    physics: {
      default: 'arcade',
      arcade: {
       // debug: true,
        gravity: {
          y: GameConfig.gameOptions.gravity,
        },
        
      },
    }
  };
  export class Main extends Phaser.Game {
    constructor(){
         super(config);
         this.scene.add('Intro', IntroScene);
         this.scene.add('Game', GamePlayScene);
         this.scene.start('Intro');
    }
  }
  export let mainGame = new Main();
}
