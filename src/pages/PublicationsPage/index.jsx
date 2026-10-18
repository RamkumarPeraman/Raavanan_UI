import React, { useMemo, useState } from 'react';
import { FiArrowRight, FiBookOpen, FiDownload, FiMail, FiSearch } from 'react-icons/fi';
import { books } from './catalog';
import './publications.css';

const categories = ['All books', ...new Set(books.map((book) => book.category))];
const enquiryAddress = 'enquiry.raavanathalaigal@gmail.com';

const enquiryLink = `mailto:${enquiryAddress}?subject=${encodeURIComponent('Publication availability enquiry')}`;
const orderLink = (book) => `mailto:${enquiryAddress}?subject=${encodeURIComponent(`Order enquiry: ${book.title}`)}&body=${encodeURIComponent(`Hello,\n\nI would like to order "${book.title}". Please share the payment and delivery steps.\n\nThank you.`)}`;
const formatFee = (fee) => Number.isFinite(Number(fee)) && fee !== null && fee !== ''
  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(fee))
  : 'To be confirmed';

const BookCover = ({ book }) => (
  <div className={`publication-cover publication-cover--${book.cover}`} aria-hidden="true">
    <div className="publication-cover__spine" />
    <div className="publication-cover__content">
      <span className="publication-cover__series">Raavana Thalaigal Trust</span>
      <div className="publication-cover__art"><span /><span /><span /></div>
      <span className="publication-cover__title">{book.title}</span>
      <span className="publication-cover__number">Publication {book.number}</span>
    </div>
  </div>
);

const PublicationsPage = () => {
  const [category, setCategory] = useState('All books');
  const [search, setSearch] = useState('');
  const visibleBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) =>
      (category === 'All books' || book.category === category)
      && (!query || `${book.title} ${book.subtitle} ${book.category}`.toLowerCase().includes(query)));
  }, [category, search]);

  return (
    <div className="min-h-full bg-[#faf8f3] text-ink-950">
      <section className="container-custom pb-20 pt-9" aria-labelledby="book-list-title">
        <div className="flex flex-col gap-5 border-b border-[#e4ddd2] pb-6 lg:flex-row lg:items-end lg:justify-between">          
          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">Search publications</span>
            <FiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search books or topics" className="h-11 w-full rounded-lg border border-[#ded8cd] bg-white pl-11 pr-4 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/15" />
          </label>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter books by category">
          {categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? 'border-primary-800 bg-primary-800 text-white' : 'border-[#ded8cd] bg-white text-ink-700 hover:border-primary-600 hover:text-primary-800'}`}>{item}</button>)}
        </div>

        {visibleBooks.length > 0 ? <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleBooks.map((book) => <article key={book.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e8dfd2] bg-white shadow-[0_16px_40px_-30px_rgba(9,42,43,0.45)] transition hover:-translate-y-1 hover:shadow-[0_22px_45px_-28px_rgba(9,42,43,0.3)]">
            <div className="publication-card-stage"><BookCover book={book} /></div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-700"><span>{book.category}</span><span className="text-ink-500">{book.format}</span></div>
              <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-ink-950">{book.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-600">{book.subtitle}</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-[#faf8f3] p-4 text-sm">
                <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Edition</dt><dd className="mt-1 font-semibold text-ink-900">{book.edition || 'To be confirmed'}</dd></div>
                <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Published</dt><dd className="mt-1 font-semibold text-ink-900">{book.publicationYear || 'To be confirmed'}</dd></div>
                <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Access</dt><dd className="mt-1 font-semibold text-ink-900">{book.access === 'free' ? 'Free' : book.access === 'paid' ? 'Paid' : 'To be confirmed'}</dd></div>
                {book.access === 'paid' && <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Fee</dt><dd className="mt-1 font-semibold text-ink-900">{formatFee(book.fee)}</dd></div>}
              </dl>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eee8df] pt-4">
                {book.access === 'free' && book.pdfUrl
                  ? <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open PDF for ${book.title}`} title="Open PDF" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary-700 text-primary-800 transition hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"><FiDownload size={20} aria-hidden="true" /></a>
                  : <button type="button" disabled className="inline-flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-lg border border-[#e4ddd2] bg-[#f6f2eb] text-ink-400" title={book.access === 'paid' ? 'Available after purchase' : 'PDF not yet available'} aria-label={book.access === 'paid' ? 'PDF available after purchase' : 'PDF not yet available'}><FiDownload size={20} aria-hidden="true" /></button>}
                <a href={book.access === 'paid' ? orderLink(book) : enquiryLink} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800">{book.access === 'paid' ? 'Request to buy' : book.access === 'free' ? 'Ask about this book' : 'Ask about books'} <FiArrowRight aria-hidden="true" /></a>
              </div>
            </div>
          </article>)}
        </div> : <div className="mt-7 rounded-xl border border-[#e4ddd2] bg-white px-6 py-16 text-center"><FiBookOpen className="mx-auto text-primary-700" size={30} aria-hidden="true" /><h3 className="mt-4 text-xl font-bold">No books found</h3><p className="mt-2 text-sm text-ink-600">Try another search or category.</p><button type="button" onClick={() => { setSearch(''); setCategory('All books'); }} className="mt-5 rounded-lg bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white">Show all books</button></div>}
      </section>

      <section className="bg-[#103638] text-white" aria-label="Publication enquiries">
        <div className="container-custom flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-display text-2xl font-bold">Looking for a particular publication?</h2><p className="mt-2 text-sm leading-6 text-white/75">Write to us for availability, pricing, and delivery information.</p></div>
          <a href={`mailto:${enquiryAddress}?subject=${encodeURIComponent('Publication enquiry')}`} className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-accent-400 px-5 py-3 font-bold text-primary-950 transition hover:bg-accent-300"><FiMail aria-hidden="true" /> Contact us</a>
        </div>
      </section>
    </div>
  );
};

export default PublicationsPage;
