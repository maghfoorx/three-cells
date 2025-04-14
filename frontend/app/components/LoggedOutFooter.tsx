import { Link } from "react-router";

export default function LoggedOutFooter() {
  return (
    <footer className="pt-10 pb-6 flex gap-2 text-sm">
      <Link to="/privacy" className="hover:underline">
        Privacy policy
      </Link>
      <Link to="/terms" className="hover:underline">
        Terms of service
      </Link>
    </footer>
  );
}
