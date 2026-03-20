import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import progotiLogo from "@/assets/progoti-logo.jpg";

// 🔥 ADVANCED ISLAMIC PATTERN
const drawAdvancedPattern = (ctx: CanvasRenderingContext2D, size: number) => {
  const gap = 80;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 215, 0, 0.15)";
  ctx.lineWidth = 1;

  for (let x = 0; x < size; x += gap) {
    for (let y = 0; y < size; y += gap) {
      ctx.beginPath();

      // 8-point star
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x + 6, y - 6);
      ctx.lineTo(x + 12, y);
      ctx.lineTo(x + 6, y + 6);
      ctx.lineTo(x, y + 12);
      ctx.lineTo(x - 6, y + 6);
      ctx.lineTo(x - 12, y);
      ctx.lineTo(x - 6, y - 6);

      ctx.closePath();
      ctx.stroke();

      // circle around
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
};

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

        // =========================
        // 🌌 BACKGROUND
        // =========================
        const bg = ctx.createLinearGradient(0, 0, 0, size);
        bg.addColorStop(0, "#0f2c59");
        bg.addColorStop(1, "#1e4c8f");

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);

        // ✨ PATTERN
        drawAdvancedPattern(ctx, size);

        // =========================
        // 📐 FRAME AREA
        // =========================
        const x = 120 * scale;
        const y = 120 * scale;
        const w = size - 240 * scale;
        const h = size - 380 * scale;
        const r = 140 * scale;

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

        // =========================
        // 🖼 IMAGE
        // =========================
        if (image) {
          const userImg = new Image();
          userImg.crossOrigin = "anonymous";

          userImg.onload = () => {
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

            // =========================
            // 🟡 BORDER
            // =========================
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

            ctx.lineWidth = 12 * scale;
            ctx.strokeStyle = "#FFD700";
            ctx.shadowColor = "rgba(255,215,0,0.6)";
            ctx.shadowBlur = 20 * scale;
            ctx.stroke();

            // =========================
            // ✨ TEXT
            // =========================
            ctx.shadowBlur = 0;

            const textY = size - 160 * scale;

            const gradient = ctx.createLinearGradient(
              size / 2 - 200 * scale,
              textY,
              size / 2 + 200 * scale,
              textY
            );

            gradient.addColorStop(0, "#FFD700");
            gradient.addColorStop(0.5, "#FFF5CC");
            gradient.addColorStop(1, "#E6B800");

            ctx.fillStyle = gradient;
            ctx.font = `bold ${55 * scale}px serif`;
            ctx.textAlign = "center";
            ctx.fillText("Eid Mubarak", size / 2, textY);

            if (name) {
              ctx.font = `bold ${40 * scale}px serif`;
              ctx.fillText(name, size / 2, textY + 55 * scale);
            }

            // =========================
            // 🔵 LOGO
            // =========================
            const logo = new Image();
            logo.onload = () => {
              ctx.drawImage(
                logo,
                size - 140 * scale,
                size - 140 * scale,
                100 * scale,
                100 * scale
              );
              resolve();
            };
            logo.src = progotiLogo;
          };

          userImg.src = image;
        } else {
          ctx.restore();
          resolve();
        }
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
    link.download = "eid-premium.png";
    link.href = canvasRef.current.toDataURL();
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
          className="w-full rounded-lg shadow-xl"
          style={{ aspectRatio: "1/1" }}
        />

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
};

export default FrameGenerator;
