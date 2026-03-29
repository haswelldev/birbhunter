import { Container } from 'inversify';
import { ModelCreator } from './service/ModelCreator';
import { Application } from './application';
import { TextureLoader } from './service/TextureLoader';
import { SoundBoard } from './service/SoundBoard';
import { Types } from './types';
import { PixiHolder } from './service/PixiHolder';
import { InfoDisplay } from './service/InfoDisplay';

const container = new Container();

container.bind(Types.ModelCreator).to(ModelCreator);
container.bind(Types.Application).to(Application);
container.bind(Types.TextureLoader).to(TextureLoader);
container.bind(Types.SoundBoard).to(SoundBoard);
container.bind(Types.Pixi).to(PixiHolder);
container.bind(Types.Info).to(InfoDisplay);

export { container };
