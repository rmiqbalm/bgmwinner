import { defineStore } from 'pinia'

const STORAGE_KEY = 'bgm_theme'

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0d15' : '#ffffff')
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem(STORAGE_KEY) || 'light'
  }),
  actions: {
    init() {
      applyTheme(this.theme)
    },
    setTheme(t) {
      this.theme = t
      localStorage.setItem(STORAGE_KEY, t)
      applyTheme(t)
    },
    toggle() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    }
  }
})
