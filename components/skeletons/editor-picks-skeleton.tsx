const ArticleDetailsSkeleton = () => {
  return (
    <div className="w-[371px] h-[298px] rounded-lg bg-gray-200 animate-pulse transition ease-in-out" />
  );
};

const EditorsPickSkeleton = () => {
  return (
    <div className="max-w-[900px] flex flex-col items-center justify-center gap-[54px]">
      <ArticleDetailsSkeleton />
      <ArticleDetailsSkeleton />
      <ArticleDetailsSkeleton />
      <ArticleDetailsSkeleton />
    </div>
  );
};

export default EditorsPickSkeleton;
