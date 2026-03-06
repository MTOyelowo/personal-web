const ArticleDetailsSkeleton = () => {
  return (
    <div className="w-full sm:w-[320px] lg:w-[371px] aspect-video sm:h-[220px] lg:h-[298px] rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse transition ease-in-out" />
  );
};

const EditorsPickSkeleton = () => {
  return (
    <div className="w-full max-w-[900px] flex flex-col items-center justify-center gap-5 sm:gap-6 lg:gap-[54px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-[50px] w-full">
        <ArticleDetailsSkeleton />
        <ArticleDetailsSkeleton />
        <ArticleDetailsSkeleton />
      </div>
    </div>
  );
};

export default EditorsPickSkeleton;
