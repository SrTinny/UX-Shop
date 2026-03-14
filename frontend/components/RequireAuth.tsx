"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { hydrateSession } from "@/lib/auth";

export default function RequireAuth({ children }: PropsWithChildren) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const user = await hydrateSession();
      if (!mounted) return;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setOk(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ok) return null; // ou um spinner
  return <>{children}</>;
}
