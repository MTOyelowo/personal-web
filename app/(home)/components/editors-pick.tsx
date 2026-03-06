import ArticleDetails from "@/components/common/article-details";
import { PostSummary } from "@/lib/transformPosts";
import type { FC, JSX } from "react";

interface Props {
  editorPicks: PostSummary[];
}

const EditorsPick: FC<Props> = ({ editorPicks }): JSX.Element => {
  return (
    <div className="w-full max-w-[900px] flex flex-col items-center justify-center gap-6 sm:gap-[34px] lg:gap-[54px]">
      <div className="w-fit flex flex-col gap-2 lg:gap-[17px] items-center justify-center">
        <h1 className="font-bold text-2xl sm:text-[30px] lg:text-[42px] leading-tight sm:leading-[38px] lg:leading-[58px] text-foreground">{`Editor's Picks`}</h1>
        <div className="w-[76%] border-[3px] lg:border-[5px] border-foreground/50" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-[50px] w-full">
        {editorPicks.map((item) => (
          <ArticleDetails key={item.id} article={item} withThumbnail={true} />
        ))}
      </div>
    </div>
  );
};

export default EditorsPick;
