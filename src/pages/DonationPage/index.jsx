import React, { useEffect, useRef, useState } from 'react';
import { FiArrowRight, FiCreditCard, FiDownload, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import apiService from '../../services/api';
import CommonSelect from '../../components/common/CommonSelect';
import { ensurePaymentSettings, selectPaymentSettings } from '../../store/paymentSettingsStore';
import './donation.css';

const projectOptions = [
  { value: 'general', label: 'Where it is needed most' },
  { value: 'education', label: 'Education for All' },
  { value: 'women', label: 'Women Empowerment' },
  { value: 'healthcare', label: 'Healthcare Initiative' },
  { value: 'environment', label: 'Environmental Conservation' },
];
const predefinedAmounts = [500, 1000, 2000, 5000, 10000];
const emptyForm = { name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', pan: '', anonymous: false, message: '' };

const DonationPage = () => {
  const dispatch = useDispatch();
  const { qrImage, bankDetails, status: settingsStatus } = useSelector(selectPaymentSettings);
  const settingsLoaded = settingsStatus === 'ready';
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [project, setProject] = useState('general');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settingsStatus === 'idle' || settingsStatus === 'failed') void dispatch(ensurePaymentSettings());
  }, [dispatch, settingsStatus]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be under 5MB');
      event.target.value = '';
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (result) => setPaymentScreenshot(result.target.result);
    reader.readAsDataURL(file);
  };

  const handleDownloadQr = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'donation-qr.png';
    link.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const donationAmount = customAmount || amount;
    if (!donationAmount || Number(donationAmount) <= 0) {
      toast.error('Please select or enter a valid amount');
      return;
    }
    if (!transactionId.trim()) {
      toast.error('Please enter your Transaction ID');
      return;
    }
    if (!paymentScreenshot) {
      toast.error('Please upload your payment screenshot');
      return;
    }
    setLoading(true);
    try {
      const response = await apiService.createDonation({
        type: 'one-time', amount: parseFloat(donationAmount), project, paymentMethod: 'upi',
        transactionId: transactionId.trim(), paymentScreenshot, ...formData,
      });
      if (response.success) {
        toast.success('Thank you! Your donation has been submitted. Our team will verify it shortly.');
        setAmount(1000);
        setCustomAmount('');
        setTransactionId('');
        setPaymentScreenshot('');
        setScreenshotName('');
        setProject('general');
        setFormData(emptyForm);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentAmount = customAmount || amount;

  return (
    <div className="donation-page">
      <form className="donation-workspace" onSubmit={handleSubmit}>
        <section className="donation-form-panel" aria-labelledby="donation-form-title">
          <div className="donation-panel-heading">
            <h1 id="donation-form-title">Make a Donation</h1>
            <span><b>*</b> Required fields</span>
          </div>

          <div className="donation-form-scroll">
            <section className="donation-section" aria-label="Your contribution">
              <div className="donation-contribution">
                <div>
                  <label htmlFor="donation-cause">Support a cause</label>
                  <CommonSelect id="donation-cause" name="project" label="Support a cause" value={project} onChange={setProject} options={projectOptions} className="donation-cause-select" menuClassName="donation-cause-menu" />
                </div>
                <label>Custom amount (₹)
                  <input className="donation-control" type="number" min="1" inputMode="numeric" placeholder="Enter amount" value={customAmount} onChange={(event) => { setCustomAmount(event.target.value); setAmount(''); }} />
                </label>
              </div>
              <div className="donation-amounts" role="group" aria-label="Choose a donation amount">
                {predefinedAmounts.map((value) => <button key={value} type="button" className={amount === value ? 'is-selected' : ''} aria-pressed={amount === value} onClick={() => { setAmount(value); setCustomAmount(''); }}>₹{value.toLocaleString('en-IN')}</button>)}
              </div>
            </section>

            <section className="donation-section" aria-labelledby="donor-title">
              <h3 id="donor-title">Your information</h3>
              <div className="donation-fields two donation-information-fields">
                <label>Full name <b>*</b><input className="donation-control" type="text" name="name" autoComplete="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" required /></label>
                <label>Email address <b>*</b><input className="donation-control" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" required /></label>
                <label>Phone number <b>*</b><input className="donation-control" type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" required /></label>
              </div>
              <div className="donation-donor-options">
              <label className="donation-checkbox"><input type="checkbox" name="anonymous" checked={formData.anonymous} onChange={handleInputChange} />Donate anonymously</label>
              <details className="donation-extra">
                <summary>PAN, address & message <span>Optional</span></summary>
                <div className="donation-fields">
                  <label>PAN <span className="donation-optional">(for 80G certificate)</span><input className="donation-control" type="text" name="pan" value={formData.pan} onChange={handleInputChange} placeholder="ABCDE1234F" /></label>
                  <label>Address<input className="donation-control" type="text" name="address" autoComplete="street-address" value={formData.address} onChange={handleInputChange} placeholder="Street address" /></label>
                  <div className="donation-fields three">
                    <label>City<input className="donation-control" type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" /></label>
                    <label>State<input className="donation-control" type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" /></label>
                    <label>PIN code<input className="donation-control" type="text" name="pincode" inputMode="numeric" value={formData.pincode} onChange={handleInputChange} placeholder="PIN code" /></label>
                  </div>
                  <label>Message<textarea className="donation-control" name="message" rows="2" value={formData.message} onChange={handleInputChange} placeholder="Share a message of support" /></label>
                </div>
              </details>
              </div>
            </section>

            <section className="donation-section donation-confirmation" aria-labelledby="proof-title">
              <h3 id="proof-title">Payment confirmation</h3>
              <div className="donation-fields two">
                <label>Transaction ID <b>*</b>
                  <input className="donation-control" type="text" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="UPI / bank reference number" required />
                  <span className="donation-hint">Available in your payment app or bank statement.</span>
                </label>
                <div>
                  <span className="donation-label">Payment screenshot <b>*</b></span>
                  <div className="donation-upload-row">
                    <button type="button" className="donation-upload" onClick={() => fileInputRef.current?.click()}>
                      <FiUpload aria-hidden="true" /><span>{screenshotName || 'Upload screenshot'}</span>
                    </button>
                    {paymentScreenshot && <button type="button" className="donation-remove" aria-label="Remove screenshot" onClick={() => { setPaymentScreenshot(''); setScreenshotName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}><FiX /></button>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleScreenshotChange} className="donation-file-input" aria-label="Upload payment screenshot" tabIndex={-1} />
                  <span className="donation-hint">PNG, JPG or WebP · Maximum 5 MB</span>
                  {paymentScreenshot && <img className="donation-preview" src={paymentScreenshot} alt="Selected payment screenshot" />}
                </div>
              </div>
            </section>
          </div>

          <div className="donation-form-footer">
            <div><span>Your contribution</span><strong>₹{Number(currentAmount || 0).toLocaleString('en-IN')}</strong></div>
            <button type="submit" disabled={loading} className="donation-submit">{loading ? 'Submitting…' : 'Submit donation'}<FiArrowRight aria-hidden="true" /></button>
          </div>
        </section>

        <aside className="donation-payment-panel" aria-labelledby="payment-title">
          <div className="donation-panel-heading"><h2 id="payment-title"><FiCreditCard aria-hidden="true" /> Payment details</h2></div>
          <div className="donation-payment-scroll">
            <div className="donation-qr">
              <h3>Scan & pay</h3>
              <p>Pay by UPI or bank transfer, then share your receipt.</p>
              {settingsLoaded && qrImage ? <img src={qrImage} alt="Scan this QR code to donate" /> : <div className="donation-qr-placeholder">{settingsLoaded || settingsStatus === 'failed' ? 'QR code unavailable. Please use bank transfer below.' : 'Loading QR code…'}</div>}
              <span className="donation-upi-apps">Google Pay <i /> PhonePe <i /> Paytm</span>
              {qrImage && <button type="button" onClick={handleDownloadQr} className="donation-download"><FiDownload aria-hidden="true" /> Download QR</button>}
            </div>
            <div className="donation-bank-heading"><span>or bank transfer</span></div>
            <dl className="donation-bank-details">
              {[['Account holder', bankDetails.accountHolder], ['Bank', bankDetails.bank], ['Branch', bankDetails.branch], ['Account number', bankDetails.accountNo], ['IFSC code', bankDetails.ifscCode]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}
            </dl>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default DonationPage;
