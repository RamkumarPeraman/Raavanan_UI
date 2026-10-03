import { createSlice } from '@reduxjs/toolkit';
import apiService, { defaultBankDetails } from '../services/api';

const paymentSettingsSlice = createSlice({
  name: 'paymentSettings',
  initialState: {
    qrImage: '',
    bankDetails: { ...defaultBankDetails },
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
  const promise = apiService.getAdminSettings()
    .then(result => {
      if (!result?.data) throw new Error('Payment settings unavailable');
      dispatch(paymentSettingsReceived(result.data));
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
