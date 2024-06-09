<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-2/3">
      <h1 class="text-2xl font-bold mb-4">設定</h1>
      <!-- 時間 -->
      <div class="bg-white dark:bg-slate-800 rounded-lg px-6 py-4 ring-1 ring-slate-900/5 shadow-xl mb-4">
        <h3 class="text-slate-900 dark:text-white mb-2 text-base font-medium tracking-tight">選擇時間</h3>
        <div class="flex space-x-4">
          <button @click="selectTimeOfDay('morning')" class="flex-1 p-2 bg-blue-100 rounded shadow"
            :class="{ 'bg-blue-400': selectedTimeOfDay === 'morning' }">
            <img src="@/assets/vue/morning.png" alt="白天" class="mx-auto w-24 h-24">
          </button>
          <button @click="selectTimeOfDay('afternoon')" class="flex-1 p-2 bg-blue-100 rounded shadow"
            :class="{ 'bg-blue-400': selectedTimeOfDay === 'afternoon' }">
            <img src="@/assets/vue/afternoon.png" alt="黃昏" class="mx-auto w-24 h-24">
          </button>
          <button @click="selectTimeOfDay('night')" class="flex-1 p-2 bg-blue-100 rounded shadow"
            :class="{ 'bg-blue-400': selectedTimeOfDay === 'night' }">
            <img src="@/assets/vue/night.png" alt="晚上" class="mx-auto w-24 h-24">
          </button>
        </div>
      </div>
      <!-- 天氣選擇 -->
      <div class="bg-white dark:bg-slate-800 rounded-lg px-6 py-4 ring-1 ring-slate-900/5 shadow-xl mb-4">
        <h3 class="text-slate-900 dark:text-white mb-2 text-base font-medium tracking-tight">選擇天氣</h3>
        <div class="flex space-x-4">
          <button @click="selectWeather('sunny')" class="flex-1 p-2 bg-green-100 rounded shadow"
            :class="{ 'bg-green-400': selectedWeather === 'sunny' }">
            <img src="@/assets/vue/sunny.png" alt="晴天" class="mx-auto w-24 h-24">
          </button>
          <button @click="selectWeather('rainy')" class="flex-1 p-2 bg-green-100 rounded shadow"
            :class="{ 'bg-green-400': selectedWeather === 'rainy' }">
            <img src="@/assets/vue/rainy.png" alt="雨天" class="mx-auto w-24 h-24">
          </button>
          <button @click="selectWeather('snowy')" class="flex-1 p-2 bg-green-100 rounded shadow"
            :class="{ 'bg-green-400': selectedWeather === 'snowy' }">
            <img src="@/assets/vue/snowy.png" alt="雪天" class="mx-auto w-24 h-24">
          </button>
        </div>
      </div>

      <!-- 音樂選擇 -->
      <div class="bg-white dark:bg-slate-800 rounded-lg px-6 py-4 ring-1 ring-slate-900/5 shadow-xl mb-4">
        <h3 class="text-slate-900 dark:text-white mb-2 text-base font-medium tracking-tight">選擇音樂</h3>
        <div class="flex space-x-4">
          <button @click="selectMusic('sunny')" class="flex-1 p-2 bg-yellow-100 rounded shadow"
            :class="{ 'bg-yellow-400': selectedMusic === 'sunny' }">
            Sunny
          </button>
          <button @click="selectMusic('sad')" class="flex-1 p-2 bg-yellow-100 rounded shadow"
            :class="{ 'bg-yellow-400': selectedMusic === 'sad' }">
            Sad
          </button>
          <button @click="selectMusic('gta')" class="flex-1 p-2 bg-yellow-100 rounded shadow"
            :class="{ 'bg-yellow-400': selectedMusic === 'gta' }">
            Gta
          </button>
          <!-- 在這裡添加更多音樂選項 -->
        </div>
      </div>


      <!-- 模式選擇 -->
      <div class="bg-white dark:bg-slate-800 rounded-lg px-6 py-4 ring-1 ring-slate-900/5 shadow-xl mb-4">
        <h3 class="text-slate-900 dark:text-white mb-2 text-base font-medium tracking-tight">選擇模式</h3>
        <div class="flex space-x-4">
          <button @click="selectMode('walk')" class="flex-1 p-2 bg-red-100 rounded shadow"
            :class="{ 'bg-red-400': selectedCharacterMode === 'walk' }">
            行走模式
          </button>
          <button @click="selectMode('fly')" class="flex-1 p-2 bg-red-100 rounded shadow"
            :class="{ 'bg-red-400': selectedCharacterMode === 'fly' }">
            飛行模式
          </button>
        </div>
      </div>
      <!-- 速度選擇 -->
      <div class="bg-white dark:bg-slate-800 rounded-lg px-6 py-4 ring-1 ring-slate-900/5 shadow-xl">
        <h3 class="text-slate-900 dark:text-white mb-2 text-base font-medium tracking-tight">選擇速度</h3>
        <div class="flex items-center">
          <input type="range" min="1" max="10" v-model="selectedSpeed" class="flex-1" />
          <span class="ml-4">{{ selectedSpeed }}</span>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <button @click="handleToolCompleted"
          class="bg-blue-500 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700">保存</button>
        <button @click="$emit('close')"
          class="ml-2 bg-gray-500 text-white px-4 py-2 rounded shadow-sm hover:bg-gray-700">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from '@/store/index.ts'
// // 接收父组件传递的 sceneValue
// const props = defineProps({sceneValue: Object});

// // 在子组件中使用 props.sceneValue
// const sceneValue = toRefs(props.sceneValue);

// timeOfDay: "morning",
//     weather: "sunny",
//     character: "boy"
const store = useStore();
const selectedWeather = ref('');
const selectedCharacterMode = ref('');
const selectedTimeOfDay = ref('');

const selectedSpeed = ref(3);



onMounted(() => {
  // console.log(store.selectedCharacter);
  // 將 props.sceneValue 的值更新到本地 state 中
  selectedCharacterMode.value = store.selectedCharacterMode;
  selectedWeather.value = store.selectedWeather;
  selectedTimeOfDay.value = store.selectedTimeOfDay;
  selectedSpeed.value = store.selectedSpeed;

  console.log(`天氣: ${selectedWeather.value}, 角色: ${selectedCharacterMode.value}, 時間: ${selectedTimeOfDay.value}`);
});

const selectWeather = (weather) => {
  selectedWeather.value = weather;
};

const selectMode = (mode) => {
  selectedCharacterMode.value = mode;

};

const selectTimeOfDay = (timeOfDay) => {
  selectedTimeOfDay.value = timeOfDay;
};

const selectedMusic = ref('');

const selectMusic = (music) => {
  selectedMusic.value = music;
};

const emit = defineEmits(['effetParams']);
const handleToolCompleted = () => {
  console.log(`天氣: ${selectedWeather.value}, 角色: ${selectedCharacterMode.value}, 時間: ${selectedTimeOfDay.value}`);
  store.selectedCharacterMode = selectedCharacterMode.value;
  store.selectedTimeOfDay = selectedTimeOfDay.value;
  store.selectedWeather = selectedWeather.value;
  store.selectedSpeed = selectedSpeed.value;
  // 這裡可以添加保存設定的邏輯
  let params = {
    weather: selectedWeather.value,
    mode: selectedCharacterMode.value,
    timeOfDay: selectedTimeOfDay.value,
    speed: Number(selectedSpeed.value),
    music: selectedMusic.value,
  }
  emit('effetParams', params);
};


</script>

<style scoped>
/* 可以在這裡添加自定義樣式 */
</style>
