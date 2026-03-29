import * as PIXI from 'pixi.js';
import * as sound from '@pixi/sound';
import { injectable } from 'inversify';

@injectable()
export class SoundBoard {
    private backgroundMusic: sound.Sound;
    private pewSound: sound.Sound;
    private damagedSound: sound.Sound;
    private stopTimeSound: sound.Sound;

    constructor() {
        try {
            this.backgroundMusic = sound.Sound.from({
                url: 'assets/music/Synthwave_D.mp3',
                loop: true,
                volume: 0.4,
                preload: true
            });
            this.pewSound = sound.Sound.from({
                url: 'assets/sound/pew.mp3',
                volume: 0.025,
                preload: true
            });
            this.damagedSound = sound.Sound.from({
                url: 'assets/sound/damaged.wav',
                volume: 0.025,
                preload: true
            });
            this.stopTimeSound = sound.Sound.from({
                url: 'assets/sound/stop-time.m4a',
                volume: 0.2,
                preload: true
            });
        } catch (e) {
            console.error('Failed to initialize sounds:', e);
        }
    }

    public muffSounds(): void {
        const muffFilter = new sound.filters.EqualizerFilter(15, 15, 15, 15, 15, 0, -15, -15, -15, -15);
        if (this.backgroundMusic) this.backgroundMusic.filters = [muffFilter];
        if (this.pewSound) this.pewSound.filters = [muffFilter];
        if (this.damagedSound) this.damagedSound.filters = [muffFilter];
    }

    public unmuffSounds(): void {
        if (this.backgroundMusic) this.backgroundMusic.filters = [];
        if (this.pewSound) this.pewSound.filters = [];
        if (this.damagedSound) this.damagedSound.filters = [];
    }

    public playStopTimeMusic(): void {
        if (this.stopTimeSound && this.stopTimeSound.isLoaded) {
            this.stopTimeSound.play();
        }
    }

    public playBackgroundMusic(): void {
        if (this.backgroundMusic && this.backgroundMusic.isLoaded) {
            this.backgroundMusic.play();
        }
    }

    public stopBackgroundMusic(): void {
        if (this.backgroundMusic) this.backgroundMusic.stop();
    }

    public pauseBackgroundMusic(): void {
        if (this.backgroundMusic) this.backgroundMusic.pause();
    }

    public resumeBackgroundMusic(): void {
        if (this.backgroundMusic) this.backgroundMusic.resume();
    }

    public playPewSound(): void {
        if (this.pewSound && this.pewSound.isLoaded) {
            this.pewSound.play();
        }
    }

    public playDamageSound(): void {
        if (this.damagedSound && this.damagedSound.isLoaded) {
            this.damagedSound.play();
        }
    }
}
