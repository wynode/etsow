import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const copyToClipboard = async (val: string, toast: any) => {
  if (typeof val !== "string") {
    console.error("Invalid input: Input must be a string.");
    return;
  }

  try {
    await navigator.clipboard.writeText(val);
    toast({
      title: "复制成功",
    });
  } catch (error) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = val;
      Object.assign(textArea.style, {
        width: "0px",
        position: "fixed",
        left: "-9999px",
        top: "10px",
        opacity: "0",
        pointerEvents: "none",
        readonly: "readonly",
      });
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast({
        title: "复制成功",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "复制失败",
      });
    }
  }
};