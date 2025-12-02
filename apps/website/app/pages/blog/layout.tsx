import { Outlet } from "react-router";
import Footer from "~/components/Footer";
import LoggedOutHeader from "~/components/LoggedOutHeader";

export default function BlogLayout() {
    return (
        <>
            <main className="max-w-4xl flex flex-col gap-4 items-center mx-auto px-4">
                <LoggedOutHeader />
                <article className="prose max-w-4xl w-full">
                    <Outlet />
                </article>
            </main>
            <div className="mt-8">
                <Footer />
            </div>
        </>
    );
}
