import React, { useState, useEffect, useRef } from 'react';
import { FiHeart, FiDownload, FiUpload, FiX, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { ensurePaymentSettings, selectPaymentSettings } from '../../store/paymentSettingsStore';

const projectOptions = [
  { value: 'general', label: 'General Fund' },
  { value: 'education', label: 'Education for All' },
  { value: 'women', label: 'Women Empowerment' },
  { value: 'healthcare', label: 'Healthcare Initiative' },
  { value: 'environment', label: 'Environmental Conservation' },
];

const predefinedAmounts = [100, 500, 1000, 2000, 5000, 10000];

const DonationPage = () => {
  const dispatch = useDispatch();
  const { qrImage, bankDetails, status: settingsStatus } = useSelector(selectPaymentSettings);
  const settingsLoaded = settingsStatus === 'ready';

  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [project, setProject] = useState('general');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    pan: '',
    anonymous: false,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settingsStatus === 'idle' || settingsStatus === 'failed') {
      void dispatch(ensurePaymentSettings());
    }
  }, [dispatch, settingsStatus]);

  const handleAmountSelect = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    setCustomAmount(e.target.value);
    setAmount('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be under 5MB');
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPaymentScreenshot(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDownloadQr = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'donation-qr.png';
    link.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const donationData = {
        type: 'one-time',
        amount: parseFloat(donationAmount),
        project,
        paymentMethod: 'upi',
        transactionId: transactionId.trim(),
        paymentScreenshot,
        ...formData,
      };

      const response = await apiService.createDonation(donationData);

      if (response.success) {
        toast.success('Thank you! Your donation has been submitted. Admin will verify and confirm shortly.');
        setAmount('');
        setCustomAmount('');
        setTransactionId('');
        setPaymentScreenshot('');
        setScreenshotName('');
        setProject('general');
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          pan: '',
          anonymous: false,
          message: '',
        });
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
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your support empowers Raavana Thalaigal Trust to build a stronger, more aware Tamil youth movement.
          </p>
        </div>

        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 max-w-3xl mx-auto">
          <FiAlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm text-amber-800">
            <strong>Payment Gateway Notice:</strong> Our payment gateway is under construction. Please donate by yourself
            using the QR code or bank details below, then submit your payment details here.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="pan"
                    placeholder="PAN (for 80G certificate)"
                    value={formData.pan}
                    onChange={handleInputChange}
                    className="p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    name="anonymous"
                    checked={formData.anonymous}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700 text-sm">Donate anonymously</span>
                </label>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Address (Optional)</h3>
                <div className="space-y-4">
                  <textarea
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Message (Optional)</h3>
                <textarea
                  name="message"
                  placeholder="Leave a message of support..."
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Allocate to Project</h3>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  {projectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Bank Account Details</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Account Holder:</span>{' '}
                    <span className="text-gray-800">{bankDetails.accountHolder}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Bank:</span>{' '}
                    <span className="text-gray-800">{bankDetails.bank}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Branch:</span>{' '}
                    <span className="text-gray-800">{bankDetails.branch}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Account Number:</span>{' '}
                    <span className="text-gray-800 font-mono">{bankDetails.accountNo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">IFSC Code:</span>{' '}
                    <span className="text-gray-800 font-mono">{bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">QR Code Payment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Donation Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {predefinedAmounts.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAmountSelect(value)}
                          className={`py-3 px-2 rounded-lg border-2 transition-all text-sm font-medium ${
                            amount === value
                              ? 'border-primary-600 bg-primary-50 text-primary-600'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          Rs. {value.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder="Custom amount (INR)"
                      value={customAmount}
                      onChange={handleCustomAmount}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      min="1"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-5">
                    {settingsLoaded && qrImage ? (
                      <img
                        src={qrImage}
                        alt="Donation QR Code"
                        className="w-36 h-36 object-contain rounded border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center px-2">
                          {settingsLoaded ? 'QR not uploaded yet' : 'Loading...'}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-600">
                        Choose the amount you are paying, then scan to pay via UPI, PhonePe, or GPay.
                      </p>
                      {qrImage && (
                        <button
                          type="button"
                          onClick={handleDownloadQr}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm w-fit"
                        >
                          <FiDownload size={14} />
                          Download QR Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction ID</h3>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter UPI / Bank Transaction ID"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  You&apos;ll find this in your UPI app or bank statement after payment.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Screenshot</h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  {paymentScreenshot ? (
                    <div className="relative inline-block">
                      <img
                        src={paymentScreenshot}
                        alt="Payment screenshot preview"
                        className="max-h-48 mx-auto rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentScreenshot('');
                          setScreenshotName('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <FiUpload size={28} className="mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload screenshot</p>
                      <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                {screenshotName && !paymentScreenshot && (
                  <p className="text-xs text-gray-500 mt-1">{screenshotName}</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-base font-semibold"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <FiHeart />
                    Donate{currentAmount ? ` Rs. ${Number(currentAmount).toLocaleString()}` : ''}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Your donation will be verified by our team and confirmed via email.
              </p>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">How to Donate</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Fill in your information, address, and message if you want to share one.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Choose the project, select the amount, and complete the payment using bank details or QR.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Enter the transaction ID and upload your payment screenshot.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Submit the form and our team will verify the donation.</span>
                </li>
              </ol>
            </div>

            <div className="bg-primary-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-primary-800">Tax Benefits</h3>
              <p className="text-primary-700 mb-3 text-sm">
                All donations are eligible for tax exemption under Section 80G of the Income Tax Act.
              </p>
              <div className="text-sm text-primary-600 space-y-1">
                <p>50% tax exemption on donation amount</p>
                <p>80G certificate provided</p>
                <p>Registered Trust (Reg. No: 31/25)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
