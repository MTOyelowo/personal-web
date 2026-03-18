"use client";

import type { FC, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

interface Tag {
  name: string;
  count: number;
}

const TagsList: FC = (): JSX.Element => {
  const { data: tags } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await axios.get("/api/tags");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!tags || tags.length === 0) return <></>;

  return (
    <div className="flex flex-col gap-[3px]">
      <h1 className="font-bold text-lg lg:text-xl text-foreground">tags</h1>
      <ul className="flex flex-row flex-wrap lg:flex-col gap-2 sm:gap-3 lg:gap-4 text-sm lg:text-base text-foreground">
        {tags.map((tag) => (
          <li key={tag.name}>
            <Link
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="hover:text-muted-foreground transition-colors"
            >
              {tag.name}
              <span className="ml-1 text-xs text-muted-foreground">
                ({tag.count})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagsList;
