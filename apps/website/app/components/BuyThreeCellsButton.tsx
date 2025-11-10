import { LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useAction } from "convex/react";
import type { FormEvent } from "react";
import React from "react";
import { cn } from "~/lib/utils";
import { api } from "@packages/backend/convex/_generated/api";

const BuyThreeCellsButton = ({
  className = "",
  title,
  product,
}: {
  className?: string;
  title?: string;
  product: "yearly" | "lifetime" | "monthly";
}) => {
  const [paymentUrlLoading, setPaymentUrlLoading] = React.useState(false);
  const payAndSendMessage = useAction(api.stripe.pay);
  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    setPaymentUrlLoading(true);
    const paymentUrl = await payAndSendMessage({ product: product });
    window.location.href = paymentUrl!;
  }

  return (
    <form onSubmit={handleSendMessage}>
      <Button
        className={cn(
          "relative z-10 w-full text-gray-900 hover:bg-gray-100 rounded-sm py-6 text-base font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
          className,
        )}
      >
        {paymentUrlLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoaderCircle className="animate-spin w-8 h-8" />
          </span>
        )}

        <span className={paymentUrlLoading ? "opacity-0" : "opacity-100"}>
          {title != null ? title : "Get Three Cells"}
        </span>
      </Button>
    </form>
  );
};
export default BuyThreeCellsButton;
