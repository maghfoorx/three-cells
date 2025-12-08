import { MDXProvider } from "@mdx-js/react";
import MDXPost from "./posts/must-journal.mdx";
import type { Route } from "./+types";

const mdxComponents = {};

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "You Must Journal. It's a Non Negotiable.",
    },
    {
      name: "description",
      content: "",
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
