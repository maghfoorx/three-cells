import { MDXProvider } from "@mdx-js/react";
import MDXPost from "./posts/28-books.mdx";
import type { Route } from "./+types";

const mdxComponents = {};

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "I Read 28 Books in 12 Months. Here Is What Actually Worked.",
    },
    {
      name: "description",
      content:
        "After years of buying books but never finishing them, I finally found a system to become a consistent reader. Here are the 4 changes that transformed my reading habits.",
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
