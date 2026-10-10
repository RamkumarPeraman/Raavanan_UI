import { createSlice } from '@reduxjs/toolkit';
import apiService, { defaultBankDetails } from '../services/api';

const cacheKey = 'donation-payment-settings';
const cachedSettings = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    return saved && Date.now() - saved.savedAt < 60 * 60 * 1000 &&
      typeof saved.qrImage === 'string' &&
      (!saved.qrImage || saved.qrImage.startsWith('http'))
      ? saved : null;
  } catch {
    return null;
  }
})();

const paymentSettingsSlice = createSlice({
  name: 'paymentSettings',
  initialState: {
    qrImage: cachedSettings?.qrImage || '',
    bankDetails: { ...defaultBankDetails, ...cachedSettings?.bankDetails },
    status: 'idle',
  },
  reducers: {
    paymentSettingsRequested(state) {
      state.status = 'loading';
    },
    paymentSettingsReceived(state, action) {
      state.qrImage = action.payload.donationQrImage || '';
      state.bankDetails = { ...defaultBankDetails, ...action.payload.bankDetails };
      state.status = 'ready';
    },
    paymentSettingsFailed(state) {
      state.status = 'failed';
    },
  },
});

export const { paymentSettingsReceived } = paymentSettingsSlice.actions;
const { paymentSettingsRequested, paymentSettingsFailed } = paymentSettingsSlice.actions;
let inFlight = null;

export const ensurePaymentSettings = () => (dispatch, getState) => {
  const { status } = getState().paymentSettings;
  if (status === 'ready') return Promise.resolve(getState().paymentSettings);
  if (inFlight) return inFlight;

  dispatch(paymentSettingsRequested());
  const loadSettings = async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await apiService.getAdminSettings();
      } catch (error) {
        if (attempt === 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
  };
  const promise = loadSettings()
    .then(result => {
      if (!result?.data) throw new Error('Payment settings unavailable');
      dispatch(paymentSettingsReceived(result.data));
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          qrImage: result.data.donationQrImage || '',
          bankDetails: result.data.bankDetails,
          savedAt: Date.now(),
        }));
      } catch {
        // Storage may be unavailable; the current page still has the settings.
      }
      return result.data;
    })
    .catch(() => {
      dispatch(paymentSettingsFailed());
      return null;
    })
    .finally(() => {
      if (inFlight === promise) inFlight = null;
    });
  inFlight = promise;
  return promise;
};

export const selectPaymentSettings = state => state.paymentSettings;
export default paymentSettingsSlice.reducer;
