import { Link } from "react-router";

interface BlogPost {
    slug: string;
    title: string;
    description: string;
}

// Helper to get posts from MDX files
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
            });
        }
    }
    return posts;
};

export default function BlogIndex() {
    const posts = getPosts();

    return (
        <div className="py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
            <div className="grid gap-8">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        to={`/blog/${post.slug}`}
                        className="block p-6 border rounded-lg hover:border-blue-500 transition-colors no-underline"
                        viewTransition
                    >
                        <h2 className="text-2xl font-semibold mb-2 mt-0">{post.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-0">
                            {post.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
