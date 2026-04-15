"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertCircle } from "lucide-react";

type Props = {
  widgetToken: string;
  hasActiveSubscription: boolean;
  hasProducts: boolean;
};

export function EmbedCodeBlock({
  widgetToken,
  hasActiveSubscription,
  hasProducts,
}: Props) {
  const [copied, setCopied] = useState(false);

  const scriptTag = `<script type="text/javascript" src="https://ai-cleaning-admin.vercel.app/widget.js?t=${widgetToken}" defer></script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasActiveSubscription) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3 text-amber-600 mb-3">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Subscription Required</h2>
        </div>
        <p className="text-muted-foreground">
          Activate a subscription plan to get your widget embed code.
        </p>
      </div>
    );
  }

  if (!hasProducts) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3 text-amber-600 mb-3">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Products Required</h2>
        </div>
        <p className="text-muted-foreground">
          Upload products to your project before embedding the widget.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Widget Embed Code</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Add this script tag to your website to embed the AI search widget:
      </p>
      <div className="relative">
        <pre className="rounded-lg bg-slate-900 p-4 text-sm text-green-400 overflow-x-auto">
          <code>{scriptTag}</code>
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3" /> Copied!
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" /> Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
