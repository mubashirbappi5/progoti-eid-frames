import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Share2, X, User, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import eidFrame from "@/assets/eid-frame.png";
import progotiLogo from "@/assets/progoti-logo.jpg";

const FrameGenerator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const removeImage = () => setImage(null);

  const drawCanvas = useCallback(
    (canvas: HTMLCanvasElement, scale: number = 1) => {
      return new Promise<void>((resolve) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve();

        const size = 1080 * scale;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        let pendingLoads = 0;
        const checkDone = () => {
          pendingLoads--;
          if (pendingLoads <= 0) resolve();
        };

        const drawFrame = () => {
          pendingLoads++;
          const frameImg = new Image();
          frameImg.crossOrigin = "anonymous";

          frameImg.onload = () => {
            ctx.drawImage(frameImg, 0, 0, size, size);

            // 🔥 NAME (under Eid Mubarak)
            if (name) {
              ctx.save();
              ctx.font = `bold ${42 * scale}px 'Playfair Display', serif`;
              ctx.fillStyle = "#ffffff";
              ctx.textAlign = "center";
              ctx.shadowColor = "rgba(0,0,0,0.4)";
              ctx.shadowBlur = 6 * scale;

              ctx.fillText(name, size / 2, size - 140 * scale);

              ctx.restore();
            }

            // Logo
            pendingLoads++;
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";

            logoImg.onload = () => {
              const logoSize = 100 * scale;
              const logoX = size - logoSize - 30 * scale;
              const logoY = size - logoSize - 30 * scale;

              ctx.save();
              ctx.beginPath();
              ctx.arc(
                logoX + logoSize / 2,
                logoY + logoSize / 2,
                logoSize / 2 + 4 * scale,
                0,
                Math.PI * 2
              );
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.closePath();

              ctx.beginPath();
              ctx.arc(
                logoX + logoSize / 2,
                logoY + logoSize / 2,
                logoSize / 2,
                0,
                Math.PI * 2
              );
              ctx.clip();

              ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
              ctx.restore();

              checkDone();
            };

            logoImg.onerror = checkDone;
            logoImg.src = progotiLogo;

            checkDone();
          };

          frameImg.onerror = checkDone;
          frameImg.src = eidFrame;
        };

        if (image) {
          const userImg = new Image();
          userImg.crossOrigin = "anonymous";

          userImg.onload = () => {
            const centerX = size / 2;
            const centerY = size / 2 - 40 * scale;
            const radius = 280 * scale;

            // Border
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 6 * scale, 0, Math.PI * 2);

            const grad = ctx.createLinearGradient(
              centerX - radius,
              centerY - radius,
              centerX + radius,
              centerY + radius
            );

            grad.addColorStop(0, "#1a7a4c");
            grad.addColorStop(0.5, "#e8941a");
            grad.addColorStop(1, "#3a8cc2");

            ctx.fillStyle = grad;
            ctx.fill();
            ctx.closePath();
            ctx.restore();

            // Image clip
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.clip();

            const imgRatio = userImg.width / userImg.height;
            let sw = radius * 2,
              sh = radius * 2;

            if (imgRatio > 1) sw = sh * imgRatio;
            else sh = sw / imgRatio;

            const sx = centerX - sw / 2;
            const sy = centerY - sh / 2;

            ctx.drawImage(userImg, sx, sy, sw, sh);
            ctx.restore();

            drawFrame();
          };

          userImg.src = image;
        } else {
          // Placeholder
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2 - 40 * scale, 280 * scale, 0, Math.PI * 2);
          ctx.fillStyle = "#f0f0f0";
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.font = `${60 * scale}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = "#c0c0c0";
          ctx.fillText("📷", size / 2, size / 2 - 40 * scale);
          ctx.restore();

          drawFrame();
        }
      });
    },
    [image, name]
  );

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (canvas) drawCanvas(canvas, 0.35);
  }, [drawCanvas]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    await drawCanvas(canvas, 1);

    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `eid-mubarak-${name || "progoti21"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setIsGenerating(false);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 500);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="space-y-6">

          {/* Upload */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed p-8 text-center rounded-xl cursor-pointer"
          >
            {image ? (
              <div className="relative">
                <img src={image} className="w-32 h-32 mx-auto rounded-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                  <X />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-2" />
                <p>Upload Photo</p>
              </div>
            )}

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
