<template>
  <div class="notification-bar">
    <div class="time">
      <p class="time-font">{{ currentTime }}</p>
    </div>
    <div class="icons">
      <img :src="signal" alt="Signal Icon" />
      <img :src="wifi" alt="WiFi Icon" />
      <img :src="battery" alt="Battery Icon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import battery from '../assets/icons/battery.png';
import signal from '../assets/icons/signal.png';
import wifi from '../assets/icons/wifi.png';




const currentTime = ref(getTime());



function getTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
}

function updateClock() {
  currentTime.value = getTime();
}

onMounted(() => {
 
  updateClock();
  setInterval(updateClock, 1000);
});
</script>

<style>
.notification-bar {
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: row;
  font-size: 10px;
  justify-content: space-between;
  align-items: center;
  padding: 25px 15px 10px 15px;
  height: 35px;
  background-color: var(--component-bg);
  color: var(--component-font-color);


}

.notification-bar:after{
    content:'';
    background:url('http://www.dummyimage.com/300x300/000/fff&text=parent+image');
    position:absolute;
    top:0;
    left:0;
    opacity:0.5;
}


.notification-bar.day {
  --component-bg: #ffffff; /* Day mode background */
  --component-font-color: #000000; /* Day mode text color */
}

.notification-bar.night {
  --component-bg: #1a1a1a; /* Night mode background */
  --component-font-color: #ffffff; /* Night mode text color */
}
.time {
  flex: 1;
  font-weight: bold;
  font-size: 18px;
  margin-left: 20px;
  font-weight: 500;
  overflow: hidden;
  z-index: 1;
}

.icons img {
  width: 25px;
  height:25px;
  margin-left: 5px;
  z-index: 1;
}
</style>
