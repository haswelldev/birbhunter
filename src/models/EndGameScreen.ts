import * as PIXI from 'pixi.js';

export class EndGameScreen extends PIXI.Container {
    private _bg: PIXI.Graphics;
    private _textHolder: PIXI.Text;
    private _highScoreText: PIXI.Text;
    private _startNewGameButton: PIXI.Text;
    private _settingsButton: PIXI.Text;

    public onStartNewGame: () => void;
    public onShowSettings: () => void;

    constructor(width: number, height: number) {
        super();
        this._bg = new PIXI.Graphics();
        this._bg.beginFill(0x000, 0.9);
        this._bg.drawRect(0, 0, width, height);
        this._bg.endFill();
        this._bg.interactive = true;
        this.addChild(this._bg);

        this._textHolder = new PIXI.Text('', {
            fontSize: 42,
            fill: 0xf4634e,
            align: 'center'
        });
        this._textHolder.anchor.set(0.5);
        this._textHolder.x = width / 2;
        this._textHolder.y = height * 0.3;
        this.addChild(this._textHolder);

        this._highScoreText = new PIXI.Text('', {
            fontSize: 32,
            fill: 0xffffff,
            align: 'center'
        });
        this._highScoreText.anchor.set(0.5);
        this._highScoreText.x = width / 2;
        this._highScoreText.y = height * 0.45;
        this.addChild(this._highScoreText);

        this._startNewGameButton = new PIXI.Text('[Start New Game]', {
            fontSize: 42,
            fill: 0xffffff,
            align: 'center'
        });
        this._startNewGameButton.anchor.set(0.5);
        this._startNewGameButton.x = width / 2;
        this._startNewGameButton.y = height * 0.6;
        this._startNewGameButton.interactive = true;
        this._startNewGameButton.cursor = 'pointer';
        this._startNewGameButton.on('pointerdown', () => {
            if (this.onStartNewGame) this.onStartNewGame();
        });
        this.addChild(this._startNewGameButton);

        this._settingsButton = new PIXI.Text('[Settings]', {
            fontSize: 42,
            fill: 0xffffff,
            align: 'center'
        });
        this._settingsButton.anchor.set(0.5);
        this._settingsButton.x = width / 2;
        this._settingsButton.y = height * 0.72;
        this._settingsButton.interactive = true;
        this._settingsButton.cursor = 'pointer';
        this._settingsButton.on('pointerdown', () => {
            if (this.onShowSettings) this.onShowSettings();
        });
        this.addChild(this._settingsButton);
    }

    public setScore(score: number, highScore: number): void {
        this._textHolder.text = 'You have stopped ' + score + ' birbs,\n' +
            'but forest was invaded.';
        this._highScoreText.text = 'Highest Score: ' + highScore;
    }
}
