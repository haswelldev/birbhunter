declare global {
    interface Window {
        cordova: any;
    }
}

export const Types = {
    ModelCreator: Symbol.for('ModelCreator'),
    SoundBoard: Symbol.for('SoundBoard'),
    TextureLoader: Symbol.for('TextureLoader'),
    Application: Symbol.for('Application'),
    Pixi: Symbol.for('PixiHolder'),
    Info: Symbol.for('InfoDisplay'),
};
