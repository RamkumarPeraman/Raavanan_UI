import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { syncAccessSession } from '../store/accessStore';
import { ensurePaymentSettings } from '../store/paymentSettingsStore';

const AccessBootstrap = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const sync = () => { void dispatch(syncAccessSession()); };
    sync();
    void dispatch(ensurePaymentSettings());
    window.addEventListener('auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, [dispatch]);
  return null;
};

export default AccessBootstrap;
