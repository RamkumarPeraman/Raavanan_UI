export const projectId = (project) => project?.id || project?._id;

export const statusLabel = (status) => ({ ongoing: 'In progress', planned: 'Coming soon', completed: 'Completed' })[status?.toLowerCase()] || 'Project';

export const dateLabel = (value) => value && !Number.isNaN(new Date(value).getTime())
  ? new Date(value).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null;

export const moneyLabel = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const impactEntries = (project) => Object.entries(project?.impact || {})
  .filter(([, value]) => value !== null && value !== undefined && value !== '');

export const impactValue = (value) => typeof value === 'number' ? value.toLocaleString('en-IN') : String(value);

export const impactLabel = (label) => label.replace(/([A-Z])/g, ' $1');
