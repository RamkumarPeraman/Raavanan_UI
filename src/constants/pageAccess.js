export const pageGroups = [
  { label: 'Public pages', pages: [
    ['Home', '/', 'home'], ['Projects', '/projects', 'projects'], ['Events', '/events', 'events'],
    ['Volunteer', '/volunteer', 'volunteer'], ['Donate', '/donate', 'donate'], ['Blogs', '/blogs', 'blogs'],
    ['Reports', '/reports', 'reports'], ['Contact', '/contact', 'contact'], ['Our Story', '/our-story', 'our_story'],
    ['Key Figures', '/key-figures', 'key_figures'],
  ] },
  { label: 'Account pages', pages: [
    ['Profile', '/profile', 'profile'], ['My Impact', '/my-impact', 'my_impact'],
    ['Messages', '/messages', 'messages'], ['Notifications', '/notifications', 'notifications'],
    ['Settings', '/settings', 'settings'],
  ] },
  { label: 'Management pages', pages: [
    ['User Management', '/my-groups', 'my_groups'], ['Admin Dashboard', '/admin', 'admin'],
    ['Roles Management', '/roles', 'roles'],
  ] },
];

export const pagePermissions = pageGroups.flatMap(group => group.pages.map(([, , key]) => `page:${key}`));
export const pagePermissionByPath = Object.fromEntries(pageGroups.flatMap(group => group.pages.map(([, path, key]) => [path, `page:${key}`])));
export const accountFlowPages = [
  ['Login', '/login'], ['Sign Up', '/signup'], ['Forgot Password', '/forgot-password'], ['Verify Sign Up', '/verify-signup'],
];
