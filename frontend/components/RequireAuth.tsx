"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth";

export default function RequireAuth({ children }: PropsWithChildren) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
    } else {
      setOk(true);
    }
  }, []);

  if (!ok) return null; // ou um spinner
  return <>{children}</>;
}
