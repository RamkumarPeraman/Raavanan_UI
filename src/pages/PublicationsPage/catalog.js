// Illustrative catalog entries until confirmed publication details are available.
// edition, publicationYear, access ('free' or 'paid'), fee, and pdfUrl are
// populated for each real book when its confirmed details are supplied.
const sampleDetails = { edition: null, publicationYear: null, access: null, fee: null, pdfUrl: null };

export const books = [
  { id: 'voices-of-change', title: 'Voices of Change', subtitle: 'Stories from communities creating a better tomorrow', category: 'Community', format: 'Paperback', cover: 'coral', number: '01' },
  { id: 'roots-and-routes', title: 'Roots & Routes', subtitle: 'A journey through heritage, identity, and belonging', category: 'Culture', format: 'Paperback', cover: 'forest', number: '02' },
  { id: 'the-learning-circle', title: 'The Learning Circle', subtitle: 'Ideas and experiences from the world of education', category: 'Education', format: 'Paperback', cover: 'ochre', number: '03' },
  { id: 'tomorrows-leaders', title: "Tomorrow's Leaders", subtitle: 'Youth, service, and the courage to make a difference', category: 'Youth', format: 'Paperback', cover: 'indigo', number: '04' },
  { id: 'everyday-courage', title: 'Everyday Courage', subtitle: 'Small acts of care that strengthen a community', category: 'Community', format: 'Paperback', cover: 'rose', number: '05' },
  { id: 'a-place-to-grow', title: 'A Place to Grow', subtitle: 'Building opportunity through learning and connection', category: 'Education', format: 'Paperback', cover: 'teal', number: '06' },
].map((book) => ({ ...sampleDetails, ...book }));
