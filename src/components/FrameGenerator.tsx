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

          const centerX = size / 2;
          const centerY = size / 2 - 130 * scale;
          const radius = 200 * scale;

          const drawFinal = (userImg?: HTMLImageElement) => {

            // =========================
            // 🖼 USER IMAGE
            // =========================
            if (userImg) {
              ctx.save();

              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.clip();

              const imgRatio = userImg.width / userImg.height;

              let drawW = radius * 2;
              let drawH = radius * 2;

              if (imgRatio > 1) drawW = drawH * imgRatio;
              else drawH = drawW / imgRatio;

              const dx = centerX - drawW / 2;
              const dy = centerY - drawH / 2;

              ctx.drawImage(userImg, dx, dy, drawW, drawH);
              ctx.restore();

              // ✨ GOLD BORDER GLOW
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius + 8 * scale, 0, Math.PI * 2);
              ctx.lineWidth = 10 * scale;
              ctx.strokeStyle = "#FFD700";
              ctx.shadowColor = "rgba(255,215,0,0.7)";
              ctx.shadowBlur = 20 * scale;
              ctx.stroke();
            }

            // =========================
            // 🖼 FRAME
            // =========================
            ctx.drawImage(frameImg, 0, 0, size, size);

            // =========================
            // ✨ PREMIUM NAME BOX
            // =========================
            if (name) {
              const boxWidth = 500 * scale;
              const boxHeight = 90 * scale;

              const boxX = size / 2 - boxWidth / 2;
              const boxY = size - 240 * scale;

              ctx.save();

              // 🌈 GOLD GRADIENT
              const gradient = ctx.createLinearGradient(
                boxX,
                boxY,
                boxX + boxWidth,
                boxY + boxHeight
              );

              gradient.addColorStop(0, "#FFD700");
              gradient.addColorStop(0.5, "#FFF3B0");
              gradient.addColorStop(1, "#E6B800");

              // box
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 30 * scale);
              ctx.fill();

              // glow border
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2 * scale;
              ctx.shadowColor = "rgba(255,255,255,0.6)";
              ctx.shadowBlur = 10 * scale;
              ctx.stroke();

              // ✨ TEXT SHADOW
              ctx.shadowBlur = 0;
              ctx.fillStyle = "#1a1a1a";
              ctx.font = `bold ${42 * scale}px 'Playfair Display', serif`;
              ctx.textAlign = "center";

              ctx.fillText(name.toUpperCase(), size / 2, boxY + 58 * scale);

              ctx.restore();
            }

            resolve();
          };

          // =========================
          // 🔥 IMAGE LOADING FIX
          // =========================
          if (image) {
            const userImg = new Image();
            userImg.crossOrigin = "anonymous";
            userImg.src = image;

            userImg.onload = () => drawFinal(userImg);
            userImg.onerror = () => drawFinal();
          } else {
            drawFinal();
          }
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
    link.href = canvasRef.current.toDataURL("image/png", 1);
    link.click();

    setIsGenerating(false);

    confetti({ particleCount: 150, spread: 90 });
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="space-y-6">

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed p-8 text-center rounded-xl cursor-pointer hover:bg-gray-50 transition"
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
            className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Download"
            )}
          </button>
        </div>

        {/* RIGHT */}
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
