import { Link } from "react-router";
import { AppStoreButton, WebButton } from "~/pages/home/components/CTAButtons";

export const Footer = () => {
  return (
    <section className="bg-black text-white pt-16 pb-8 sm:pt-20 sm:pb-10">
      <div className="text-white max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center pb-16 border-b border-gray-800">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Ready to get your life together? 🚀
          </div>
          <div className="mt-4 text-xl sm:text-2xl mb-8 sm:mb-10 text-gray-300 max-w-2xl mx-auto">
            Stop app-hopping and start building better habits.
          </div>

          <div className="flex flex-col gap-3 md:flex-row items-center justify-center">
            <AppStoreButton />
            <WebButton />
          </div>

          <div className="text-gray-400 text-sm sm:text-base mt-2">
            Available on iPhone and Web
          </div>
        </div>

        {/* // --- 2. Bottom Section: Navigational Grid ---
         */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: App Info / Brand */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xl font-bold mb-3">Three Cells</h4>
            <p className="text-sm text-gray-400 max-w-xs">
              Self Improvement Made Simple. The minimal habit tracker, journal,
              and metrics app combined into one beautiful system.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              &copy; {new Date().getFullYear()} Three Cells. All rights
              reserved.
            </p>
          </div>

          {/* Column 2: Resources/Support */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@three-cells.com"
                  className="text-white ease-in-out text-sm"
                  style={{
                    color: "white",
                  }}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Blog Posts (New Column) */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Latest Posts</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/notion"
                  className="text-gray-400 hover:text-white transition duration-150 ease-in-out text-sm"
                  style={{
                    color: "white",
                  }}
                  viewTransition
                >
                  Notion for Habit Building
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition duration-150 ease-in-out text-sm"
                  style={{
                    color: "white",
                  }}
                  viewTransition
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition duration-150 ease-in-out text-sm"
                  style={{
                    color: "white",
                  }}
                  viewTransition
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
