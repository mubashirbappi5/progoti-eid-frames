import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import eidFrame from "@/assets/eid-frame1.png"; // new frame
import progotiLogo from "@/assets/progoti-logo.png";

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

        frameImg.onload = () => {

          // =========================
          // 🟡 CIRCLE IMAGE AREA
          // =========================
          const centerX = size / 2;
          const centerY = size / 2 - 120 * scale;
          const radius = 260 * scale;

          if (image) {
            const userImg = new Image();
            userImg.crossOrigin = "anonymous";

            userImg.onload = () => {

              ctx.save();

              // circle clip
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();

              // cover fit
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
              ctx.stroke();
            };

            userImg.src = image;
          }

          // =========================
          // 🖼 FRAME OVERLAY
          // =========================
          ctx.drawImage(frameImg, 0, 0, size, size);

          // =========================
          // ✨ NAME BOX
          // =========================
          if (name) {
            const boxWidth = 400 * scale;
            const boxHeight = 70 * scale;

            const boxX = size / 2 - boxWidth / 2;
            const boxY = size - 250 * scale;

            ctx.save();

            // box bg
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 20 * scale);
            ctx.fill();

            // border
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // text
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${32 * scale}px serif`;
            ctx.textAlign = "center";
            ctx.fillText(name, size / 2, boxY + 45 * scale);

            ctx.restore();
          }

          // =========================
          // 🔵 LOGO (BOTTOM RIGHT)
          // =========================
          const logo = new Image();
          logo.onload = () => {
            const s = 120 * scale;

            const lx = size - s - 30 * scale;
            const ly = size - s - 30 * scale;

            ctx.save();

            // white circle bg
            ctx.beginPath();
            ctx.arc(lx + s / 2, ly + s / 2, s / 2 + 5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            // clip
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
    link.download = "eid-frame.png";
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
          className="w-full rounded-lg shadow-xl"
          style={{ aspectRatio: "1/1" }}
        />

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
};

export default FrameGenerator;
