import * as PIXI from 'pixi.js';
import { injectable } from 'inversify';

@injectable()
export class InfoDisplay {
    private _score: number;
    private _lives: number;
    private infoScore: PIXI.Text;
    private infoLives: PIXI.Text;
    private pixiApp: PIXI.Application;
    private floatingNotifications: { ticker: (delta: number) => void, text: PIXI.Text }[] = [];

    public get score(): number {
        return this._score;
    }

    public get lives(): number {
        return this._lives;
    }

    public incrementScore(): void {
        this._score++;
        this.infoScore.text = `Birbs down: ${this._score}`;
    }

    public incrementLives(): void {
        this._lives++;
        this.infoLives.text = `Healths: ${this._lives}`;
        this.showFloatingNotification("+1 HP", 0x00ff00, this.infoLives.x + this.infoLives.width / 2, this.infoLives.y - 20);
    }

    public decrementLives(): void {
        this._lives--;
        this.infoLives.text = `Healths: ${this._lives}`;
        this.showFloatingNotification("-1 Health. Birb got trough", 0xff0000, this.infoLives.x + this.infoLives.width / 2, this.infoLives.y - 20);
    }

    public showTimeStopNotification(): void {
        this.showFloatingNotification("Time stop charge added!", 0xffa500, this.infoLives.x + this.infoLives.width / 2, this.infoLives.y - 40);
    }

    private showFloatingNotification(text: string, color: number, x: number, y: number): void {
        const notification = new PIXI.Text(text, {
            fontSize: 20,
            fill: color,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 3
        });

        notification.x = x;
        notification.y = y;
        notification.anchor.set(0.5);

        this.pixiApp.stage.addChild(notification);

        let elapsed = 0;
        const duration = 60; // frames
        const ticker = (delta: number) => {
            elapsed += delta;
            notification.y -= 1 * delta;
            notification.alpha = 1 - (elapsed / duration);

            if (elapsed >= duration) {
                this.pixiApp.ticker.remove(ticker);
                this.floatingNotifications = this.floatingNotifications.filter(n => n.ticker !== ticker);
                this.pixiApp.stage.removeChild(notification);
                notification.destroy();
            }
        };

        this.floatingNotifications.push({ ticker, text: notification });
        this.pixiApp.ticker.add(ticker);
    }

    public showMessage(text: string): void {
        this.showFloatingNotification(text, 0xffffff, this.infoLives.x + this.infoLives.width / 2, this.infoLives.y - 20);
    }

    public init(app: PIXI.Application): void {
        this.pixiApp = app;
        this._lives = 10;
        this._score = 0;
        this.infoLives = new PIXI.Text(`Healths: ${this._lives}`, {
            fontSize: 24,
            fill: 0xff1010,
            align: 'center'
        });
        this.infoScore = new PIXI.Text(`Birbs down: ${this._score}`, {
            fontSize: 24,
            fill: 0x00ba08,
            align: 'center'
        });
        this.infoLives.x = (app.screen.width * 4 / 100);
        this.infoLives.y = app.screen.height - (app.screen.height * 10 / 100);
        this.infoScore.x = app.screen.width - (app.screen.width * 20 / 100);
        this.infoScore.y = app.screen.height - (app.screen.height * 10 / 100);

        app.stage.addChild(this.infoLives);
        app.stage.addChild(this.infoScore);
    }

    public clear(app: PIXI.Application): void {
        app.stage.removeChild(this.infoLives);
        app.stage.removeChild(this.infoScore);
        this.floatingNotifications.forEach(n => {
            this.pixiApp.ticker.remove(n.ticker);
            app.stage.removeChild(n.text);
            n.text.destroy();
        });
        this.floatingNotifications = [];
    }
}
