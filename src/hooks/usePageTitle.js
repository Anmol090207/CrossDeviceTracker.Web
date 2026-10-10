import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · CrossTime` : "CrossTime";
    return () => {
      document.title = "CrossTime";
    };
  }, [title]);
}
