export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('gh-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (dateString = new Date()) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('gh-GH', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatID = (id) => {
  return `#${String(id).padStart(4, '0')}`;
};
