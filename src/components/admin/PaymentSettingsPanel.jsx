import CommonLoader from '../common/CommonLoader';
import { useRef } from 'react';
import { FaRupeeSign } from 'react-icons/fa';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';

const bankFields = [
  { key: 'accountHolder', label: 'Account Holder' },
  { key: 'bank', label: 'Bank Name' },
  { key: 'branch', label: 'Branch' },
  { key: 'accountNo', label: 'Account Number' },
  { key: 'ifscCode', label: 'IFSC Code' },
];

const PaymentSettingsPanel = ({ loading, qrImage, onQrChange, onQrRemove, bankDetails, onBankChange }) => {
  const qrFileRef = useRef(null);

  if (loading) {
    return <div className="flex min-h-full w-full items-center justify-center"><CommonLoader size="lg" label="Loading payment settings…" showLabel /></div>;
  }

  const removeQrImage = () => {
    onQrRemove();
    if (qrFileRef.current) qrFileRef.current.value = '';
  };

  return (
    <div className="grid min-h-full w-full gap-4 lg:grid-cols-2">
        <section className="flex min-h-[300px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><FiImage aria-hidden="true" /> Donation QR Code</h2>
          <p className="mt-1 text-xs text-gray-500">Shown on the public donation page for QR payments.</p>
          <div className="relative mt-3 min-h-[220px] flex-1">
            <button
              type="button"
              aria-label="Upload donation QR image"
              onClick={() => qrFileRef.current?.click()}
              className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-gray-300 p-3 text-center transition-colors hover:border-primary-400 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {qrImage ? (
                <img src={qrImage} alt="Donation QR code preview" className="max-h-64 max-w-full rounded border border-gray-200 object-contain" />
              ) : (
                <span className="text-gray-500">
                  <FiUpload aria-hidden="true" className="mx-auto mb-1 h-5 w-5" />
                  <span className="block text-xs font-medium">Click to upload QR image</span>
                  <span className="mt-0.5 block text-[11px]">PNG or JPG, up to 5 MB</span>
                </span>
              )}
            </button>
            {qrImage && (
              <button type="button" onClick={removeQrImage} aria-label="Remove QR image" data-tooltip="Remove QR image" className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700">
                <FiX aria-hidden="true" size={12} />
              </button>
            )}
          </div>
          <input ref={qrFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onQrChange} className="hidden" />
        </section>

        <section className="flex min-h-[300px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><FaRupeeSign aria-hidden="true" /> Bank Account Details</h2>
          <p className="mt-1 text-xs text-gray-500">Shown on the donation page for bank transfers.</p>
          <div className="mt-5 grid gap-4">
            {bankFields.map(({ key, label }) => (
              <div key={key} className="grid items-center gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-3">
                <label htmlFor={`payment-${key}`} className="text-sm font-medium text-gray-700">{label} :</label>
                <input
                  id={`payment-${key}`}
                  type="text"
                  value={bankDetails[key] || ''}
                  onChange={(event) => onBankChange(key, event.target.value)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>
    </div>
  );
};

export default PaymentSettingsPanel;
