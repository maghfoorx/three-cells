import { useEffect, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { toast } from "sonner";

export default function PromptClientToRefresh() {
  const gitShaValue = useQuery(api.gitSha.getGitShaValue);
  const initialGitShaRef = useRef<string | null>(null);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (!gitShaValue) return;

    if (!initialGitShaRef.current) {
      initialGitShaRef.current = gitShaValue;
      return;
    }

    if (
      initialGitShaRef.current &&
      gitShaValue !== initialGitShaRef.current &&
      !toastShownRef.current
    ) {
      toast.warning("A new version is available. Please refresh the page :)", {
        position: "top-right",
        duration: Infinity,
        action: {
          label: "Refresh",
          onClick: () => {
            window.location.reload();
          },
        },
      });

      toastShownRef.current = true;
    }
  }, [gitShaValue]);

  return null;
}
