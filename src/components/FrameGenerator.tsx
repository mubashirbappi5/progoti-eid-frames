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

  // Upload
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // 🔥 MAIN DRAW FUNCTION
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
          // 🟢 STEP 1: Draw USER IMAGE FIRST (full cover)
          if (image) {
            const userImg = new Image();
            userImg.crossOrigin = "anonymous";

            userImg.onload = () => {
              const imgRatio = userImg.width / userImg.height;
              const canvasRatio = 1;

              let drawWidth, drawHeight;

              if (imgRatio > canvasRatio) {
                drawHeight = size;
                drawWidth = drawHeight * imgRatio;
              } else {
                drawWidth = size;
                drawHeight = drawWidth / imgRatio;
              }

              const dx = (size - drawWidth) / 2;
              const dy = (size - drawHeight) / 2;

              ctx.drawImage(userImg, dx, dy, drawWidth, drawHeight);

              // 🟡 STEP 2: APPLY MASK FROM FRAME
           // 🟡 Apply mask correctly
ctx.globalCompositeOperation = "destination-in";
ctx.drawImage(frameImg, 0, 0, size, size);

// 🔵 Reset + draw frame on top
ctx.globalCompositeOperation = "source-over";
ctx.drawImage(frameImg, 0, 0, size, size);

           

              // ✨ NAME TEXT
              if (name) {
                ctx.save();

                const y = size - 150 * scale;

                const gradient = ctx.createLinearGradient(
                  size / 2 - 200 * scale,
                  y,
                  size / 2 + 200 * scale,
                  y
                );

                gradient.addColorStop(0, "#FFD700");
                gradient.addColorStop(0.5, "#FFF5CC");
                gradient.addColorStop(1, "#E6B800");

                ctx.font = `bold ${48 * scale}px 'Playfair Display', serif`;
                ctx.textAlign = "center";

                ctx.shadowColor = "rgba(255,215,0,0.6)";
                ctx.shadowBlur = 12 * scale;

                ctx.fillStyle = gradient;
                ctx.fillText(name, size / 2, y);

                ctx.restore();
              }

              // 🟣 LOGO
              const logoImg = new Image();
              logoImg.onload = () => {
                const s = 100 * scale;
                const x = size - s - 30 * scale;
                const y = size - s - 30 * scale;

                ctx.save();
                ctx.beginPath();
                ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(logoImg, x, y, s, s);
                ctx.restore();

                resolve();
              };
              logoImg.src = progotiLogo;
            };

            userImg.src = image;
          } else {
            // If no image → just frame
            ctx.drawImage(frameImg, 0, 0, size, size);
            resolve();
          }
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

          {/* Upload */}
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

          {/* Name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 border rounded-lg"
          />

          {/* Download */}
          <button
            onClick={handleDownload}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Download Image"
            )}
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
