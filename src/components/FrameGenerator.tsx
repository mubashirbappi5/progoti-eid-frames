import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import eidFrame from "@/assets/eid-frame.png";

const FrameGenerator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const drawCanvas = useCallback(
    (canvas: HTMLCanvasElement, scale = 1) => {
      return new Promise<void>((resolve) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve();

        const size = 1080 * scale; // 🔥 HIGH QUALITY
        canvas.width = size;
        canvas.height = size;

        const frameImg = new Image();
        frameImg.crossOrigin = "anonymous";

        frameImg.onload = () => {

          if (image) {
            const userImg = new Image();
            userImg.crossOrigin = "anonymous";

            userImg.onload = () => {

              // 🔥 Better tuned area
              const x = 95 * scale;
              const y = 95 * scale;
              const w = size - 190 * scale;
              const h = size - 300 * scale;
              const r = 110 * scale;

              ctx.save();
              ctx.beginPath();

              ctx.moveTo(x + r, y);
              ctx.lineTo(x + w - r, y);
              ctx.quadraticCurveTo(x + w, y, x + w, y + r);

              ctx.lineTo(x + w, y + h - r);
              ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

              ctx.lineTo(x + r, y + h);
              ctx.quadraticCurveTo(x, y + h, x, y + h - r);

              ctx.lineTo(x, y + r);
              ctx.quadraticCurveTo(x, y, x + r, y);

              ctx.closePath();
              ctx.clip();

              // 🔥 COVER IMAGE (NO BLUR)
              const imgRatio = userImg.width / userImg.height;
              const boxRatio = w / h;

              let drawW, drawH;

              if (imgRatio > boxRatio) {
                drawH = h;
                drawW = drawH * imgRatio;
              } else {
                drawW = w;
                drawH = drawW / imgRatio;
              }

              const dx = x - (drawW - w) / 2;
              const dy = y - (drawH - h) / 2;

              ctx.drawImage(userImg, dx, dy, drawW, drawH);

              // 🔥 SOFT BORDER BLEND
              const gradient = ctx.createRadialGradient(
                size / 2,
                size / 2,
                w / 2,
                size / 2,
                size / 2,
                w / 2 + 80 * scale
              );

              gradient.addColorStop(0.7, "rgba(0,0,0,0)");
              gradient.addColorStop(1, "rgba(0,0,0,0.25)");

              ctx.fillStyle = gradient;
              ctx.fillRect(x, y, w, h);

              ctx.restore();
            };

            userImg.src = image;
          }

          // 🔥 FRAME ON TOP
          ctx.drawImage(frameImg, 0, 0, size, size);

          // ✨ NAME
          if (name) {
            ctx.save();

            const y = size - 160 * scale;

            const gradient = ctx.createLinearGradient(
              size / 2 - 200 * scale,
              y,
              size / 2 + 200 * scale,
              y
            );

            gradient.addColorStop(0, "#FFD700");
            gradient.addColorStop(0.5, "#FFF5CC");
            gradient.addColorStop(1, "#E6B800");

            ctx.font = `bold ${50 * scale}px 'Playfair Display', serif`;
            ctx.textAlign = "center";

            ctx.shadowColor = "rgba(255,215,0,0.6)";
            ctx.shadowBlur = 10 * scale;

            ctx.fillStyle = gradient;
            ctx.fillText(name, size / 2, y);

            ctx.restore();
          }

          resolve();
        };

        frameImg.src = eidFrame;
      });
    },
    [image, name]
  );

  useEffect(() => {
    if (previewCanvasRef.current) {
      drawCanvas(previewCanvasRef.current, 0.4);
    }
  }, [drawCanvas]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    await drawCanvas(canvasRef.current, 1);

    const link = document.createElement("a");
    link.download = `eid-${name || "frame"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();

    setIsGenerating(false);

    confetti({ particleCount: 120, spread: 80 });
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

        <div className="space-y-6">

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed p-8 text-center rounded-xl cursor-pointer"
          >
            <Upload className="mx-auto mb-2" />
            <p>Upload Photo</p>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 border rounded-lg"
          />

          <button
            onClick={handleDownload}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {isGenerating ? <Loader2 className="animate-spin mx-auto" /> : "Download"}
          </button>
        </div>

        <canvas
          ref={previewCanvasRef}
          className="w-full rounded-lg"
          style={{ aspectRatio: "1/1" }}
        />

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
};

export default FrameGenerator;
