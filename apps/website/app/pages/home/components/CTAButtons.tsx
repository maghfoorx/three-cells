import { Globe2Icon } from "lucide-react";
import { Link } from "react-router";
import AppleLogo from "~/components/AppleLogo";

export const WebButton = () => {
  return (
    <Link
      to="/track"
      className="inline-flex justify-center items-center gap-3 px-5 py-3 bg-black text-white rounded-lg border-2 border-gray-700 hover:bg-gray-900 transition-colors plausible-event-name=Web+Button+Click"
    >
      <Globe2Icon className="w-8 h-8 flex-shrink-0" color="#d1d5dc" />

      <div className="flex flex-col items-start text-left leading-tight">
        <div className="text-[10px] font-normal text-white">Start on the</div>
        <div className="text-white font-semibold">Web Version</div>
      </div>
    </Link>
  );
};

export const AppStoreButton = () => {
  return (
    <a
      href="https://apps.apple.com/us/app/three-cells-your-life-system/id6747948986"
      className="inline-flex justify-center items-center gap-3 px-5 py-3 bg-white text-black rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors plausible-event-name=AppStore+Button+Click"
    >
      <AppleLogo width={32} height={32} className="flex-shrink-0" />

      <div className="flex flex-col items-start text-left leading-tight">
        <div className="text-[10px] font-normal text-gray-600">
          Download on the
        </div>
        <div className="text-gray-600 font-semibold">App Store</div>
      </div>
    </a>
  );
};
