"use client";

import { useEffect, useState } from "react";

/** True after the client has mounted — App Router action queue is ready. */
export function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
