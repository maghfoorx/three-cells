import { MDXProvider } from "@mdx-js/react";
import NotionMDX from "./posts/notion.mdx";
import Footer from "~/components/Footer";

import LoggedOutHeader from "~/components/LoggedOutHeader";
import BlogAdCard from "./components/BlogAdCard";
import type { MetaFunction } from "react-router";

// Custom components for MDX styling
const mdxComponents = {
  BlogAdCard,
};

export const meta: MetaFunction = () => {
  return [
    {
      title:
        "Is Notion the Best Habit Tracker? The Truth About Tracking Habits in Notion",
    },
    {
      name: "description",
      content:
        "Your Notion habit tracker might be the reason you’re inconsistent. See why flexible dashboards fail and how a dedicated, simple system helps you build habits that last.",
    },
  ];
};

export default function NotionBlogPostPage() {
  return (
    <>
      <main className=" max-w-4xl flex flex-col gap-4 items-center mx-auto px-4">
        <LoggedOutHeader />
        <article className="prose max-w-4xl">
          <MDXProvider components={mdxComponents}>
            <NotionMDX />
          </MDXProvider>
        </article>
      </main>
      <div className="mt-8">
        <Footer />
      </div>
    </>
  );
}
