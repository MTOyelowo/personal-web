import ArticleListItem from "@/components/common/article-list-item";
import TagsList from "@/components/common/tags-list";
import { PostSummary } from "@/lib/transformPosts";
import type { FC, JSX } from "react";

interface Props {
  articles: PostSummary[];
}

const ArticlesList: FC<Props> = ({ articles }): JSX.Element => {
  return (
    <div className="flex flex-col lg:flex-row w-full max-w-[1122px] gap-6 sm:gap-8 lg:gap-[120px]">
      <div className="flex flex-col gap-6 sm:gap-9 lg:gap-[66px]">
        {articles.map((item, index) => (
          <ArticleListItem key={index} article={item} />
        ))}
      </div>
      <TagsList />
    </div>
  );
};

export default ArticlesList;
