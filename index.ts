import Phaser from 'phaser';
import png_adam from './public/character/adam.png';
import json_adam from './public/character/adam.json';
import q1 from '/public/q1.html';
import q2 from '/public/q2.html';
import q3 from '/public/q3.html';
import q4 from '/public/q4.html';
import png_tile from '/public/modernexteriors-win/Modern_Exteriors_Complete_Tileset_48x48.png';
import json_test from '/public/tiles/remap.json';
import png_lucy from './public/character/lucy.png';
import json_lucy from './public/character/lucy.json';
import bench from '/public/chairs/Bench2.png';
import hidden_coupon from '/public/HiddenEvent/coupon.html';
import axios from 'axios';

// custom scene class
export class GameScene extends Phaser.Scene {
  public player!: Phaser.Physics.Arcade.Sprite;
  public cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  public userId!: string;
  public wallBG!: Phaser.Tilemaps.TilemapLayer;
  public wallFG!: Phaser.Tilemaps.TilemapLayer;
  public iscreated!: boolean;
  public iscreated2!: boolean;
  public iscreated3!: boolean;
  public coupon!: Phaser.Physics.Arcade.Image;
  public potal!: Phaser.Physics.Arcade.Image;
  public selectedValues: string[] = [];
  public single: integer[] = [];
  public multi: integer[] = [];
  public rpg: integer[] = [];
  public fps: integer[] = [];
  public action: integer[] = [];

  constructor() {
    super('game-scene');
  }

  preload() {
    // preload scene
    this.load.atlas('character', png_adam, json_adam);
    this.load.atlas('character2', png_lucy, json_lucy);
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.load.html('q1', q1);
    this.load.html('q2', q2);
    this.load.html('q3', q3);
    this.load.html('q4', q4);
    this.load.tilemapTiledJSON('testmap', json_test);
    this.load.image('tile', png_tile);
    this.load.image('bench', bench);
    this.load.html('coupon', hidden_coupon);
  }

  createSpeechBubble(x, y, width, height, quote) {
    const bubbleWidth = width;
    const bubbleHeight = height;
    const bubblePadding = 10;
    const arrowHeight = bubbleHeight / 4;

    const bubble = this.add.graphics({ x: x, y: y });

    //  Bubble shadow
    bubble.fillStyle(0x222222, 0.5);
    bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

    //  Bubble color
    bubble.fillStyle(0xffffff, 1);

    //  Bubble outline line style
    bubble.lineStyle(4, 0x565656, 1);

    //  Bubble shape and outline
    bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    //  Calculate arrow coordinates
    const point1X = Math.floor(bubbleWidth / 7);
    const point1Y = bubbleHeight;
    const point2X = Math.floor((bubbleWidth / 7) * 2);
    const point2Y = bubbleHeight;
    const point3X = Math.floor(bubbleWidth / 7);
    const point3Y = Math.floor(bubbleHeight + arrowHeight);

    //  Bubble arrow shadow
    bubble.lineStyle(4, 0x222222, 0.5);
    bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

    //  Bubble arrow fill
    bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
    bubble.lineStyle(2, 0x565656, 1);
    bubble.lineBetween(point2X, point2Y, point3X, point3Y);
    bubble.lineBetween(point1X, point1Y, point3X, point3Y);

    const content = this.add.text(0, 0, quote, {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#000000',
      align: 'center',
      wordWrap: { width: bubbleWidth - bubblePadding * 2 },
    });

    const b = content.getBounds();

    content.setPosition(
      bubble.x + bubbleWidth / 2 - b.width / 2,
      bubble.y + bubbleHeight / 2 - b.height / 2
    );
  }

  create() {
    const api_key = '3bad6ce02bbd4c3582a41d972f37338f';
    const base_url = 'https://api.rawg.io/api/';
    const endpoint = 'games';
    const resultsPerPage = 10;

    axios
      .get(
        `${base_url}${endpoint}?key=${api_key}&ordering=-recommendations_count&page_size=${resultsPerPage}&metacritic`
      )
      .then((response) => {
        console.log(response.data);
        for (var i = 0; i < 10; i++) {
          for (var j = 0; j < 10; j++) {
            if (response.data.results[i].tags[j].name == 'Singleplayer') {
              this.single.push(i);
            }
            if (response.data.results[i].tags[j].name == 'Multiplayer') {
              this.multi.push(i);
            }
            if (response.data.results[i].tags[j].name == 'RPG') {
              this.rpg.push(i);
            }
            if (response.data.results[i].tags[j].name == 'FPS') {
              this.fps.push(i);
            }
            if (response.data.results[i].tags[j].name == 'Action') {
              this.action.push(i);
            }
            console.log(
              '이름:' +
                response.data.results[i].slug +
                response.data.results[i].tags[j].name
            );
          }
        }

        console.log(this.single);
        console.log(this.multi);
        console.log(this.rpg);
        console.log(this.fps);
        console.log(this.action);
      })
      .catch((error) => {
        console.error('API 요청 중 오류 발생:', error);
      });

    const map = this.make.tilemap({ key: 'testmap' });
    const tile = map.addTilesetImage(
      'Modern_Exteriors_Complete_Tileset_48x48',
      'tile'
    );

    const ground = map.createLayer('ground', tile, 0, 0);
    const pathBG = map.createLayer('pathBG', tile, 0, 0);
    const pathFG = map.createLayer('pathFG', tile, 0, 0);
    this.wallBG = map.createLayer('wallBG', tile, 0, 0);
    this.wallFG = map.createLayer('wallFG', tile, 0, 0);
    const obj = map.createLayer('obj', tile, 0, 0);

    this.wallBG.setCollisionByProperty({ collides: true });
    this.wallFG.setCollisionByProperty({ collides: true });

    this.potal = [
      this.physics.add.sprite(700, 1540, 'bench'),
      this.physics.add.sprite(1150, 1540, 'bench'),
    ];

    this.coupon = [
      this.physics.add.sprite(700, 1840, 'bench'),
      this.physics.add.sprite(1150, 1840, 'bench'),
    ];

    const frameRate = 10;

    this.anims.create({
      key: 'idle_down2',
      frames: this.anims.generateFrameNames('character2', {
        prefix: 'Lucy_idle_anim_',
        start: 19,
        end: 24,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    this.anims.create({
      key: 'sit_down',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_sit_',
        start: 1,
        end: 1,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    this.anims.create({
      key: 'sit_left',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_sit_',
        start: 2,
        end: 2,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    this.anims.create({
      key: 'sit_right',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_sit_',
        start: 3,
        end: 3,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    this.anims.create({
      key: 'sit_up',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_sit_',
        start: 4,
        end: 4,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    // 아래로 걷는 모션
    this.anims.create({
      key: 'idle_down',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 19,
        end: 24,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    // 왼쪽으로 걷는 모션
    this.anims.create({
      key: 'idle_left',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 13,
        end: 18,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    // 오른쪽으로 걷는 모션
    this.anims.create({
      key: 'idle_right',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 1,
        end: 6,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    // 위로 걷는 모션
    this.anims.create({
      key: 'idle_up',
      frames: this.anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 7,
        end: 12,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    this.physics.add.sprite(20, 30, 'character', 'Adam_idle_anim_21.png');

    this.player = this.physics.add.sprite(
      913,
      4180,
      'character',
      'Adam_idle_anim_21.png'
    );

    this.physics.add
      .sprite(1100, 3100, 'character2')
      .anims.play('idle_down2', true);
    this.player.anims.play('idle_down', true);

    this.cameras.main.zoom = 1.0;
    this.iscreated = false;
    this.iscreated2 = false;
    this.iscreated3 = false;

    this.physics.add.collider(this.player, this.wallBG);
    this.physics.add.collider(this.player, this.wallFG);
  }

  check_genre() {
    const result: integer[] = [];
    console.log(this.selectedValues[0]);
    if (
      this.selectedValues[0] == 'Singleplayer' &&
      this.selectedValues[2] == 'FPS'
    ) {
      for (var i = 0; i < this.fps.length; i++) {
        if (this.single.includes(this.fps[i])) result.push(this.fps[i]);
      }
    }

    if (
      this.selectedValues[0] == 'multiplayer' &&
      this.selectedValues[2] == 'FPS'
    ) {
      for (var i = 0; i < this.fps.length; i++) {
        if (this.multi.includes(this.fps[i])) result.push(this.fps[i]);
      }
    }

    if (
      this.selectedValues[0] == 'Singleplayer' &&
      this.selectedValues[2] == 'RPG'
    ) {
      for (var i = 0; i < this.rpg.length; i++) {
        if (this.single.includes(this.rpg[i])) result.push(this.rpg[i]);
      }
    }

    if (
      this.selectedValues[0] == 'multiplayer' &&
      this.selectedValues[2] == 'RPG'
    ) {
      for (var i = 0; i < this.rpg.length; i++) {
        if (this.multi.includes(this.rpg[i])) result.push(this.rpg[i]);
      }
    }

    if (
      this.selectedValues[0] == 'Singleplayer' &&
      this.selectedValues[2] == 'Action'
    ) {
      for (var i = 0; i < this.action.length; i++) {
        if (this.single.includes(this.action[i])) result.push(this.action[i]);
      }
    }

    if (
      this.selectedValues[0] == 'multiplayer' &&
      this.selectedValues[2] == 'Action'
    ) {
      for (var i = 0; i < this.action.length; i++) {
        if (this.multi.includes(this.action[i])) result.push(this.action[i]);
      }
    }

    const element4 = this.add
      .dom(this.player.x - 750, this.player.y - 400)
      .createFromCache('q4');

    element4.setOrigin(0.8);
    element4.setScale(1);

    const api_key = '3bad6ce02bbd4c3582a41d972f37338f';
    const base_url = 'https://api.rawg.io/api/';
    const endpoint = 'games';
    const resultsPerPage = 10;

    axios
      .get(
        `${base_url}${endpoint}?key=${api_key}&ordering=-recommendations_count&page_size=${resultsPerPage}&metacritic`
      )
      .then((response) => {
        console.log(response.data);
        const games = response.data.results;

        const gameContainer = document.createElement('div');
        gameContainer.classList.add('game-container');

        for (var i = 0; i < Math.min(result.length, 9); i++) {
          const game = games[result[i]];

          const gameTitle = game.name;
          const gameImage = game.background_image;

          const gameItem = document.createElement('div');
          gameItem.classList.add('game-item');

          const imgElement = document.createElement('img');
          imgElement.src = gameImage;
          imgElement.alt = gameTitle;
          gameItem.appendChild(imgElement);

          const gameInfo = document.createElement('p');
          gameInfo.innerHTML = `<strong>${gameTitle}</strong>`;
          gameItem.appendChild(gameInfo);

          gameContainer.appendChild(gameItem);
        }

        element4.node.appendChild(gameContainer);
      })
      .catch((error) => {
        console.error('API 요청 중 오류 발생:', error);
      });
  }
  update(time: number, delta: number): void {
    // game loop
    // console.log(this.player.x);
    // console.log(this.player.y);
    if (this.player.y < 2300 && this.iscreated2 == false) {
      const element2 = this.add
        .dom(this.player.x, this.player.y)
        .createFromCache('q2');

      const button1 = document.createElement('button');
      button1.innerText = '짧게';
      button1.style.width = '100px';
      button1.style.height = '50px';
      button1.style.fontSize = '18px';
      element2.node.appendChild(button1);

      const button2 = document.createElement('button');
      button2.innerText = '길게';
      button2.style.width = '100px';
      button2.style.height = '50px';
      button2.style.fontSize = '18px';
      element2.node.appendChild(button2);

      button1.addEventListener('click', () => {
        //짧게 선택시
        element2.destroy();
        this.selectedValues.push('짧게');
        this.player.anims.play('idle_left', true);
        this.tweens.add({
          targets: this.player,
          x: 700,
          duration: 2000,
          hold: 500,
          repeatDelay: 500,
          ease: 'linear',
        });

        setTimeout(() => {
          this.player.anims.play('idle_up', true);
          this.tweens.add({
            targets: this.player,
            y: 1800,
            duration: 2000,
            hold: 2000,
            repeatDelay: 500,
            ease: 'linear',
          });
        }, 2000);

        setTimeout(() => {
          this.player.anims.play('sit_down', true);
          const element3 = this.add
            .dom(this.player.x, this.player.y)
            .createFromCache('q3');

          const button1 = document.createElement('button');
          button1.innerText = 'Action';
          button1.style.width = '100px';
          button1.style.height = '50px';
          button1.style.fontSize = '18px';
          element3.node.appendChild(button1);

          const button2 = document.createElement('button');
          button2.innerText = 'FPS';
          button2.style.width = '100px';
          button2.style.height = '50px';
          button2.style.fontSize = '18px';
          element3.node.appendChild(button2);

          const button3 = document.createElement('button');
          button3.innerText = 'RPG';
          button3.style.width = '100px';
          button3.style.height = '50px';
          button3.style.fontSize = '18px';
          element3.node.appendChild(button3);

          button1.addEventListener('click', () => {
            this.selectedValues.push('Action');
            this.check_genre();
          });

          button2.addEventListener('click', () => {
            this.selectedValues.push('FPS');
            this.check_genre();
          });

          button3.addEventListener('click', () => {
            this.selectedValues.push('RPG');
            this.check_genre();
          });
        }, 4000);
      });

      button2.addEventListener('click', () => {
        //길게 선택시
        element2.destroy();
        this.selectedValues.push('짧게');
        this.player.anims.play('idle_right', true);
        this.tweens.add({
          targets: this.player,
          x: 1150,
          duration: 2000,
          hold: 500,
          repeatDelay: 500,
          ease: 'linear',
        });

        setTimeout(() => {
          this.player.anims.play('idle_up', true);
          this.tweens.add({
            targets: this.player,
            y: 1800,
            duration: 2000,
            hold: 2000,
            repeatDelay: 500,
            ease: 'linear',
          });
        }, 2000);

        setTimeout(() => {
          this.player.anims.play('sit_down', true);
          const element3 = this.add
            .dom(this.player.x, this.player.y)
            .createFromCache('q3');

          const button1 = document.createElement('button');
          button1.innerText = 'Action';
          button1.style.width = '100px';
          button1.style.height = '50px';
          button1.style.fontSize = '18px';
          element3.node.appendChild(button1);

          const button2 = document.createElement('button');
          button2.innerText = 'FPS';
          button2.style.width = '100px';
          button2.style.height = '50px';
          button2.style.fontSize = '18px';
          element3.node.appendChild(button2);

          const button3 = document.createElement('button');
          button3.innerText = 'RPG';
          button3.style.width = '100px';
          button3.style.height = '50px';
          button3.style.fontSize = '18px';
          element3.node.appendChild(button3);

          button1.addEventListener('click', () => {
            this.selectedValues.push('Action');
            this.check_genre();
          });

          button2.addEventListener('click', () => {
            this.selectedValues.push('FPS');
            this.check_genre();
          });

          button3.addEventListener('click', () => {
            this.selectedValues.push('RPG');
            this.check_genre();
          });
        }, 4000);
      });

      this.iscreated2 = true;
    }

    if (this.player.y < 3600 && this.iscreated == false) {
      //첫번째 질문 구현
      const element1 = this.add
        .dom(this.player.x, this.player.y)
        .createFromCache('q1');

      const button1 = document.createElement('button');
      button1.innerText = 'Singleplayer가좋아';
      button1.style.width = '150px';
      button1.style.height = '50px';
      button1.style.fontSize = '18px';
      element1.node.appendChild(button1);

      const button2 = document.createElement('button');
      button2.innerText = '게임은multiplayer';
      button2.style.width = '150px';
      button2.style.height = '50px';
      button2.style.fontSize = '18px';
      element1.node.appendChild(button2);

      button1.addEventListener('click', () => {
        //Singleplayer선택시
        element1.destroy();
        this.selectedValues.push('Singleplayer');
        this.player.anims.play('idle_left', true);
        this.tweens.add({
          targets: this.player,
          x: 700,
          duration: 2000,
          hold: 500,
          repeatDelay: 500,
          ease: 'linear',
        });

        setTimeout(() => {
          this.player.anims.play('idle_up', true);
          this.tweens.add({
            targets: this.player,
            y: 3200,
            duration: 2000,
            hold: 2000,
            repeatDelay: 500,
            ease: 'linear',
          });
        }, 2000);
      });

      button2.addEventListener('click', () => {
        //게임은 multiplayer 선택시
        element1.destroy();
        this.selectedValues.push('multiplayer');
        this.player.anims.play('idle_right', true);
        this.tweens.add({
          targets: this.player,
          x: 1150,
          duration: 2000,
          hold: 500,
          repeatDelay: 500,
          ease: 'linear',
        });

        setTimeout(() => {
          this.player.anims.play('idle_up', true);
          this.tweens.add({
            targets: this.player,
            y: 3200,
            duration: 2000,
            hold: 2000,
            repeatDelay: 500,
            ease: 'linear',
          });
          this.createSpeechBubble(1050, 2950, 250, 100, '“반가워”');
        }, 2000);
      });
      this.iscreated = true;
    }
    localStorage.setItem('selectedValues', JSON.stringify(this.selectedValues));
    this.cameras.main.startFollow(this.player, true);
    if (this.cursorKeys.up.isDown && this.cursorKeys.right.isDown) {
      this.player.setVelocityY(-100);
      this.player.anims.play('idle_right', true);
    } else if (this.cursorKeys.down.isDown && this.cursorKeys.right.isDown) {
      this.player.setVelocityY(100);
      this.player.anims.play('idle_right', true);
    } else if (this.cursorKeys.up.isDown && this.cursorKeys.left.isDown) {
      this.player.setVelocityY(-100);
      this.player.anims.play('idle_left', true);
    } else if (this.cursorKeys.down.isDown && this.cursorKeys.left.isDown) {
      this.player.setVelocityY(100);
      this.player.anims.play('idle_left', true);
    } else if (this.cursorKeys.up.isDown) {
      this.player.setVelocityY(-600);
      this.player.anims.play('idle_up', true);
    } else if (this.cursorKeys.down.isDown) {
      this.player.setVelocityY(200);
      this.player.anims.play('idle_down', true);
    } else {
      this.player.setVelocityY(0);
    }
    if (this.cursorKeys.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play('idle_left', true);
    } else if (this.cursorKeys.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play('idle_right', true);
    } else {
      this.player.setVelocityX(0);
    }

    const checkDownKey = (key) =>
      this.input.keyboard?.checkDown(this.input.keyboard.addKey(key), 99999);

    this.physics.add.overlap(this.player, this.coupon, () => {
      if (checkDownKey('E')) {
        // this.player.setPosition(200,200);
        const element1 = this.add
          .dom(this.player.x + 50, this.player.y + 50)
          .createFromCache('coupon');
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.style.position = 'absolute';
        deleteButton.style.top = '30px';
        deleteButton.style.right = '10px';
        deleteButton.style.fontSize = '20px';
        deleteButton.style.cursor = 'pointer';
        element1.node.appendChild(deleteButton);
        deleteButton.addEventListener('click', () => {
          element1.destroy();
        });
      }
    });

    this.physics.add.overlap(this.player, this.potal, () => {
      if (checkDownKey('E')) {
        this.player.setPosition(200, 200);
      }
    });
  }
}

// game config
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  backgroundColor: '#b6d53c',
  parent: 'phaser-example',
  physics: { default: 'arcade' },
  pixelArt: true,
  dom: {
    createContainer: true,
  },
  scene: [GameScene],
};

// instantiate the game
const game = new Phaser.Game(config);
