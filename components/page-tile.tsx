"use client";

import { useState, useEffect } from "react";
import { Page404 } from "@/lib/actions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Code, Eye, EyeOff, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "@/lib/motion";
import { formatDistanceToNow } from "date-fns";

interface PageTileProps {
  page: Page404;
}

export function PageTile({ page }: PageTileProps) {
  const [viewMode, setViewMode] = useState<"preview" | "html" | "nextjs">(
    "preview"
  );
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const copyToClipboard = async (
    text: string,
    type: "HTML" | "Next.js Component"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} code copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const timeAgo = formatDistanceToNow(new Date(page.createdAt), {
    addSuffix: true,
  });

  const handleQuickCopy = (e: React.MouseEvent, type: "html" | "nextjs") => {
    e.stopPropagation();
    const content = type === "html" ? page.htmlVersion : page.nextjsVersion;
    const label = type === "html" ? "HTML" : "Next.js Component";
    copyToClipboard(content, label);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
        transform: "translateY(-2px)",
      }}
      className="h-full w-full max-w-full" // Ensure full width responsiveness
    >
      <Card className="h-full w-full overflow-hidden border border-border/50 bg-card/90 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 group flex flex-col">
        {/* Header with quick actions */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              404 Page • {timeAgo}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleQuickCopy(e, "html")}
              className="h-7 px-2 text-xs hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50"
            >
              <Copy className="h-3 w-3 mr-1" />
              HTML
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleQuickCopy(e, "nextjs")}
              className="h-7 px-2 text-xs hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/50"
            >
              <Code className="h-3 w-3 mr-1" />
              React
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-w-[40px] hover:border-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 transition-all"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0 relative flex-1 min-h-0">
          {" "}
          {/* Use flex-1 for dynamic height */}
          {/* Responsive preview container */}
          <div
            className={`w-full transition-all duration-300 h-[32rem]  md:h-[24rem] lg:h-[20rem]`}
          >
            {viewMode === "preview" && isMounted ? (
              <div className="h-full w-full relative group/preview">
                <div className="relative w-full h-full overflow-hidden">
                  <iframe
                    srcDoc={page.htmlVersion}
                    className="w-full h-full bg-white dark:bg-gray-900 scale-100 origin-top-left"
                    title="404 Page Preview"
                    sandbox="allow-same-origin"
                    style={{ transform: "scale(1)" }} // Scale down for non-expanded view
                  />
                </div>

                {/* Floating view mode switcher */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewMode("html")}
                    className="h-7 px-2 text-xs shadow-md"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    HTML
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewMode("nextjs")}
                    className="h-7 px-2 text-xs shadow-md"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    JSX
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewMode("preview")}
                    className="h-7 px-2 text-xs shadow-md"
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>

                <div className="h-full overflow-auto p-4 bg-muted/10">
                  <pre className="text-xs font-mono leading-relaxed">
                    <code className="language-typescript">
                      {viewMode === "html"
                        ? page.htmlVersion
                        : page.nextjsVersion}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Prompt and main actions */}
        <CardFooter className="flex flex-col gap-3 p-4 border-t bg-gradient-to-r from-muted/30 to-muted/10 shrink-0">
          <p className="text-sm text-muted-foreground line-clamp-2 text-center">
            {page.prompt}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
