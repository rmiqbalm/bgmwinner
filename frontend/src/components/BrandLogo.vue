<template>
  <span class="brand-wrap">
    <img
      v-if="!failed"
      :src="brand.logoUrl"
      :width="size"
      :height="size"
      class="brand-img"
      :class="{ circle: round }"
      alt="Logo"
      @error="failed = true"
    />
    <span
      v-else
      class="brand-fallback"
      :class="{ circle: round }"
      :style="{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.48) + 'px' }"
    >B</span>
  </span>
</template>

<script setup>
import { ref } from 'vue'
import brand from '../assets/brand'

defineProps({
  size: { type: Number, default: 40 },
  round: { type: Boolean, default: false }
})

const failed = ref(false)
</script>

<style scoped>
.brand-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}

.brand-img {
  border-radius: 22%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(230, 33, 42, 0.35));
}

.brand-img.circle {
  border-radius: 50%;
}

.brand-fallback {
  border-radius: 22%;
  background: linear-gradient(135deg, #e6212a, #c0141c);
  color: #fff;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(230, 33, 42, 0.35));
}

.brand-fallback.circle {
  border-radius: 50%;
}
</style>
