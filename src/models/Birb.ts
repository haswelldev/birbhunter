import { BaseModel } from './BaseModel';
import * as PIXI from 'pixi.js';

export class Birb extends BaseModel {
    public direction: number;
    public turningSpeed: number;
    public speed: number;

    constructor(textures: PIXI.Texture[]) {
        super(textures);
    }
}
