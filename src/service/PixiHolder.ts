import * as PIXI from 'pixi.js';
import { injectable } from 'inversify';

@injectable()
export class PixiHolder {
    private _app: PIXI.Application;

    constructor() {
        this._app = new PIXI.Application({
            width: 1920,
            height: 1080
        });
    }

    public get app(): PIXI.Application {
        return this._app;
    }
}
