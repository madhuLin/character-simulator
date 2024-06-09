import { defineStore } from 'pinia';

interface StoreState {
  count: number;
  selectedWeather: string;
  selectedCharacterMode: string;
  selectedTimeOfDay: string;
  selectedSpeed: string;
  // isLoggedIn: boolean;
  // userInfo: any | null;
}

export const useStore = defineStore({
  id: 'store', // store 的唯一 ID
  state: (): StoreState => ({
    count: 0,
    selectedWeather: 'sunny',
    selectedCharacterMode: 'walk',
    selectedTimeOfDay: 'morning',
    selectedSpeed: '3',
  }),
  getters: {
    // 定義 getters 函數
    doubleCount(): number {
      return this.count * 2;
    },
  },
  actions: {
    // 定義 actions 函數
    increment(): void {
      this.count++;
    },
    login(user: any): void {
      // this.isLoggedIn = true;
      // this.userInfo = user;
    },
    logout(): void {
      // this.isLoggedIn = false;
      // this.userInfo = null;
    },
  },
});
