export const CoinOverviewFallback = () => {
  return (
    <div id="coin-overview-fallback">
      <div className="header">
        <div className="skeleton skeleton-avatar size-14" />
        <div className="info w-full max-w-[220px] space-y-2 pt-2">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-8 w-44" />
        </div>
      </div>
      <div className="skeleton mt-6 h-[380px] w-full" />
    </div>
  );
};

export const TrendingCoinsFallback = () => {
  return (
    <div id="trending-coins-fallback">
      <div className="skeleton h-6 w-40" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="skeleton skeleton-row" />
      ))}
    </div>
  );
};

export const CategoriesFallback = () => {
  return (
    <div id="categories-fallback">
      <div className="skeleton h-6 w-44" />
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="skeleton skeleton-row" />
      ))}
    </div>
  );
};
