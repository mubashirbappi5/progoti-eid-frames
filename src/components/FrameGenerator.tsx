import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import eidFrame from "@/assets/eid-frame1.png";

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

        // ✅ FIXED SRC (IMPORTANT)
        frameImg.src =
          typeof eidFrame === "string"
            ? eidFrame
            : (eidFrame as any).default;

        frameImg.onload = () => {
          const centerX = size / 2;
          const centerY = size / 2 - 120 * scale;
          const radius = 260 * scale;

          const drawAll = (userImg?: HTMLImageElement) => {
            // 🟡 IMAGE
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

              // 🟡 BORDER
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius + 8 * scale, 0, Math.PI * 2);
              ctx.lineWidth = 10 * scale;
              ctx.strokeStyle = "#FFD700";
              ctx.stroke();
            }

            // 🖼 FRAME LAST
            ctx.drawImage(frameImg, 0, 0, size, size);

            // ✨ NAME BOX
            if (name) {
              const boxWidth = 400 * scale;
              const boxHeight = 70 * scale;
              const boxX = size / 2 - boxWidth / 2;
              const boxY = size - 250 * scale;

              ctx.fillStyle = "rgba(255,255,255,0.15)";
              ctx.beginPath();
              ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 20 * scale);
              ctx.fill();

              ctx.strokeStyle = "#FFD700";
              ctx.lineWidth = 2 * scale;
              ctx.stroke();

              ctx.fillStyle = "#ffffff";
              ctx.font = `bold ${32 * scale}px serif`;
              ctx.textAlign = "center";
              ctx.fillText(name, size / 2, boxY + 45 * scale);
            }

            resolve();
          };

          // 🟢 IMAGE LOAD
          if (image) {
            const userImg = new Image();
            userImg.crossOrigin = "anonymous";
            userImg.src = image;

            userImg.onload = () => drawAll(userImg);
            userImg.onerror = () => drawAll();
          } else {
            drawAll();
          }
        };

        frameImg.onerror = () => resolve();
      });
    },
    [image, name]
  );

  // 👀 PREVIEW
  useEffect(() => {
    if (previewCanvasRef.current) {
      drawCanvas(previewCanvasRef.current, 0.4);
    }
  }, [drawCanvas]);

  // ⬇️ DOWNLOAD
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
