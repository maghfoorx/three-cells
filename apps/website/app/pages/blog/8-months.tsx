import { MDXProvider } from "@mdx-js/react";
import MDXPost from "./posts/8-months.mdx";
import type { Route } from "./+types";

const mdxComponents = {};

export function meta({}: Route.MetaArgs) {
  return [
    {
      title:
        "I Journaled Every Day for 8 Months Straight, and It Actually Changed Me",
    },
    {
      name: "description",
      content:
        "I was skeptical of journaling until I discovered the simple -2 to +2 daily rating system. Here is how tracking my days transformed my self-awareness and life satisfaction.",
    },
  ];
}

export default function BlogPostPage() {
  return (
    <article className="prose max-w-4xl">
      <MDXProvider components={mdxComponents}>
        <MDXPost />
      </MDXProvider>
    </article>
  );
}
