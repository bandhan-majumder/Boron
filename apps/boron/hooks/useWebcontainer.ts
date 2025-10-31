import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

// Global singleton instance - only boot once per application
let webcontainerInstance: WebContainer | undefined;

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();

  useEffect(() => {
    // If already booted, use the existing instance
    if (webcontainerInstance) {
      setWebcontainer(webcontainerInstance);
      return;
    }

    // Boot WebContainer only once
    async function main() {
      const instance = await WebContainer.boot();
      webcontainerInstance = instance;
      setWebcontainer(instance);
    }

    main();
  }, []);

  return webcontainer;
}
