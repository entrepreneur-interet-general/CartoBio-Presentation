import {parseJwt} from '@/api/user.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const USER_STATE_ANONYMOUS = 'ANONYMOUS'
const USER_STATE_AUTHENTICATED = 'AUTHENTICATED'
const USER_STATE_AUTHENTICATING = 'AUTHENTICATING'

const DEMO_GROUPS = [
  'Admin'
]

const DEMO_DOMAINS = [
  '@beta.gouv.fr',
  '@agencebio.org',
  '@agriculture.gouv.fr',
  '@yopmail.com'
]

const DEMO_EMAILS = [
  'lucasbchini@gmail.com'
]

const state = {
  // has the first load happened?
  isLoaded: false,
  apiToken: null,
  userState: USER_STATE_ANONYMOUS
};

const actions = {
  setProfile ({ commit, state }, cartobioToken) {
    if (!cartobioToken) {
      state.apiToken = null

      return Promise.resolve(null);
    }

    return Promise.resolve(cartobioToken)
      .then(token => parseJwt(token))
      .then(userData => {
        state.apiToken = cartobioToken
        state.userState = userData.id ? USER_STATE_AUTHENTICATED : USER_STATE_AUTHENTICATED

        commit("FIRST_LOAD_DONE")
        commit("setUser", userData, { root: true })
        commit("setUserCategory", userData.mainGroup.nom, { root: true })
        return userData
      });
  },

  trackEvent ({ getters }, categoryActionName) {
    const { isAuthenticated, isDemoAccount } = getters

    if (IS_PRODUCTION && isAuthenticated && !isDemoAccount) {
      window._paq.push(['trackEvent', ...categoryActionName])
    }
  },

  trackSiteSearch ({ getters }, searchData) {
    const { isAuthenticated, isDemoAccount } = getters

    if (IS_PRODUCTION && isAuthenticated && !isDemoAccount) {
      window._paq.push(['trackSiteSearch', ...searchData])
    }
  },
};

const mutations = {
  FIRST_LOAD_DONE (state) {
    state.isLoaded = true
  },

  LOGIN (state) {
    state.userState = USER_STATE_AUTHENTICATING
  },

  LOGOUT (state) {
    state.userState = USER_STATE_ANONYMOUS
    state.apiToken = null
  }
};

const getters = {
  isAuthenticated (state, getters, rootState) {
    const {userProfile} = rootState
    return userProfile?.id ? true : false;
  },

  isDemoAccount (state, getters, rootState) {
    const {userProfile, userCategory} = rootState

    if (!userProfile?.id) {
      return false
    }

    if (DEMO_GROUPS.includes(userCategory)) {
      return true
    }

    if (DEMO_DOMAINS.some(suffix => String(userProfile.email).trim().endsWith(suffix))) {
      return true
    }

    if (DEMO_EMAILS.includes(userProfile.email)) {
      return true
    }

    return false
  },

  isAuthenticating (state) {
    return state.userState === USER_STATE_AUTHENTICATING
  },

  isCertificationBody (state, getters, rootState) {
    const {userProfile} = rootState
    return userProfile?.organismeCertificateurId ? true : false;
  },

  isLoaded (state) {
    return state.isLoaded
  }
};

export default {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
}
