const ProductSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-300 h-[300px] w-full">
        {/* Badge */}
        <div className="absolute top-3 left-3 h-6 w-16 bg-gray-400 rounded-full" />
      </div>

      {/* Content */}
      <div className="mt-3 space-y-2 px-1">
        {/* Category */}
        <div className="h-3 w-12 bg-gray-300 rounded" />

        {/* Title */}
        <div className="h-4 w-3/4 bg-gray-300 rounded" />

        {/* Price */}
        <div className="flex gap-2 items-center">
          <div className="h-4 w-16 bg-gray-300 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;