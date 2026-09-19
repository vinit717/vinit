import { useEffect, useRef } from "react";
import { attach, type PullOptions } from "@/lib/springs";

/**
 * Put an element in the cursor's field. It springs toward the hand, curls
 * slightly as it goes, and carries its velocity through if you change direction
 * mid-flight — which a CSS transition cannot do, because it restarts from zero
 * velocity every time its target moves.
 */
export function usePull<T extends HTMLElement = HTMLElement>(opts: PullOptions = {}) {
  const ref = useRef<T>(null);
  // keep the latest options without re-attaching on every render
  const o = useRef(opts);
  o.current = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attach(el, o.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
