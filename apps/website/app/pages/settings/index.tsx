import { api } from "@packages/backend/convex/_generated/api";
import { useAction } from "convex/react";
import { Button } from "~/components/ui/button";
import { useUser } from "~/lib/hooks/useUser";
import { LoaderCircle, CreditCard } from "lucide-react";
import React from "react";

export default function SettingsPage() {
  const user = useUser();
  const createPortalSession = useAction(api.stripe.createPortalSession);
  const [loading, setLoading] = React.useState(false);

  async function handleManageSubscription() {
    try {
      setLoading(true);
      const url = await createPortalSession();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-6 rounded-xl rounded-t-none p-4">
      {user?.stripeUserId && user?.isSubscribed && (
        <div className="rounded-md border bg-white/50 p-4 shadow-sm transition hover:shadow-md dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Subscription</h2>
              <p className="text-sm text-gray-500">
                You’re currently subscribed to a Three Cells!
              </p>
            </div>

            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Manage
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
