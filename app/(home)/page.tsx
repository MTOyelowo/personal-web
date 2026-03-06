"use client";

import HeroSkeleton from "@/components/skeletons/hero-skeleton";
import {
  usePosts,
  useFeaturedPosts,
  useEditorPicks,
} from "@/hooks/common/usePosts";
import Featured from "./components/featured";
import EditorsPickSkeleton from "@/components/skeletons/editor-picks-skeleton";
import EditorsPick from "./components/editors-pick";
import Separator from "@/components/ui/separator";
import ArticleListSkeleton from "@/components/skeletons/articles-list-skeleton";
import ArticlesList from "./components/articles-list";
import DailyWords from "../features/daily-words";

export default function Home() {
  const { data: featuredPosts, isLoading: featuredLoading } =
    useFeaturedPosts(2);
  const { data: editorPicks, isLoading: picksLoading } = useEditorPicks(3);
  const {
    data: allPosts,
    isLoading: postsLoading,
    error: postsError,
  } = usePosts(1, 10);

  // IDs already shown in featured / editor's pick sections
  const shownIds = new Set([
    ...(featuredPosts ?? []).map((p) => p.id),
    ...(editorPicks ?? []).map((p) => p.id),
  ]);
  const articles = (allPosts ?? []).filter((p) => !shownIds.has(p.id));

  const hasFeatured =
    !featuredLoading && featuredPosts && featuredPosts.length > 0;
  const hasPicks = !picksLoading && editorPicks && editorPicks.length > 0;
  const hasArticles = !postsLoading && !postsError && articles.length > 0;

  return (
    <main className="flex flex-col gap-6 sm:gap-10 lg:gap-16 px-4 sm:px-[25px] font-space-grotesk">
      <DailyWords />
      <section>
        {featuredLoading ? <HeroSkeleton /> : null}

        {hasFeatured ? (
          <Featured
            article={featuredPosts[0]}
            position="lg:-top-[1px] lg:left-[45px]"
          />
        ) : null}
      </section>

      <section className="flex items-center justify-center mx-auto lg:mt-[50px]">
        {picksLoading ? <EditorsPickSkeleton /> : null}

        {hasPicks ? <EditorsPick editorPicks={editorPicks} /> : null}
      </section>
      <Separator />
      <section className="lg:mt-[62px]">
        {featuredLoading ? <HeroSkeleton /> : null}

        {hasFeatured && featuredPosts.length > 1 ? (
          <Featured
            article={featuredPosts[1]}
            position="lg:top-[54px] lg:right-[78px]"
          />
        ) : null}
      </section>
      <Separator />
      <section className="flex items-center justify-center mx-auto mb-6 sm:mb-10 lg:mt-[94px] lg:mb-[76px]">
        {postsLoading ? <ArticleListSkeleton /> : null}
        {hasArticles ? <ArticlesList articles={articles} /> : null}
      </section>
    </main>
  );
}
