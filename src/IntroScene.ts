namespace DoodleJump {

  export class IntroScene extends Phaser.Scene {
    private start?: Phaser.GameObjects.Image;

    constructor(){
      super("Intro");
    }

    /**
     * preload funciton
     * used to load the assets.
     */
    preload(){
      this.load.image('start', 'assets/start.png')
    }

    /**
     * create funciton
     * display the assets on screen.
     * click event is added on start button;
     */
    create(){
      this.add.text(18,150,"DOODLE JUMP GAME",{ font: "35px Arial", align: "center" });
      this.start = this.add.image(200, 300, 'start').setOrigin(0.5,0.5).setScale(0.2,0.2);
      this.start.setInteractive({ useHandCursor: true });
      this.start.on("pointerdown", this.onStartButtonClicked.bind(this));
    }

    /**
     * Start button click event Handler.
     * function will start the Game state.
     */
    onStartButtonClicked(){
      this.scene.start('Game');
    }

    /**
     * update function.
     * currently left blank
     */
    update(){

    }
  }
}
