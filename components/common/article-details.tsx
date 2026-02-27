import { PostSummary, formatDate, getReadTime } from "@/lib/transformPosts";
import { truncateText } from "@/lib/truncateText";
import Image from "next/image";
import type { FC, JSX } from "react";

interface Props {
  article: PostSummary;
  withThumbnail: boolean;
}

const ArticleDetails: FC<Props> = ({ article, withThumbnail }): JSX.Element => {
  return (
    <div
      className={
        withThumbnail && article.thumbnailUrl
          ? "w-full sm:relative sm:w-[320px] lg:w-[371px] bg-white rounded-lg overflow-hidden shadow-sm"
          : "flex flex-col"
      }
    >
      {withThumbnail && article.thumbnailUrl ? (
        <>
          {/* Thumbnail */}
          <div className="relative w-full aspect-video sm:h-[220px] lg:h-[298px] overflow-hidden">
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
          {/* Mobile: card below image. Desktop: badge overlay */}
          <div className="sm:absolute sm:top-0 sm:left-0 sm:right-0 sm:z-10 p-3 lg:p-4">
            <div className="sm:bg-white/95 sm:backdrop-blur-sm sm:rounded-lg sm:p-3 lg:p-4 sm:shadow-sm">
              <h3 className="text-xs lg:text-sm text-secondary opacity-50 uppercase">
                {article.category?.name}
              </h3>
              <h1 className="text-sm sm:text-base lg:text-xl leading-snug font-libre font-bold text-primary mt-0.5">
                {truncateText(article.title, 40)}
              </h1>
              <div className="flex flex-wrap text-secondary opacity-50 mt-1.5 gap-1.5 sm:gap-2 text-xs lg:text-sm">
                <span>{article.author?.name}</span>
                <span>&#9679;</span>
                <span>{formatDate(article.createdAt)}</span>
                <span>&#9679;</span>
                <span>{getReadTime(article.content)} min</span>
              </div>
              <p className="text-xs lg:text-sm text-primary/70 mt-1.5 leading-relaxed line-clamp-2">
                {truncateText(article.meta, 80)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-sm lg:text-xl text-secondary opacity-50 uppercase">
            {article.category.name}
          </h3>
          <h1 className="text-[20px] lg:text-[33px] leading-[25px] lg:leading-10 font-libre font-bold text-primary">
            {truncateText(article.title, 40)}
          </h1>
          <div className="flex text-secondary opacity-50 mt-3 mb-3.5 gap-2.5">
            <span className="text-sm lg:text-base mt-1">
              {article.author.name}
            </span>
            &#9679;
            <div>
              <span className="text-sm lg:text-base">
                {formatDate(article.createdAt)}
              </span>{" "}
              <span className="text-xs lg:text-sm">{`(${getReadTime(article.content)} mins read)`}</span>
            </div>
          </div>
          <p className="text-sm lg:text-base text-primary">
            {truncateText(article.meta, 100)}
          </p>
        </>
      )}
    </div>
  );
};

export default ArticleDetails;
