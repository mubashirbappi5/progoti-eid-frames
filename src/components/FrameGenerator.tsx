import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, X, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import eidFrame from "@/assets/eid-frame.png";
import progotiLogo from "@/assets/progoti-logo.jpg";

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

  // 🔥 DRAW FUNCTION
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

        frameImg.onload = () => {

          // =========================
          // 🔥 EXACT SHAPE CLIP PATH
          // =========================

          if (image) {
            const userImg = new Image();
            userImg.crossOrigin = "anonymous";

            userImg.onload = () => {

              // 🟡 Frame inner area (tuned for your design)
              const x = 90 * scale;
              const y = 85 * scale;
              const w = size - 180 * scale;
              const h = size - 280 * scale;

              const r = 120 * scale; // large smooth corners (match your frame)

              ctx.save();
              ctx.beginPath();

              // Top-left curve
              ctx.moveTo(x + r, y);
              ctx.lineTo(x + w - r, y);
              ctx.quadraticCurveTo(x + w, y, x + w, y + r);

              // Right side
              ctx.lineTo(x + w, y + h - r);
              ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

              // Bottom
              ctx.lineTo(x + r, y + h);
              ctx.quadraticCurveTo(x, y + h, x, y + h - r);

              // Left side
              ctx.lineTo(x, y + r);
              ctx.quadraticCurveTo(x, y, x + r, y);

              ctx.closePath();
              ctx.clip();

              // 🔥 COVER IMAGE
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
              ctx.restore();
            };

            userImg.src = image;
          }

          // =========================
          // 🖼 FRAME ON TOP
          // =========================
          ctx.drawImage(frameImg, 0, 0, size, size);

          // =========================
          // ✨ NAME TEXT
          // =========================
          if (name) {
            ctx.save();

            const textY = size - 150 * scale;

            const gradient = ctx.createLinearGradient(
              size / 2 - 200 * scale,
              textY,
              size / 2 + 200 * scale,
              textY
            );

            gradient.addColorStop(0, "#FFD700");
            gradient.addColorStop(0.5, "#FFF5CC");
            gradient.addColorStop(1, "#E6B800");

            ctx.font = `bold ${48 * scale}px 'Playfair Display', serif`;
            ctx.textAlign = "center";

            ctx.shadowColor = "rgba(255,215,0,0.6)";
            ctx.shadowBlur = 12 * scale;

            ctx.fillStyle = gradient;
            ctx.fillText(name, size / 2, textY);

            ctx.restore();
          }

          // =========================
          // 🔵 LOGO
          // =========================
          const logo = new Image();
          logo.onload = () => {
            const s = 100 * scale;
            const lx = size - s - 30 * scale;
            const ly = size - s - 30 * scale;

            ctx.save();
            ctx.beginPath();
            ctx.arc(lx + s / 2, ly + s / 2, s / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, lx, ly, s, s);
            ctx.restore();

            resolve();
          };

          logo.src = progotiLogo;
        };

        frameImg.src = eidFrame;
      });
    },
    [image, name]
  );

  // Preview
  useEffect(() => {
    if (previewCanvasRef.current) {
      drawCanvas(previewCanvasRef.current, 0.35);
    }
  }, [drawCanvas]);

  // Download
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    await drawCanvas(canvasRef.current, 1);

    const link = document.createElement("a");
    link.download = `eid-${name || "frame"}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();

    setIsGenerating(false);

    confetti({ particleCount: 120, spread: 80 });
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

        {/* LEFT */}
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

        {/* RIGHT */}
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
