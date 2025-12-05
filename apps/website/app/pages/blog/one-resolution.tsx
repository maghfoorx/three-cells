import { MDXProvider } from "@mdx-js/react";
import MDXPost from "./posts/one-resolution.mdx";
import type { Route } from "./+types";

const mdxComponents = {};

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "One Simple Resolution Turned My Life Around This Year",
    },
    {
      name: "description",
      content:
        "I transformed my life from zero books and no gym to a disciplined routine using the Diderot Effect. Here is how one small habit changed everything.",
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
