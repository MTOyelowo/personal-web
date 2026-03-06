const ArticleItemSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 lg:gap-[37px] w-full">
      <div className="w-full sm:w-[180px] lg:w-[237px] aspect-video sm:aspect-auto sm:h-[140px] lg:h-[177px] rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
      </div>
    </div>
  );
};

const ArticleListSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full max-w-[1122px] gap-8 sm:gap-10 lg:gap-[120px]">
      <div className="flex w-full flex-col gap-6 sm:gap-9 lg:gap-[66px]">
        <ArticleItemSkeleton />
        <ArticleItemSkeleton />
        <ArticleItemSkeleton />
      </div>
    </div>
  );
};

export default ArticleListSkeleton;
