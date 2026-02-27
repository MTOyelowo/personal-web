import { PostSummary, formatDate, getReadTime } from "@/lib/transformPosts";
import { truncateText } from "@/lib/truncateText";
import Image from "next/image";
import Link from "next/link";
import type { FC, JSX } from "react";

interface Props {
  article: PostSummary;
  position: string;
}

const Featured: FC<Props> = ({ article, position }): JSX.Element => {
  return (
    <div className="overflow-hidden rounded-xl lg:rounded-none">
      <Link href={`/post/${article.slug}`} className="block w-full relative">
        {/* Full-width thumbnail */}
        <div className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-auto lg:h-[592px] overflow-hidden bg-linear-to-br from-gray-200 to-gray-300">
          {article.thumbnailUrl && (
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Mobile: normal card below image. Desktop: absolute badge overlay */}
        <div
          className={`w-full lg:absolute lg:top-0 lg:w-[460px] lg:h-3/4 bg-white lg:bg-white/95 lg:backdrop-blur-sm flex flex-col justify-center px-5 py-4 lg:px-10 lg:py-0 ${position}`}
        >
          <h3 className="text-xs sm:text-sm lg:text-xl text-secondary opacity-50 uppercase">
            {article.category?.name}
          </h3>
          <h1 className="text-lg sm:text-[20px] lg:text-[33px] leading-snug sm:leading-[25px] lg:leading-10 font-libre font-bold text-primary mt-1">
            {truncateText(article.title, 50)}
          </h1>
          <div className="flex flex-wrap text-secondary opacity-50 mt-2 sm:mt-3 mb-2 sm:mb-3.5 gap-1.5 sm:gap-2.5">
            <span className="text-xs sm:text-sm lg:text-base">
              {article.author?.name}
            </span>
            <span className="hidden sm:inline">&#9679;</span>
            <span className="text-xs sm:text-sm lg:text-base">
              {formatDate(article.createdAt)}
            </span>
            <span>&#9679;</span>
            <span className="text-xs lg:text-sm">
              {getReadTime(article.content)} min read
            </span>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-primary line-clamp-3">
            {truncateText(article.meta, 120)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default Featured;
