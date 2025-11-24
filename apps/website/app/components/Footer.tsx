import { Link } from "react-router";
import { AppStoreButton, WebButton } from "~/pages/home/components/CTAButtons";

export const Footer = () => {
  return (
    <section className="bg-black text-white py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          Ready to get your life together?
        </h2>
        <p className="mt-4 text-xl sm:text-2xl mb-8 sm:mb-12 text-gray-300 max-w-2xl mx-auto">
          stop app-hopping and started building better habits
        </p>

        <div className="flex flex-col gap-3 md:flex-row items-center justify-center">
          <AppStoreButton />
          <WebButton />
        </div>

        <div className="mt-2 sm:mt-4">
          <p className="text-gray-400 text-sm sm:text-base">
            Available on iPhone and Web
          </p>
        </div>
        <div className="flex flex-row gap-6 items-center justify-center mt-8">
          <Link
            to="/privacy"
            className="text-white"
            style={{
              color: "white",
            }}
            viewTransition
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-white"
            style={{
              color: "white",
            }}
            viewTransition
          >
            Terms of Service
          </Link>
          <a
            href="mailto:hello@three-cells.com"
            className=""
            style={{
              color: "white",
            }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};
export default Footer;
