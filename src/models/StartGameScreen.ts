import * as PIXI from 'pixi.js';
import { Difficulty } from '../config/DifficultyConfig';

export class StartGameScreen extends PIXI.Container {
    private _bg: PIXI.Graphics;
    private _mainMenu: PIXI.Container;
    private _settingsMenu: PIXI.Container;
    private _startButton: PIXI.Text;
    private _settingsButton: PIXI.Text;
    private _startNewGameButton: PIXI.Text;
    private _isResume: boolean = false;

    private _bgMusicSlider: PIXI.Container;
    private _sfxSlider: PIXI.Container;
    private _difficultyButtons: PIXI.Container;
    private _selectedDifficulty: Difficulty = Difficulty.MEDIUM;

    public onStartGame: () => void;
    public onStartNewGame: () => void;
    public onVolumeChange: (type: 'bg' | 'sfx', volume: number) => void;
    public onDifficultyChange: (difficulty: Difficulty) => void;

    constructor(width: number, height: number) {
        super();
        this.loadSettings();
        this._bg = new PIXI.Graphics();
        this._bg.beginFill(0x000, 0.8);
        this._bg.drawRect(0, 0, width, height);
        this._bg.endFill();
        this._bg.interactive = true;
        this.addChild(this._bg);

        this._mainMenu = new PIXI.Container();
        this._settingsMenu = new PIXI.Container();
        this._settingsMenu.visible = false;

        this.addChild(this._mainMenu);
        this.addChild(this._settingsMenu);

        this.initMainMenu(width, height);
        this.initSettingsMenu(width, height);
        this.setVolumes(0.25, 0.3); // Default values, will be overridden by Application.run() if SoundBoard has other values
    }

    public get selectedDifficulty(): Difficulty {
        return this._selectedDifficulty;
    }

    public setResume(isResume: boolean) {
        this._isResume = isResume;
        this._startButton.text = isResume ? '[Resume Game]' : '[Start Game]';
        this._startNewGameButton.visible = isResume;
    }

    private loadSettings(): void {
        const savedDiff = localStorage.getItem('difficulty');
        if (savedDiff && Object.values(Difficulty).includes(savedDiff as Difficulty)) {
            this._selectedDifficulty = savedDiff as Difficulty;
        }
    }

    private saveSettings(): void {
        localStorage.setItem('difficulty', this._selectedDifficulty);
    }

    private initMainMenu(width: number, height: number) {
        const title = new PIXI.Text('BirbHunter', {
            fontSize: 64,
            fill: 0xf4634e,
            align: 'center'
        });
        title.anchor.set(0.5);
        title.x = width / 2;
        title.y = height * 0.25;
        this._mainMenu.addChild(title);

        this._startButton = new PIXI.Text('[Start Game]', {
            fontSize: 42,
            fill: 0xffffff,
            align: 'center'
        });
        this._startButton.anchor.set(0.5);
        this._startButton.x = width / 2;
        this._startButton.y = height * 0.45;
        this._startButton.interactive = true;
        this._startButton.cursor = 'pointer';
        this._startButton.on('pointerdown', () => {
            if (this.onStartGame) this.onStartGame();
        });
        this._mainMenu.addChild(this._startButton);

        this._startNewGameButton = new PIXI.Text('[Start New Game]', {
            fontSize: 42,
            fill: 0xffffff,
            align: 'center'
        });
        this._startNewGameButton.anchor.set(0.5);
        this._startNewGameButton.x = width / 2;
        this._startNewGameButton.y = height * 0.58;
        this._startNewGameButton.interactive = true;
        this._startNewGameButton.cursor = 'pointer';
        this._startNewGameButton.visible = false;
        this._startNewGameButton.on('pointerdown', () => {
            if (this.onStartNewGame) this.onStartNewGame();
        });
        this._mainMenu.addChild(this._startNewGameButton);

        this._settingsButton = new PIXI.Text('[Settings]', {
            fontSize: 42,
            fill: 0xffffff,
            align: 'center'
        });
        this._settingsButton.anchor.set(0.5);
        this._settingsButton.x = width / 2;
        this._settingsButton.y = height * 0.71;
        this._settingsButton.interactive = true;
        this._settingsButton.cursor = 'pointer';
        this._settingsButton.on('pointerdown', () => {
            this._mainMenu.visible = false;
            this._settingsMenu.visible = true;
        });
        this._mainMenu.addChild(this._settingsButton);
    }

    public setVolumes(bg: number, sfx: number): void {
        this.updateSliderValue(this._bgMusicSlider, bg);
        this.updateSliderValue(this._sfxSlider, sfx);
    }

    private updateSliderValue(slider: PIXI.Container, value: number): void {
        const handle = slider.getChildByName('handle') as PIXI.Graphics;
        if (handle) {
            const sliderWidth = 300;
            handle.x = (value - 0.5) * sliderWidth;
        }
    }

    private initSettingsMenu(width: number, height: number) {
        const title = new PIXI.Text('Settings', {
            fontSize: 64,
            fill: 0xf4634e,
            align: 'center'
        });
        title.anchor.set(0.5);
        title.x = width / 2;
        title.y = height * 0.15;
        this._settingsMenu.addChild(title);

        this._bgMusicSlider = this.createSlider('Background Music', width / 2, height * 0.3, (v) => {
             if (this.onVolumeChange) this.onVolumeChange('bg', v);
        });
        this._settingsMenu.addChild(this._bgMusicSlider);

        this._sfxSlider = this.createSlider('Sound Effects', width / 2, height * 0.45, (v) => {
            if (this.onVolumeChange) this.onVolumeChange('sfx', v);
        });
        this._settingsMenu.addChild(this._sfxSlider);

        this._difficultyButtons = new PIXI.Container();
        this._difficultyButtons.x = width / 2;
        this._difficultyButtons.y = height * 0.65;
        this._settingsMenu.addChild(this._difficultyButtons);

        const diffLabel = new PIXI.Text('Difficulty', { fontSize: 24, fill: 0xffffff });
        diffLabel.anchor.set(0.5, 1);
        diffLabel.y = -30;
        this._difficultyButtons.addChild(diffLabel);

        const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.NIGHTMARE];
        difficulties.forEach((diff, index) => {
            const btn = new PIXI.Text(`[${diff}]`, { fontSize: 28, fill: 0xffffff });
            btn.anchor.set(0.5);
            btn.x = (index - 1.5) * 150;
            btn.interactive = true;
            btn.cursor = 'pointer';
            btn.on('pointerdown', () => {
                this._selectedDifficulty = diff;
                this.updateDifficultyButtons();
                this.saveSettings();
                if (this.onDifficultyChange) this.onDifficultyChange(diff);
            });
            this._difficultyButtons.addChild(btn);
        });
        this.updateDifficultyButtons();

        const backButton = new PIXI.Text('[Back]', {
            fontSize: 42,
            fill: 0xffffff,
            align: 'center'
        });
        backButton.anchor.set(0.5);
        backButton.x = width / 2;
        backButton.y = height * 0.85;
        backButton.interactive = true;
        backButton.cursor = 'pointer';
        backButton.on('pointerdown', () => {
            this._settingsMenu.visible = false;
            this._mainMenu.visible = true;
        });
        this._settingsMenu.addChild(backButton);
    }

    private updateDifficultyButtons() {
        this._difficultyButtons.children.forEach((child) => {
            if (child instanceof PIXI.Text && child.text.startsWith('[')) {
                const diffValue = child.text.substring(1, child.text.length - 1) as Difficulty;
                if (diffValue === this._selectedDifficulty) {
                    child.style.fill = 0xf4634e;
                } else {
                    child.style.fill = 0xffffff;
                }
            }
        });
    }

    private createSlider(label: string, x: number, y: number, onChange: (value: number) => void): PIXI.Container {
        const container = new PIXI.Container();
        container.name = label;
        container.x = x;
        container.y = y;

        const text = new PIXI.Text(label, { fontSize: 24, fill: 0xffffff });
        text.anchor.set(0.5, 1);
        text.y = -20;
        container.addChild(text);

        const handle = new PIXI.Graphics();
        handle.name = 'handle';
        handle.beginFill(0xffffff);
        handle.drawCircle(0, 0, 15);
        handle.endFill();
        handle.interactive = true;
        handle.cursor = 'pointer';
        container.addChild(handle);

        const sliderWidth = 300;
        const sliderHeight = 10;
        const bg = new PIXI.Graphics();
        bg.beginFill(0x444444);
        bg.drawRect(-sliderWidth / 2, -sliderHeight / 2, sliderWidth, sliderHeight);
        bg.endFill();
        bg.interactive = true;
        bg.cursor = 'pointer';
        container.addChildAt(bg, 0);

        // Initial position will be set via setVolumes later
        let value = 0;
        handle.x = (value - 0.5) * sliderWidth;

        let dragging = false;

        const startDragging = (e: any) => {
            dragging = true;
            this.updateSlider(e, container, handle, sliderWidth, onChange);
        };

        const onPointerMove = (e: any) => {
            if (dragging) {
                this.updateSlider(e, container, handle, sliderWidth, onChange);
            }
        };

        const onPointerUp = () => {
            if (dragging) {
                dragging = false;
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            }
        };

        handle.on('pointerdown', startDragging);
        bg.on('pointerdown', startDragging);

        // Add global listeners when dragging starts
        const onStartDraggingGlobal = () => {
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        };

        handle.on('pointerdown', onStartDraggingGlobal);
        bg.on('pointerdown', onStartDraggingGlobal);

        return container;
    }

    private updateSlider(e: any, container: PIXI.Container, handle: PIXI.Graphics, sliderWidth: number, onChange: (value: number) => void) {
        const globalPos = e.data ? e.data.global : { x: e.clientX, y: e.clientY };
        const localPos = container.toLocal(globalPos);
        let newX = localPos.x;
        if (newX < -sliderWidth / 2) newX = -sliderWidth / 2;
        if (newX > sliderWidth / 2) newX = sliderWidth / 2;
        handle.x = newX;
        const value = (newX + sliderWidth / 2) / sliderWidth;
        onChange(value);
    }
}
