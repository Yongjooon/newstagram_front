import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePromptStore = defineStore('prompt', () => {
  const searchHistory = ref([])

  const addSearch = (keyword) => {
    if (!searchHistory.value.includes(keyword)) {
      searchHistory.value.unshift(keyword)
    }
  }

  return { searchHistory, addSearch }
})
