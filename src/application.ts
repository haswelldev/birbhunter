import * as PIXI from 'pixi.js';
import { injectable, inject } from 'inversify';
import { ModelCreator } from './service/ModelCreator';
import { SoundBoard } from './service/SoundBoard';
import { Types } from './types';
import { PixiHolder } from './service/PixiHolder';
import { InfoDisplay } from './service/InfoDisplay';
import { StartGameScreen } from './models/StartGameScreen';
import { EndGameScreen } from './models/EndGameScreen';
import { Birb } from './models/Birb';

const random = {
    int: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    float: (min: number, max: number) => Math.random() * (max - min) + min
};

@injectable()
export class Application {
    private app: PIXI.Application;
    private birbs: Birb[] = [];
    private birbBounds: PIXI.Rectangle;
    private birbBoundsPadding: number = 100;
    private intervals: any[] = [];
    private timeStopped: boolean = false;
    private gamePaused: boolean = false;
    private moveSpeed: number;
    private animationSpeed: number;
    private startGameScreen: StartGameScreen;
    private endGameScreen: EndGameScreen;
    private stopTimeClock: PIXI.Sprite;

    @inject(Types.ModelCreator) private modelCreator: ModelCreator;
    @inject(Types.SoundBoard) private soundBoard: SoundBoard;
    @inject(Types.Info) private info: InfoDisplay;

    constructor(
        @inject(Types.Pixi) pixiHolder: PixiHolder
    ) {
        this.app = pixiHolder.app;
    }

    private tickerCallback = () => {
        this.birbs.forEach((birb, index) => this.birbTickHandler(birb, index));
    };

    public run(): void {
        // screen.orientation.lock('landscape'); // Cordova plugin
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.birbBounds = new PIXI.Rectangle(
            -this.birbBoundsPadding,
            -this.birbBoundsPadding,
            this.app.screen.width + this.birbBoundsPadding * 2,
            this.app.screen.height + this.birbBoundsPadding * 2
        );

        const background = new PIXI.Sprite(PIXI.Texture.from('assets/background.jpg'));
        background.width = window.innerWidth;
        background.height = window.innerHeight;

        console.log('Initializing screens...');
        this.startGameScreen = new StartGameScreen(window.innerWidth, window.innerHeight);
        console.log('StartGameScreen initialized');
        this.endGameScreen = new EndGameScreen(window.innerWidth, window.innerHeight);
        console.log('EndGameScreen initialized');

        this.app.stage.addChild(background);
        document.body.appendChild((this.app.view || (this.app as any).canvas) as HTMLCanvasElement);

        this.stopTimeClock = new PIXI.Sprite(PIXI.Texture.from('assets/images/clock.png'));
        this.stopTimeClock.anchor.set(0.5);
        this.stopTimeClock.scale.set(0.1);
        this.stopTimeClock.interactive = true;
        this.stopTimeClock.cursor = 'pointer';
        this.stopTimeClock.x = window.innerWidth / 2;
        this.stopTimeClock.y = window.innerHeight - (window.innerHeight * 13.5 / 100);

        this.app.stage.addChild(this.startGameScreen);

        this.stopTimeClock.on('mousedown', this.stopTime.bind(this));
        this.stopTimeClock.on('touchstart', this.stopTime.bind(this));
        this.startGameScreen.on('mousedown', this.init.bind(this));
        this.startGameScreen.on('touchstart', this.init.bind(this));
        this.endGameScreen.on('mousedown', this.init.bind(this));
        this.endGameScreen.on('touchstart', this.init.bind(this));

        document.onvisibilitychange = this.onVisibilityChange.bind(this);
    }

    private onVisibilityChange(): void {
        if (document.hidden) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }

    private pauseGame(): void {
        this.gamePaused = true;
        this.app.ticker.stop();
        this.soundBoard.pauseBackgroundMusic();
    }

    private resumeGame(): void {
        this.gamePaused = false;
        this.app.ticker.start();
        this.soundBoard.resumeBackgroundMusic();
    }

    private stopTime(): void {
        if (this.timeStopped) {
            return;
        }
        this.timeStopped = true;
        this.app.stage.removeChild(this.stopTimeClock);
        this.soundBoard.muffSounds();

        const oldSpeed = this.moveSpeed;
        const oldAnimationSpeed = 0.5;

        this.moveSpeed = 2;
        this.animationSpeed = 0.2;

        this.birbs.forEach(b => {
            b.turningSpeed = 0;
            b.speed = 2;
            b.sprite.animationSpeed = 0.2;
        });

        this.intervals.push(setTimeout(() => {
            this.resumeTime(oldSpeed, oldAnimationSpeed);
        }, 4000));
    }

    private resumeTime(speed: number, animationSpeed: number): void {
        this.timeStopped = false;
        this.soundBoard.unmuffSounds();
        this.moveSpeed = speed;
        this.animationSpeed = animationSpeed;
        this.birbs.forEach(b => {
            b.speed = speed;
            b.sprite.animationSpeed = animationSpeed;
        });
    }

    private init(): void {
        this.moveSpeed = 4;
        this.animationSpeed = 0.5;
        this.timeStopped = false;
        this.gamePaused = false;

        this.soundBoard.playBackgroundMusic();

        this.intervals.push(setInterval(() => {
            if (this.gamePaused) {
                return;
            }
            this.moveSpeed += 0.1;
        }, 4000));

        this.intervals.push(setInterval(this.createBirb.bind(this), 3000));

        this.intervals.push(setInterval(() => {
            if (this.gamePaused) {
                return;
            }
            this.intervals.push(setInterval(this.createBirb.bind(this), random.int(3000, 30000)));
        }, 10000));

        this.app.ticker.add(this.tickerCallback);
        this.info.init(this.app);

        this.app.stage.removeChild(this.startGameScreen);
        this.app.stage.removeChild(this.endGameScreen);
    }

    private clear(): void {
        this.intervals.forEach(clearInterval);
        this.app.ticker.remove(this.tickerCallback);
        this.birbs.forEach(birb => {
            if (birb && birb.sprite) {
                this.app.stage.removeChild(birb.sprite);
            }
        });
        this.birbs = [];
        this.intervals = [];
        this.info.clear(this.app);
        this.app.stage.removeChild(this.stopTimeClock);
        this.soundBoard.stopBackgroundMusic();
        this.soundBoard.unmuffSounds();
    }

    private createBirb(): void {
        if (this.gamePaused) {
            return;
        }
        const birb = this.modelCreator.createBirb();
        birb.sprite.anchor.set(0.5);
        birb.sprite.scale.set(0.2);
        birb.sprite.x = 0;
        birb.sprite.y = random.int(100, window.innerHeight - 100);
        birb.direction = Math.PI * 0.5;
        birb.turningSpeed = random.float(-0.1, 0.1);
        birb.speed = this.moveSpeed;
        birb.sprite.animationSpeed = this.animationSpeed;
        birb.sprite.play();
        this.birbs.push(birb);

        birb.sprite.cursor = 'pointer';
        birb.sprite.interactive = true;

        const handler = this.birbClickHandler.bind(this);
        const callback = function(this: PIXI.Sprite) {
            handler(this);
        };

        birb.sprite.on('mousedown', callback);
        birb.sprite.on('touchstart', callback);

        this.app.stage.addChild(birb.sprite);
    }

    private birbClickHandler(sprite: PIXI.Sprite): void {
        const birb = this.birbs.filter(b => b && b.sprite === sprite)[0];
        if (birb) {
            this.explodeBirb(birb);
        }
    }

    private explodeBirb(birb: Birb): void {
        const index = this.birbs.indexOf(birb);
        const explosion = this.modelCreator.createExplosion();
        explosion.sprite.anchor.set(0.5);
        explosion.sprite.scale.set(0.2);
        explosion.sprite.x = birb.sprite.x;
        explosion.sprite.y = birb.sprite.y;
        explosion.sprite.loop = false;
        explosion.sprite.onComplete = () => {
            this.app.stage.removeChild(explosion.sprite);
        };
        this.app.stage.addChild(explosion.sprite);
        explosion.sprite.play();

        this.soundBoard.playPewSound();
        this.info.incrementScore();

        if (this.info.score % 10 === 0) {
            this.info.incrementLives();
        }

        if (this.info.score % 30 === 0) {
            if (this.app.stage.children.indexOf(this.stopTimeClock) === -1) {
                this.app.stage.addChild(this.stopTimeClock);
            }
        }

        this.app.stage.removeChild(birb.sprite);
        delete this.birbs[index];
    }

    private birbTickHandler(birb: Birb, index: number): void {
        if (!birb) return;

        if (birb.sprite.x <= window.innerWidth) {
            birb.sprite.x += Math.sin(birb.direction) * birb.speed;
        } else {
            this.soundBoard.playDamageSound();
            this.info.decrementLives();
            this.app.stage.removeChild(birb.sprite);
            delete this.birbs[index];

            if (this.info.lives <= 0) {
                const score = this.info.score;
                this.clear();
                this.onGameEnd(score);
            }
            return;
        }

        birb.sprite.y += Math.cos(birb.direction) * birb.speed;

        if (birb.sprite.x < this.birbBounds.x) {
            birb.sprite.x += this.birbBounds.width;
        } else if (birb.sprite.x > this.birbBounds.x + this.birbBounds.width) {
            birb.sprite.x -= this.birbBounds.width;
        }

        if (birb.sprite.y < this.birbBounds.y) {
            birb.sprite.y += this.birbBounds.height;
        } else if (birb.sprite.y > this.birbBounds.y + this.birbBounds.height) {
            birb.sprite.y -= this.birbBounds.height;
        }
    }

    private onGameEnd(score: number): void {
        this.app.stage.addChild(this.endGameScreen);
        this.endGameScreen.setScore(score);
    }
}
