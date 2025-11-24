import { MDXProvider } from "@mdx-js/react";
import NotionMDX from "./posts/notion.mdx";
import Footer from "~/components/Footer";

import LoggedOutHeader from "~/components/LoggedOutHeader";
import BlogAdCard from "./components/BlogAdCard";

// Custom components for MDX styling
const mdxComponents = {
  BlogAdCard,
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
