import Vue from 'vue'
import * as types from '../mutations-types'

// Initialize state
const state = {
  toasts: {}
}

// Getters to compute required states
const getters = {
}

// Actions for asynchronous operations to trigger mutations for CRUD operations on toasts
const actions = {
  [types.CREATE_TOAST]({ commit, state }, param) {
    commit(types.CREATE_TOAST, param)
  },
  [types.UPDATE_TOAST]({ commit, state }, param) {
    commit(types.UPDATE_TOAST, param)
  },
  [types.DESTROY_TOAST]({ commit, state }, id) {
    commit(types.DESTROY_TOAST, id)
  }
}

// Mutations
const mutations = {
  [types.CREATE_TOAST](state, param) {
    Vue.set(state.toasts, param.id, param)
  },
  [types.UPDATE_TOAST](state, newState) {
    Object.keys(newState).forEach(function (propName) {
      if (propName !== 'id') Vue.set(state.toasts[newState.id], propName, newState[propName])
    })
  },
  [types.DESTROY_TOAST](state, id) {
    delete state.toasts[id]
    Vue.set(state, 'toasts', { ...state.toasts })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
