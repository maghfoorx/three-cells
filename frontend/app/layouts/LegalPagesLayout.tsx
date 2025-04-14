import { Link, Outlet } from "react-router";
import AppLogoIcon from "~/components/AppLogoIcon";
import LoggedOutFooter from "~/components/LoggedOutFooter";
import LoggedOutHeader from "~/components/LoggedOutHeader";

export default function LegalPagesLayout() {
  return (
    <main className="flex flex-col gap-4 items-center mx-auto px-4">
      <LoggedOutHeader />
      <Outlet />
      <LoggedOutFooter />
    </main>
  );
}
