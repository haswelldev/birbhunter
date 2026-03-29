import { injectable, inject } from 'inversify';
import { TextureLoader } from './TextureLoader';
import { Birb } from '../models/Birb';
import { Explosion } from '../models/Explosion';
import { Types } from '../types';

@injectable()
export class ModelCreator {
    constructor(
        @inject(Types.TextureLoader) private loader: TextureLoader
    ) {}

    public createBirb(): Birb {
        return new Birb(this.loader.getBirbTexture());
    }

    public createExplosion(): Explosion {
        return new Explosion(this.loader.getExplosionTexture());
    }
}
