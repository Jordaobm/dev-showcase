export const getSessionBannerClass = (
  isRefreshing: boolean,
  isExpired: boolean,
  isExpiring: boolean,
) => {
  if (isRefreshing) return "bg-blue-50 border-blue-200 text-blue-900";
  if (isExpired) return "bg-red-50 border-red-200 text-red-900";
  if (isExpiring) return "bg-orange-50 border-orange-200 text-orange-900";
  return "bg-amber-50 border-amber-200 text-amber-900";
};
