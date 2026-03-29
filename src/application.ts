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
import { DIFFICULTY_CONFIG, DifficultySettings } from './config/DifficultyConfig';

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
    private stopTimeCharges: number = 0;
    private stopTimeText: PIXI.Text;
    private menuButton: PIXI.Text;
    private gameStarted: boolean = false;
    private autoPaused: boolean = false;
    private highScore: number = 0;
    private difficultySettings: DifficultySettings;

    @inject(Types.ModelCreator) private modelCreator: ModelCreator;
    @inject(Types.SoundBoard) private soundBoard: SoundBoard;
    @inject(Types.Info) private info: InfoDisplay;

    constructor(
        @inject(Types.Pixi) pixiHolder: PixiHolder
    ) {
        this.app = pixiHolder.app;
    }

    private tickerCallback = () => {
        if (this.gamePaused) return;
        this.birbs.forEach((birb, index) => this.birbTickHandler(birb, index));
    };

    public run(): void {
        this.highScore = parseInt(localStorage.getItem('highScore') || '0');
        // screen.orientation.lock('landscape'); // Cordova plugin
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.birbBounds = new PIXI.Rectangle(
            -this.birbBoundsPadding,
            -this.birbBoundsPadding,
            this.app.screen.width + this.birbBoundsPadding * 2,
            this.app.screen.height + this.birbBoundsPadding * 2
        );

        const backgrounds = [
            'assets/backgrounds/background_0.jpg',
            'assets/backgrounds/background_1.jpg',
        ];
        const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        const background = new PIXI.Sprite(PIXI.Texture.from(randomBackground));
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

        this.stopTimeText = new PIXI.Text('x0', {
            fontSize: 18,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 2
        });
        this.stopTimeText.anchor.set(0.5);
        this.stopTimeText.x = this.stopTimeClock.x + 20;
        this.stopTimeText.y = this.stopTimeClock.y + 20;

        this.menuButton = new PIXI.Text('Menu', { fontSize: 24, fill: 0xffffff });
        this.menuButton.x = 20;
        this.menuButton.y = 20;
        this.menuButton.interactive = true;
        this.menuButton.cursor = 'pointer';
        this.menuButton.on('pointerdown', (e) => {
            e.stopPropagation();
            this.togglePause();
        });

        this.app.stage.addChild(this.menuButton);
        this.menuButton.visible = false;
        this.app.stage.addChild(this.startGameScreen);

        this.startGameScreen.setVolumes(this.soundBoard.getBackgroundVolume(), this.soundBoard.getSFXVolume());

        this.stopTimeClock.on('pointerdown', this.stopTime.bind(this));

        this.startGameScreen.onStartGame = () => {
            if (this.gameStarted) {
                this.togglePause();
            } else {
                this.init();
            }
        };

        this.startGameScreen.onStartNewGame = () => {
            this.clear();
            this.init();
        };

        this.endGameScreen.onStartNewGame = () => {
            this.app.stage.removeChild(this.endGameScreen);
            this.clear();
            this.init();
        };

        this.endGameScreen.onShowSettings = () => {
            this.app.stage.removeChild(this.endGameScreen);
            this.app.stage.addChild(this.startGameScreen);
            this.startGameScreen.setResume(false);
            // Show settings menu in StartGameScreen
            (this.startGameScreen as any)._mainMenu.visible = false;
            (this.startGameScreen as any)._settingsMenu.visible = true;
        };

        this.startGameScreen.onVolumeChange = (type, volume) => {
            if (type === 'bg') {
                this.soundBoard.setBackgroundVolume(volume);
            } else {
                this.soundBoard.setSFXVolume(volume);
            }
        };

        this.startGameScreen.onDifficultyChange = (difficulty) => {
            console.log(`Difficulty changed to ${difficulty}`);
        };

        document.onvisibilitychange = this.onVisibilityChange.bind(this);
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.togglePause();
            }
            if (e.code === 'Space') {
                if (this.stopTimeClock.parent) {
                    this.stopTime();
                }
            }
        });

        this.app.ticker.add((delta) => {
            if (this.stopTimeClock.parent) {
                const scale = 0.1 + Math.sin(Date.now() / 200) * 0.01;
                this.stopTimeClock.scale.set(scale);
            }
        });
    }

    private togglePause(): void {
        if (!this.gameStarted) return;
        if (this.gamePaused) {
            this.resumeGame();
            this.menuButton.visible = true;
            this.app.stage.removeChild(this.startGameScreen);
        } else {
            this.pauseGame();
            this.menuButton.visible = false;
            this.startGameScreen.setResume(true);
            this.app.stage.addChild(this.startGameScreen);
            this.app.stage.setChildIndex(this.menuButton, this.app.stage.children.length - 1);
        }
    }

    private onVisibilityChange(): void {
        if (!this.gameStarted) return;

        if (document.hidden) {
            if (!this.gamePaused) {
                this.pauseGame();
                this.autoPaused = true;
            }
        } else {
            if (this.autoPaused) {
                this.resumeGame();
                this.autoPaused = false;
            }
        }
    }

    private pauseGame(): void {
        this.gamePaused = true;
        this.soundBoard.pauseBackgroundMusic();
    }

    private resumeGame(): void {
        this.gamePaused = false;
        this.soundBoard.resumeBackgroundMusic();
    }

    private stopTime(): void {
        if (this.timeStopped || this.stopTimeCharges <= 0) {
            return;
        }
        this.timeStopped = true;
        this.stopTimeCharges--;
        this.stopTimeText.text = `x${this.stopTimeCharges}`;

        if (this.stopTimeCharges <= 0) {
            this.app.stage.removeChild(this.stopTimeClock);
            this.app.stage.removeChild(this.stopTimeText);
        }

        this.soundBoard.muffSounds();

        const oldSpeed = this.moveSpeed;
        const oldAnimationSpeed = 0.5;

        this.moveSpeed = 2;
        this.animationSpeed = 0.2;

        this.birbs.forEach(b => {
            if (b) {
                b.turningSpeed = 0;
                b.speed = 2;
                b.sprite.animationSpeed = 0.2;
            }
        });

        this.intervals.push(setTimeout(() => {
            this.resumeTime(oldSpeed, oldAnimationSpeed);
        }, this.difficultySettings.timeStopDuration));
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
        if (this.gameStarted && !this.gamePaused) return;
        this.gameStarted = true;
        this.menuButton.visible = true;
        this.app.stage.removeChild(this.startGameScreen);

        this.difficultySettings = DIFFICULTY_CONFIG[this.startGameScreen.selectedDifficulty];
        this.moveSpeed = this.difficultySettings.initialMoveSpeed;
        this.animationSpeed = 0.5;
        this.timeStopped = false;
        this.stopTimeCharges = 0;
        this.stopTimeText.text = `x${this.stopTimeCharges}`;
        this.gamePaused = false;

        this.soundBoard.startNewGameMusic();

        this.intervals.push(setInterval(() => {
            if (this.gamePaused) {
                return;
            }
            this.moveSpeed += this.difficultySettings.speedIncrement;
        }, this.difficultySettings.speedIncrementInterval));

        this.intervals.push(setInterval(this.createBirb.bind(this), this.difficultySettings.initialSpawnInterval));

        this.intervals.push(setInterval(() => {
            if (this.gamePaused) {
                return;
            }
            this.intervals.push(setTimeout(this.createBirb.bind(this), random.int(this.difficultySettings.extraSpawnIntervalRange[0], this.difficultySettings.extraSpawnIntervalRange[1])));
        }, this.difficultySettings.extraSpawnInterval));

        this.app.ticker.add(this.tickerCallback);
        this.info.init(this.app);

        this.app.stage.removeChild(this.startGameScreen);
        this.app.stage.removeChild(this.endGameScreen);
    }

    private clear(): void {
        this.gameStarted = false;
        this.startGameScreen.setResume(false);
        this.app.stage.addChild(this.startGameScreen);
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
        this.app.stage.removeChild(this.stopTimeText);
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

        if (this.info.score % this.difficultySettings.extraHealthThreshold === 0) {
            this.info.incrementLives();
            this.info.showMessage(`${this.info.score} birbs down, +1 extra health.`);
        }

        if (this.info.score % this.difficultySettings.timeStopThreshold === 0) {
            this.stopTimeCharges++;
            this.stopTimeText.text = `x${this.stopTimeCharges}`;
            if (!this.stopTimeClock.parent) {
                this.app.stage.addChild(this.stopTimeClock);
                this.app.stage.addChild(this.stopTimeText);
            }
            this.info.showTimeStopNotification();
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
            this.info.showMessage("-1 Health. Birb got trough");
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
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('highScore', this.highScore.toString());
        }
        this.endGameScreen.setScore(score, this.highScore);
        this.app.stage.addChild(this.endGameScreen);
    }
}
