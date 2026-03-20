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

  // ================= FILE UPLOAD =================
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ================= DRAW FUNCTION =================
  const drawCanvas = useCallback(
    (canvas: HTMLCanvasElement, scale = 1) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 1080 * scale;
      canvas.width = size;
      canvas.height = size;

      const frameImg = new Image();
      frameImg.src = eidFrame;

      frameImg.onload = () => {
        const centerX = size / 2;
        const centerY = size / 2 - 130 * scale;
        const radius = 200 * scale;

        const drawAll = (userImg?: HTMLImageElement) => {
          ctx.clearRect(0, 0, size, size);

          // ===== IMAGE =====
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

            // border
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 8 * scale, 0, Math.PI * 2);
            ctx.lineWidth = 10 * scale;
            ctx.strokeStyle = "#FFD700";
            ctx.stroke();
          }

          // ===== FRAME =====
          ctx.drawImage(frameImg, 0, 0, size, size);

          // ===== NAME BOX =====
          if (name) {
            const boxWidth = 450 * scale;
            const boxHeight = 80 * scale;

            const boxX = size / 2 - boxWidth / 2;
            const boxY = size - 240 * scale;

            // gradient
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

            ctx.fillStyle = "#000";
            ctx.font = `bold ${36 * scale}px serif`;
            ctx.textAlign = "center";
            ctx.fillText(name.toUpperCase(), size / 2, boxY + 50 * scale);
          }
        };

        // ===== LOAD USER IMAGE =====
        if (image) {
          const userImg = new Image();
          userImg.src = image;

          userImg.onload = () => drawAll(userImg);
          userImg.onerror = () => drawAll();
        } else {
          drawAll();
        }
      };
    },
    [image, name]
  );

  // ================= PREVIEW =================
  useEffect(() => {
    if (previewCanvasRef.current) {
      drawCanvas(previewCanvasRef.current, 0.4);
    }
  }, [image, name]);

  // ================= DOWNLOAD =================
  const handleDownload = () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);

    drawCanvas(canvasRef.current, 1);

    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `eid-${name || "frame"}.png`;
      link.href = canvasRef.current!.toDataURL("image/png");
      link.click();

      setIsGenerating(false);

      confetti({ particleCount: 120, spread: 80 });
    }, 500); // 🔥 wait for draw
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
