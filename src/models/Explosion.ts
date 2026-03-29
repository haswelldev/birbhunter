import { BaseModel } from './BaseModel';
import * as PIXI from 'pixi.js';

export class Explosion extends BaseModel {
    constructor(textures: PIXI.Texture[]) {
        super(textures);
    }
}
