import * as PIXI from 'pixi.js';
import * as sound from '@pixi/sound';
import { injectable } from 'inversify';

@injectable()
export class SoundBoard {
    private backgroundMusic: sound.Sound;
    private musicList: string[] = [
        'assets/music/black_pines_in_the_rearview.mp3',
        'assets/music/flock_of_shadows.mp3',
        'assets/music/flock_of_shadows_alt.mp3',
        'assets/music/midnight_static.mp3',
        'assets/music/midnight_static_alt.mp3',
        'assets/music/midnight_static_veins.mp3',
        'assets/music/midnight_static_veins_alt.mp3',
        'assets/music/neon_ghost_in_my_chest.mp3',
        'assets/music/neon_ghost_in_my_chest_alt.mp3'
    ];
    private musicQueue: string[] = [];
    private currentMusicIndex: number = -1;
    private backgroundVolume: number = 0.25;
    private sfxVolume: number = 0.3;
    private pewSound: sound.Sound;
    private damagedSound: sound.Sound;

    constructor() {
        this.loadSettings();
        try {
            this.pewSound = sound.Sound.from({
                url: 'assets/sound/pew.mp3',
                volume: this.sfxVolume,
                preload: true
            });
            this.damagedSound = sound.Sound.from({
                url: 'assets/sound/damaged.mp3',
                volume: this.sfxVolume,
                preload: true
            });
        } catch (e) {
            console.error('Failed to initialize sounds:', e);
        }
    }

    private loadSettings(): void {
        const musicVol = localStorage.getItem('musicVolume');
        if (musicVol !== null) {
            const parsed = parseFloat(musicVol);
            if (!isNaN(parsed)) {
                this.backgroundVolume = parsed;
            }
        }
        const sfxVol = localStorage.getItem('sfxVolume');
        if (sfxVol !== null) {
            const parsed = parseFloat(sfxVol);
            if (!isNaN(parsed)) {
                this.sfxVolume = parsed;
            }
        }
    }

    private saveSettings(): void {
        localStorage.setItem('musicVolume', this.backgroundVolume.toString());
        localStorage.setItem('sfxVolume', this.sfxVolume.toString());
    }

    public getBackgroundVolume(): number {
        return this.backgroundVolume;
    }

    public getSFXVolume(): number {
        return this.sfxVolume;
    }

    private shuffleMusic(): void {
        this.musicQueue = [...this.musicList];
        for (let i = this.musicQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.musicQueue[i], this.musicQueue[j]] = [this.musicQueue[j], this.musicQueue[i]];
        }
    }

    public startNewGameMusic(): void {
        this.stopBackgroundMusic();
        this.shuffleMusic();
        this.currentMusicIndex = 0;
        this.playNextInQueue();
    }

    private playNextInQueue(): void {
        if (this.currentMusicIndex >= this.musicQueue.length) {
            this.shuffleMusic();
            this.currentMusicIndex = 0;
        }

        const nextTrackUrl = this.musicQueue[this.currentMusicIndex];
        
        const nextMusic = sound.Sound.from({
            url: nextTrackUrl,
            volume: 0, // Start silent for fade in
            preload: true,
            singleInstance: true,
            loaded: (err, s) => {
                if (err || !s) return;
                
                if (this.backgroundMusic) {
                    // Fade out current music
                    const oldMusic = this.backgroundMusic;
                    PIXI.Ticker.shared.addOnce(() => {
                        this.fadeOutAndStop(oldMusic);
                    });
                }

                this.backgroundMusic = s;
                this.backgroundMusic.play({
                    complete: () => {
                        this.currentMusicIndex++;
                        this.playNextInQueue();
                    }
                });
                this.fadeIn(this.backgroundMusic);
            }
        });
    }

    private fadeIn(s: sound.Sound): void {
        const targetVolume = this.backgroundVolume;
        const duration = 1000; // 1 second fade in
        const startTime = Date.now();

        const ticker = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            s.volume = progress * targetVolume;
            if (progress < 1) {
                requestAnimationFrame(ticker);
            }
        };
        ticker();
    }

    private fadeOutAndStop(s: sound.Sound): void {
        const startVolume = s.volume;
        const duration = 1000; // 1 second fade out
        const startTime = Date.now();

        const ticker = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            s.volume = startVolume * (1 - progress);
            if (progress < 1) {
                requestAnimationFrame(ticker);
            } else {
                s.stop();
            }
        };
        ticker();
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

    public setBackgroundVolume(volume: number): void {
        this.backgroundVolume = volume;
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = volume;
        }
        this.saveSettings();
    }

    public setSFXVolume(volume: number): void {
        this.sfxVolume = volume;
        if (this.pewSound) this.pewSound.volume = volume;
        if (this.damagedSound) this.damagedSound.volume = volume;
        this.saveSettings();
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
