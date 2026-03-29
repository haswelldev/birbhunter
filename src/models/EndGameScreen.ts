import * as PIXI from 'pixi.js';

export class EndGameScreen extends PIXI.Graphics {
    private _textHolder: PIXI.Text;

    constructor(width: number, height: number) {
        super();
        this.beginFill(0x000);
        this.drawRect(0, 0, width, height);
        this.interactive = true;
        this.cursor = 'pointer';

        const text = new PIXI.Text('', {
            fontSize: 42,
            fill: 0xf4634e,
            align: 'center'
        });
        text.x = width * 20 / 100;
        text.y = height * 20 / 100;
        this.addChild(text);
        this._textHolder = text;
    }

    public setScore(score: number): void {
        this._textHolder.text = 'You have stopped ' + score + ' birbs,\n' +
            'but forest was invaded.\n' +
            '\n' +
            '[Tap to try again]';
    }
}
