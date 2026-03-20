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

        const size = 1080 * scale;
        canvas.width = size;
        canvas.height = size;

        const frameImg = new Image();
        frameImg.crossOrigin = "anonymous";
        frameImg.src = eidFrame;

        frameImg.onload = () => {

          // =========================
          // 🟡 PERFECT ROUND IMAGE
          // =========================
          const centerX = size / 2;
          const centerY = size / 2 - 120 * scale;
          const radius = 250 * scale;

          if (image) {
            const userImg = new Image();
            userImg.crossOrigin = "anonymous";
            userImg.src = image;

            userImg.onload = () => {
              ctx.save();

              // 🔥 PERFECT CIRCLE CLIP
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();

              // COVER FIT
              const imgRatio = userImg.width / userImg.height;

              let drawW = radius * 2;
              let drawH = radius * 2;

              if (imgRatio > 1) {
                drawW = drawH * imgRatio;
              } else {
                drawH = drawW / imgRatio;
              }

              const dx = centerX - drawW / 2;
              const dy = centerY - drawH / 2;

              ctx.drawImage(userImg, dx, dy, drawW, drawH);

              ctx.restore();

              // 🟡 GOLD BORDER
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius + 8 * scale, 0, Math.PI * 2);
              ctx.lineWidth = 10 * scale;
              ctx.strokeStyle = "#FFD700";
              ctx.shadowColor = "rgba(255,215,0,0.6)";
              ctx.shadowBlur = 15 * scale;
              ctx.stroke();
            };
          }

          // =========================
          // 🖼 FRAME TOP
          // =========================
          ctx.drawImage(frameImg, 0, 0, size, size);

          // =========================
          // ✨ NAME BOX (PREMIUM)
          // =========================
          if (name) {
            const boxWidth = 450 * scale;
            const boxHeight = 80 * scale;

            const boxX = size / 2 - boxWidth / 2;
            const boxY = size - 240 * scale;

            ctx.save();

            // 🔥 GRADIENT BOX
            const gradient = ctx.createLinearGradient(
              boxX,
              boxY,
              boxX + boxWidth,
              boxY
            );

            gradient.addColorStop(0, "#FFD700");
            gradient.addColorStop(1, "#E6B800");

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 25 * scale);
            ctx.fill();

            // BORDER
            ctx.lineWidth = 3 * scale;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // TEXT
            ctx.fillStyle = "#000";
            ctx.font = `bold ${36 * scale}px serif`;
            ctx.textAlign = "center";
            ctx.fillText(name, size / 2, boxY + 52 * scale);

            ctx.restore();
          }

          resolve();
        };
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
