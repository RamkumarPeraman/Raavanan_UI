import tamil from './ta.json';

const pageByPath = {
  '/': 'home', '/donate': 'donate', '/volunteer': 'volunteer', '/publications': 'publications',
  '/events': 'events', '/reports': 'reports', '/blogs': 'blogs', '/contact': 'contact',
  '/our-story': 'ourStory', '/key-figures': 'keyFigures', '/login': 'login',
  '/signup': 'signup', '/forgot-password': 'forgotPassword', '/verify-signup': 'verifySignup',
  '/profile': 'profile', '/my-impact': 'myImpact', '/messages': 'messages',
  '/notifications': 'notifications', '/settings': 'settings', '/my-groups': 'userGroups',
  '/admin': 'admin', '/roles': 'roles', '/wings': 'wings', '/project-forms': 'projectForms',
};

export const pageNameForPath = (pathname) => pageByPath[pathname] || 'common';

export const translate = (page, english, language) => {
  if (language !== 'ta' || typeof english !== 'string') return english;
  return tamil[page]?.[english] || tamil.common[english] || tamil.footer[english] || english;
};
