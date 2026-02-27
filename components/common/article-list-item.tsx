import type { FC, JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { PostSummary, formatDate } from "@/lib/transformPosts";
import { truncateText } from "@/lib/truncateText";

interface Props {
  article: PostSummary;
}

const ArticleListItem: FC<Props> = ({ article }): JSX.Element => {
  return (
    <>
      <Link
        href={`/post/${article.slug}`}
        className="flex flex-col sm:flex-row gap-4 sm:gap-5 lg:gap-[37px]"
      >
        {article.thumbnailUrl ? (
          <div className="relative w-full sm:w-[180px] lg:w-[237px] aspect-video sm:aspect-auto sm:h-[140px] lg:h-[177px] rounded-lg overflow-hidden shrink-0">
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full sm:w-[180px] lg:w-[237px] aspect-video sm:aspect-auto sm:h-[140px] lg:h-[177px] bg-linear-to-br from-gray-200 to-gray-300 rounded-lg shrink-0" />
        )}
        <div className="flex flex-col">
          <h3 className="text-xs sm:text-sm lg:text-xl text-secondary opacity-50 uppercase">
            {article.category?.name}
          </h3>
          <h1 className="text-lg sm:text-[20px] lg:text-[33px] leading-snug sm:leading-[25px] lg:leading-10 font-libre font-bold text-primary">
            {truncateText(article.title, 40)}
          </h1>
          <div className="flex flex-wrap text-secondary opacity-50 mt-1 sm:mt-[3px] mb-2 sm:mb-3.5 gap-1.5 sm:gap-2.5">
            <span className="text-xs sm:text-sm lg:text-base">
              {article.author?.name}
            </span>
            <span>&#9679;</span>
            <span className="text-xs sm:text-sm lg:text-base">
              {formatDate(article.createdAt)}
            </span>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-primary line-clamp-3">
            {truncateText(article.meta, 100)}
          </p>
        </div>
      </Link>
    </>
  );
};

export default ArticleListItem;
