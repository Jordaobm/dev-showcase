export const extractSecret = (uri: string): string | null => {
  const match = /[?&]secret=([^&]+)/.exec(uri);
  return match ? match[1] : null;
};
