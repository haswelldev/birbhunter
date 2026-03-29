import * as PIXI from 'pixi.js';

export class StartGameScreen extends PIXI.Graphics {
    private _text: string = 'Humongous legions of birbs are\n' +
        'heading to our forest!\n' +
        'You should stop as much birbs as you can!\n\n\n' +
        '[Tap to start birbhunting]';

    constructor(width: number, height: number) {
        super();
        this.beginFill(0x000);
        this.drawRect(0, 0, width, height);
        this.interactive = true;
        this.cursor = 'pointer';

        const text = new PIXI.Text(this._text, {
            fontSize: 42,
            fill: 0xf4634e,
            align: 'center'
        });
        text.x = 10;
        text.y = 15;
        this.addChild(text);
    }
}
