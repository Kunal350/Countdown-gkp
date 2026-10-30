export type TimeOfDay = 'day' | 'sunset' | 'night';

export type CameraPreset = 'overview' | 'kids' | 'road' | 'shelter' | 'bus';

export type BusState = 'away' | 'approaching' | 'at_stop' | 'departing';

export interface KidInfo {
  id: string;
  name: string;
  hindiName: string;
  age: number;
  role: string;
  avatarColor: string;
  dialogue: string;
  englishDialogue: string;
  bagType: string;
  seatPreference: string;
  favoriteGorakhpurSnack: string;
  position: [number, number, number];
  rotationY: number;
}
