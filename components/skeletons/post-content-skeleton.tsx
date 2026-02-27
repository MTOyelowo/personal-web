const PostContentSkeleton = () => {
  return (
    <>
      <div className="w-full aspect-video lg:h-[500px] bg-gray-200 animate-pulse transition ease-in-out" />
      <div className="flex flex-col gap-3 mt-8">
        <div className="w-full h-[50px] bg-gray-200 animate-pulse transition ease-in-out" />
        <div className="w-full h-[50px] bg-gray-200 animate-pulse transition ease-in-out" />
        <div className="w-full h-[50px] bg-gray-200 animate-pulse transition ease-in-out" />
        <div className="w-full h-[50px] bg-gray-200 animate-pulse transition ease-in-out" />
      </div>
    </>
  );
};

export default PostContentSkeleton;
