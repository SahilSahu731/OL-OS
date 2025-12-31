"use client";

import { useState, useRef } from "react";
import { ContentNav } from "@/components/ContentNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ImageIcon } from "lucide-react";

export default function SocialImagePage() {
  const [title, setTitle] = useState("Amazing Content");
  const [subtitle, setSubtitle] = useState("@ol_os_official");
  const [fontSize, setFontSize] = useState([60]);
  const [bgColor, setBgColor] = useState(
    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
  );
  const [aspectRatio, setAspectRatio] = useState("16/9");

  const renderRef = useRef<HTMLDivElement>(null);

  const PRESETS = [
    { name: "Sunset", bg: "linear-gradient(to right, #ff7e5f, #feb47b)" },
    { name: "Ocean", bg: "linear-gradient(to right, #2b5876, #4e4376)" },
    { name: "Neon", bg: "linear-gradient(to right, #00c6ff, #0072ff)" },
    { name: "Midnight", bg: "linear-gradient(to right, #232526, #414345)" },
    { name: "Berry", bg: "linear-gradient(to right, #8e2de2, #4a00e0)" },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ContentNav />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        {/* CONTROLS */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Social Image Generator</h2>
            <p className="text-muted-foreground text-sm">
              Create quick assets for your posts.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Content Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Handle / Subtitle</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Background Preset</Label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESETS.map((p) => (
                    <div
                      key={p.name}
                      className="w-full h-8 rounded-md cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all"
                      style={{ background: p.bg }}
                      onClick={() => setBgColor(p.bg)}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Font Size: {fontSize}</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={20}
                  max={120}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Tabs value={aspectRatio} onValueChange={setAspectRatio}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="16/9">16:9</TabsTrigger>
                    <TabsTrigger value="1/1">1:1</TabsTrigger>
                    <TabsTrigger value="9/16">9:16</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Button
                className="w-full"
                onClick={() =>
                  alert(
                    "Export image functionality would go here (using html2canvas)"
                  )
                }
              >
                <Download className="w-4 h-4 mr-2" /> Download Image
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* VISUAL PREVIEW AREA */}
        <div className="lg:col-span-2 bg-muted/20 rounded-xl border border-dashed flex items-center justify-center p-8 overflow-hidden relative">
          <div className="absolute inset-0 z-0 bg-grid-white/10 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

          <div
            ref={renderRef}
            className="relative shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white transition-all duration-300 ease-in-out"
            style={{
              background: bgColor,
              aspectRatio: aspectRatio.replace("/", "/"),
              width: aspectRatio === "9/16" ? "auto" : "100%",
              height: aspectRatio === "9/16" ? "80%" : "auto",
              maxHeight: "600px",
              maxWidth: "800px",
            }}
          >
            <div className="absolute inset-0 bg-black/10" />{" "}
            {/* Texture overlay */}
            <div className="relative z-10 space-y-4">
              <h1
                className="font-extrabold tracking-tight leading-none drop-shadow-lg"
                style={{ fontSize: `${fontSize}px` }}
              >
                {title}
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                <span className="font-medium tracking-wide text-sm sm:text-base">
                  {subtitle}
                </span>
              </div>
            </div>
            {/* Branding Watermark */}
            <div className="absolute bottom-6 right-6 opacity-50">
              <ImageIcon className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
