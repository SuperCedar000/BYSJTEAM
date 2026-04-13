import { createStore } from 'vuex'

export default createStore({
  state: {
    language: localStorage.getItem('lang') || 'zh'
  },
  mutations: {
    SET_LANG(state, lang) {
      state.language = lang
      localStorage.setItem('lang', lang)
    }
  },
  actions: {
    changeLanguage({ commit }, lang) {
      commit('SET_LANG', lang)
    }
  }
})