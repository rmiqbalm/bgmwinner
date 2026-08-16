<template>
  <button
    class="theme-toggle"
    :title="theme.theme === 'light' ? 'Mode Gelap' : 'Mode Terang'"
    :aria-label="theme.theme === 'light' ? 'Mode Gelap' : 'Mode Terang'"
    @click="theme.toggle"
  >
    <AppIcon :name="theme.theme === 'light' ? 'moon' : 'sun'" :size="17" />
  </button>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'
import AppIcon from './AppIcon.vue'

const theme = useThemeStore()
</script>

<style scoped>
.theme-toggle {
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 11px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--muted);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--primary-soft);
  color: var(--primary-2);
  filter: none;
}
</style>
