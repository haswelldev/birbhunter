export enum Difficulty {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard',
    NIGHTMARE = 'Nightmare'
}

export interface DifficultySettings {
    initialMoveSpeed: number;
    speedIncrement: number;
    speedIncrementInterval: number; // ms
    initialSpawnInterval: number; // ms
    extraSpawnIntervalRange: [number, number]; // ms
    extraSpawnInterval: number; // ms
    extraHealthThreshold: number; // birbs down
    timeStopThreshold: number; // birbs down
    timeStopDuration: number; // ms
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultySettings> = {
    [Difficulty.EASY]: {
        initialMoveSpeed: 3,
        speedIncrement: 0.05,
        speedIncrementInterval: 5000,
        initialSpawnInterval: 4000,
        extraSpawnIntervalRange: [5000, 40000],
        extraSpawnInterval: 12000,
        extraHealthThreshold: 10,
        timeStopThreshold: 20,
        timeStopDuration: 10000
    },
    [Difficulty.MEDIUM]: {
        initialMoveSpeed: 4,
        speedIncrement: 0.1,
        speedIncrementInterval: 4000,
        initialSpawnInterval: 3000,
        extraSpawnIntervalRange: [3000, 30000],
        extraSpawnInterval: 10000,
        extraHealthThreshold: 15,
        timeStopThreshold: 30,
        timeStopDuration: 7000
    },
    [Difficulty.HARD]: {
        initialMoveSpeed: 5,
        speedIncrement: 0.15,
        speedIncrementInterval: 3000,
        initialSpawnInterval: 2500,
        extraSpawnIntervalRange: [2000, 20000],
        extraSpawnInterval: 8000,
        extraHealthThreshold: 20,
        timeStopThreshold: 40,
        timeStopDuration: 5000
    },
    [Difficulty.NIGHTMARE]: {
        initialMoveSpeed: 7,
        speedIncrement: 0.2,
        speedIncrementInterval: 2000,
        initialSpawnInterval: 1500,
        extraSpawnIntervalRange: [1000, 10000],
        extraSpawnInterval: 5000,
        extraHealthThreshold: 30,
        timeStopThreshold: 60,
        timeStopDuration: 3000
    }
};
