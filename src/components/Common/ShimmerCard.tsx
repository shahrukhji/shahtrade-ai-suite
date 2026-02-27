import LoadingSkeleton from './LoadingSkeleton';

const ShimmerCard = () => (
  <div className="glass rounded-2xl p-4 space-y-3">
    <LoadingSkeleton height={16} width="60%" />
    <LoadingSkeleton height={28} width="40%" />
    <div className="grid grid-cols-2 gap-2">
      <LoadingSkeleton height={40} />
      <LoadingSkeleton height={40} />
      <LoadingSkeleton height={40} />
      <LoadingSkeleton height={40} />
    </div>
  </div>
);

export default ShimmerCard;
