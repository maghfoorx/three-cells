import { MDXProvider } from "@mdx-js/react";
import MDXPost from "./posts/dont-procrastinate.mdx";
import type { Route } from "./+types";

const mdxComponents = {};

export function meta({}: Route.MetaArgs) {
  return [
    {
      title:
        "Don't procrastinate because you always want a fresh start. Just start whenever on that day",
    },
    {
      name: "description",
      content:
        "Sometimes it's important to remember that it's not a crime to end up doing something later than you intended on that day.",
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
