import { useState, useEffect } from "react";

import { Loader2 } from "lucide-react";

export default function Teach({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.onload = () => setIsLoading(false);
    }
  }, []);

  return (
    <div className="mt-[-8px]">
      {isLoading && (
        <div className="flex justify-center mt-20">
          <Loader2 className="h-20 w-20 animate-spin" />
        </div>
      )}
      <iframe
        src={url}
        className="h-[608px] w-full"
        style={{ display: isLoading ? "none" : "block" }}
      ></iframe>
    </div>
  );
}
