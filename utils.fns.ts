export interface IFeatures {
  isLeftEyeOpen: boolean;
  isRightEyeOpen: boolean;
  isMouthOpen: boolean;
}

export type TaskINDEX = 0 | 1 | 2 | 3 | 4;
export type MaxTaskNumber = 1 | 2 | 3 | 4 | 5;

export function getRandomTaskIndex(maxValue: MaxTaskNumber): TaskINDEX {
  return Math.floor(Math.random() * maxValue) as TaskINDEX;
}
