<template>
  <transition name="fade">
    <div v-if="show" class="error-popup-container">
      <div class="blur-background"></div>
      <div class="error-popup">
        <div class="error-content">
          <p class="error-message">{{ message }}</p>
          <div ref="animationContainer" class="animation-container"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import lottie from 'lottie-web';
import errorAnimation from '@/assets/badservice.json'; // Make sure this path is correct

export default {
  name: 'ErrorPopup',
  props: {
    show: Boolean,
    message: String,
  },
  data() {
    return {
      animation: null,
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.loadAnimation();
        });
      } else if (this.animation) {
        this.animation.destroy();
        this.animation = null;
      }
    }
  },
  methods: {
    loadAnimation() {
      if (!this.animation) {
        this.animation = lottie.loadAnimation({
          container: this.$refs.animationContainer,
          animationData: errorAnimation,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
          },
        });
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap');

.error-popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.blur-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.5);
}

.error-popup {
  position: relative;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: 'Raleway', sans-serif;
  z-index: 1001;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 300px;
}

.error-message {
  margin-bottom: 20px;
  font-size: 18px;
  color: red;
  font-weight: 700;
  text-align: center;
}

.animation-container {
  width: 150px;
  height: 150px;
  margin-top: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>