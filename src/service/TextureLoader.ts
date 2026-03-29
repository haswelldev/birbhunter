import * as PIXI from 'pixi.js';
import { injectable } from 'inversify';

@injectable()
export class TextureLoader {
    private textures: Map<string, PIXI.Texture[]> = new Map();

    public getBirbTexture(): PIXI.Texture[] {
        if (this.textures.has('birb')) {
            return this.textures.get('birb')!;
        }
        const textures: PIXI.Texture[] = [];
        for (let i = 0; i < 6; i++) {
            textures.push(PIXI.Texture.from(`assets/animation/frame_${i}_delay-0.1s.png`));
        }
        this.textures.set('birb', textures);
        return textures;
    }

    public getExplosionTexture(): PIXI.Texture[] {
        if (this.textures.has('explosion')) {
            return this.textures.get('explosion')!;
        }
        const textures: PIXI.Texture[] = [];
        for (let i = 0; i < 10; i++) {
            textures.push(PIXI.Texture.from(`assets/animation/explosion/frame_0${i}_delay-0.1s.png`));
        }
        textures.push(PIXI.Texture.from('assets/animation/explosion/frame_10_delay-0.1s.png'));
        textures.push(PIXI.Texture.from('assets/animation/explosion/frame_11_delay-0.1s.png'));
        this.textures.set('explosion', textures);
        return textures;
    }
}
