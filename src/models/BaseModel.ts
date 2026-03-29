import * as PIXI from 'pixi.js';

export class BaseModel {
    public sprite: PIXI.AnimatedSprite;

    constructor(textures: PIXI.Texture[]) {
        this.sprite = new PIXI.AnimatedSprite(textures);
    }
}
