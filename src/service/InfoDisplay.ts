import * as PIXI from 'pixi.js';
import { injectable } from 'inversify';

@injectable()
export class InfoDisplay {
    private _score: number;
    private _lives: number;
    private infoScore: PIXI.Text;
    private infoLives: PIXI.Text;

    public get score(): number {
        return this._score;
    }

    public get lives(): number {
        return this._lives;
    }

    public incrementScore(): void {
        this._score++;
        this.infoScore.text = this._score.toString();
    }

    public incrementLives(): void {
        this._lives++;
        this.infoLives.text = this._lives.toString();
    }

    public decrementLives(): void {
        this._lives--;
        this.infoLives.text = this._lives.toString();
    }

    public init(app: PIXI.Application): void {
        this._lives = 10;
        this._score = 0;
        this.infoLives = new PIXI.Text(this._lives.toString(), {
            fontSize: 24,
            fill: 0xff1010,
            align: 'center'
        });
        this.infoScore = new PIXI.Text(this._score.toString(), {
            fontSize: 24,
            fill: 0x00ba08,
            align: 'center'
        });
        this.infoLives.x = (app.screen.width * 4 / 100);
        this.infoLives.y = app.screen.height - (app.screen.height * 10 / 100);
        this.infoScore.x = app.screen.width - (app.screen.width * 6 / 100);
        this.infoScore.y = app.screen.height - (app.screen.height * 10 / 100);
        app.stage.addChild(this.infoLives);
        app.stage.addChild(this.infoScore);
    }

    public clear(app: PIXI.Application): void {
        app.stage.removeChild(this.infoLives);
        app.stage.removeChild(this.infoScore);
    }
}
