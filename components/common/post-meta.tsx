import type { FC, JSX } from "react";

interface Props {
  author: string;
  date: string;
  readTime: number;
}

const PostMeta: FC<Props> = ({ author, date, readTime }): JSX.Element => {
  return (
    <div className="flex items-center justify-center text-secondary opacity-50 mt-1 lg:mt-2.5 mb-3.5 gap-1 lg:gap-2.5">
      <span className="text-sm lg:text-base mt-1">{author}</span>
      &#9679;
      <div className="">
        <span className="text-sm lg:text-base">{date}</span>{" "}
        <span className="text-xs lg:text-sm">{`(${readTime} mins read)`}</span>
      </div>
    </div>
  );
};

export default PostMeta;
