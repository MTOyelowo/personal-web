const ArticleItemSkeleton = () => {
  return (
    <div className="flex gap-[37px] w-full h-[177px] rounded-lg bg-gray-200 transition ease-in-out " />
  );
};

const ArticleListSkeleton = () => {
  return (
    <div className="flex flex-row w-full max-w-[1122px] h-full gap-[120px]">
      <div className="flex w-full flex-col gap-[66px]">
        <ArticleItemSkeleton />
        <ArticleItemSkeleton />
        <ArticleItemSkeleton />
        <ArticleItemSkeleton />
        <ArticleItemSkeleton />
      </div>
    </div>
  );
};

export default ArticleListSkeleton;
