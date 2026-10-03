import { configureStore, createSlice } from '@reduxjs/toolkit';
import apiService from '../services/api';
import paymentSettingsReducer from './paymentSettingsStore';
import { ACCESS_CACHE_KEY } from '../constants/accessCache';

const readCachedAccess = (session) => {
  try {
    const cached = JSON.parse(localStorage.getItem(ACCESS_CACHE_KEY) || 'null');
    if (cached?.token === session.token && cached.userId === session.userId && cached.role === session.role && Array.isArray(cached.permissions)) {
      return cached.permissions;
    }
  } catch { /* Ignore an invalid or unavailable cache. */ }
  return null;
};

const saveCachedAccess = (session, permissions) => {
  try {
    localStorage.setItem(ACCESS_CACHE_KEY, JSON.stringify({ ...session, permissions }));
  } catch { /* Access remains available in Redux for this page load. */ }
};

const clearCachedAccess = () => {
  try { localStorage.removeItem(ACCESS_CACHE_KEY); } catch { /* Storage may be unavailable. */ }
};

const accessSlice = createSlice({
  name: 'access',
  initialState: { token: null, userId: null, role: null, version: 0, permissions: [], status: 'idle', error: null },
  reducers: {
    sessionChanged(state, action) {
      const { token, userId, role } = action.payload;
      if (state.token === token && state.userId === userId && state.role === role) return;
      state.token = token;
      state.userId = userId;
      state.role = role;
      state.version += 1;
      state.permissions = [];
      state.status = token ? 'idle' : 'anonymous';
      state.error = null;
    },
    accessRequested(state, action) {
      if (state.token !== action.payload.token || state.version !== action.payload.version) return;
      state.status = 'loading';
      state.error = null;
    },
    accessReceived(state, action) {
      if (state.token !== action.payload.token || state.version !== action.payload.version) return;
      state.permissions = action.payload.permissions;
      state.status = 'ready';
      state.error = null;
    },
    accessFailed(state, action) {
      if (state.token !== action.payload.token || state.version !== action.payload.version) return;
      state.permissions = [];
      state.status = 'failed';
      state.error = action.payload.error;
    },
    accessInvalidated(state) {
      if (!state.token) return;
      state.version += 1;
      state.permissions = [];
      state.status = 'idle';
      state.error = null;
    },
  },
});

const { sessionChanged, accessRequested, accessReceived, accessFailed, accessInvalidated } = accessSlice.actions;
let inFlight = null;

const currentSession = () => {
  const token = localStorage.getItem('authToken');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { /* Invalid saved user. */ }
  return { token, userId: user?.id || user?._id || null, role: user?.role || null };
};

export const ensureAccess = () => (dispatch, getState) => {
  const session = currentSession();
  dispatch(sessionChanged(session));
  if (!session.token) {
    inFlight = null;
    clearCachedAccess();
    return Promise.resolve([]);
  }
  const access = getState().access;
  if (access.status === 'ready') return Promise.resolve(access.permissions);
  if (inFlight?.token === session.token && inFlight.version === access.version) return inFlight.promise;

  if (access.status === 'idle') {
    const cachedPermissions = readCachedAccess(session);
    if (cachedPermissions) {
      dispatch(accessReceived({ token: session.token, version: access.version, permissions: cachedPermissions }));
      return Promise.resolve(cachedPermissions);
    }
  }

  dispatch(accessRequested({ token: session.token, version: access.version }));
  const promise = apiService.getMyRoleAccess()
    .then(result => {
      const permissions = Array.isArray(result.permissions) ? result.permissions : [];
      dispatch(accessReceived({ token: session.token, version: access.version, permissions }));
      if (getState().access.token === session.token && getState().access.version === access.version) {
        saveCachedAccess(session, permissions);
      }
      return permissions;
    })
    .catch(error => {
      dispatch(accessFailed({ token: session.token, version: access.version, error: error.message || 'Could not verify access.' }));
      return [];
    })
    .finally(() => {
      if (inFlight?.promise === promise) inFlight = null;
    });
  inFlight = { token: session.token, version: access.version, promise };
  return promise;
};

export const syncAccessSession = () => dispatch => dispatch(ensureAccess());
export const refreshAccess = () => dispatch => {
  clearCachedAccess();
  dispatch(accessInvalidated());
  return dispatch(ensureAccess());
};
export const selectAccess = state => state.access;
export const selectPermissions = state => state.access.permissions;

export const store = configureStore({
  reducer: { access: accessSlice.reducer, paymentSettings: paymentSettingsReducer },
  devTools: false,
});
