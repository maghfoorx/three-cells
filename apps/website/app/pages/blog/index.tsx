import { Link } from "react-router";
import type { Route } from "./+types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Three Cells - Blog" },
    {
      name: "description",
      content: "Thoughts on habits, consistency, and building a life you love.",
    },
  ];
}

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  published: string;
}

const getPosts = () => {
  const modules = import.meta.glob("./posts/*.mdx", { eager: true });
  const posts: BlogPost[] = [];

  for (const path in modules) {
    const mod = modules[path] as any;
    const slug = path.replace("./posts/", "").replace(".mdx", "");

    if (mod.title && mod.description) {
      posts.push({
        slug,
        title: mod.title,
        description: mod.description,
        published: mod.published || "1970-01-01", // Fallback date
      });
    }
  }
  return posts.sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
  );
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <div className="py-10 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Blog
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Thoughts on habits, consistency, and building a life you love.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col p-8 border border-gray-200 rounded-md hover:border-gray-300 hover:shadow-sm transition-all duration-300 bg-white hover:no-underline"
              viewTransition
              style={{ textDecoration: "none" }}
            >
              <div className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-black tracking-tight group-hover:underline">
                {post.title}
              </div>
              <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                {post.description}
              </p>

              <div className="flex items-center text-sm font-bold text-gray-900 mt-auto">
                Read Post
                <svg
                  className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
