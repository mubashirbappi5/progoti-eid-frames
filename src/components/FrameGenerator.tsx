import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Share2, X, User, MessageSquare, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import eidFrame from "@/assets/eid-frame.png";
import progotiLogo from "@/assets/progoti-logo.jpg";

const FrameGenerator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const drawCanvas = useCallback((canvas: HTMLCanvasElement, scale: number = 1) => {
    return new Promise<void>((resolve) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve();

      const size = 1080 * scale;
      canvas.width = size;
      canvas.height = size;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Track loaded images
      let pendingLoads = 0;
      const checkDone = () => {
        pendingLoads--;
        if (pendingLoads <= 0) resolve();
      };

      const drawAfterUserPhoto = () => {
        // Draw frame overlay
        pendingLoads++;
        const frameImg = new Image();
        frameImg.crossOrigin = "anonymous";
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, size, size);

          // Draw logo in bottom-right corner
          pendingLoads++;
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            const logoSize = 100 * scale;
            const logoX = size - logoSize - 30 * scale;
            const logoY = size - logoSize - 30 * scale;
            // White bg circle behind logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 4 * scale, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.closePath();
            // Clip circle for logo
            ctx.beginPath();
            ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            // Draw name
            if (name) {
              ctx.save();
              ctx.font = `bold ${32 * scale}px 'Playfair Display', serif`;
              ctx.fillStyle = "#1a5c35";
              ctx.textAlign = "center";
              ctx.shadowColor = "rgba(0,0,0,0.1)";
              ctx.shadowBlur = 4 * scale;
              ctx.fillText(name, size / 2, size - 100 * scale);
              ctx.restore();
            }

            // Draw dedication
            if (dedication) {
              ctx.save();
              ctx.font = `${18 * scale}px 'Outfit', sans-serif`;
              ctx.fillStyle = "#6b7b3a";
              ctx.textAlign = "center";
              ctx.fillText(dedication, size / 2, size - 65 * scale);
              ctx.restore();
            }

            // Progoti-21 branding
            ctx.save();
            ctx.font = `${14 * scale}px 'Outfit', sans-serif`;
            ctx.fillStyle = "#9ca3af";
            ctx.textAlign = "center";
            ctx.fillText("Progoti-21", size / 2, size - 30 * scale);
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
          // Draw circular user photo in center
          const centerX = size / 2;
          const centerY = size / 2 - 40 * scale;
          const radius = 280 * scale;

          // Draw circular border
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius + 6 * scale, 0, Math.PI * 2);
          const borderGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
          borderGrad.addColorStop(0, "#1a7a4c");
          borderGrad.addColorStop(0.5, "#e8941a");
          borderGrad.addColorStop(1, "#3a8cc2");
          ctx.fillStyle = borderGrad;
          ctx.fill();
          ctx.closePath();
          ctx.restore();

          // Clip and draw user photo as circle
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.clip();

          // Cover-fit the image in circle
          const imgRatio = userImg.width / userImg.height;
          let sw = radius * 2, sh = radius * 2;
          if (imgRatio > 1) { sw = sh * imgRatio; }
          else { sh = sw / imgRatio; }
          const sx = centerX - sw / 2;
          const sy = centerY - sh / 2;
          ctx.drawImage(userImg, sx, sy, sw, sh);
          ctx.restore();

          drawAfterUserPhoto();
        };
        userImg.src = image;
      } else {
        // Draw placeholder circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2 - 40 * scale, 280 * scale, 0, Math.PI * 2);
        ctx.fillStyle = "#f0f0f0";
        ctx.fill();
        ctx.strokeStyle = "#d0d0d0";
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        // Placeholder icon
        ctx.save();
        ctx.font = `${60 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#c0c0c0";
        ctx.fillText("📷", size / 2, size / 2 - 40 * scale);
        ctx.restore();

        drawAfterUserPhoto();
      }
    });
  }, [image, name, dedication]);

  // Live preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (canvas) {
      drawCanvas(canvas, 0.35);
    }
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
        colors: ["#1a7a4c", "#e8941a", "#3a8cc2", "#d4a843", "#ffffff"],
      });
    }, 500);
  };

  const handleShare = (platform: "facebook" | "whatsapp") => {
    const text = encodeURIComponent(`Eid Mubarak from Progoti-21! 🌙✨ ${name ? `— ${name}` : ""}`);
    const url = platform === "facebook"
      ? `https://www.facebook.com/sharer/sharer.php?quote=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <section ref={sectionRef} id="frame-generator" className="py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            Create Your Eid Frame
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Upload your photo, add your details, and download!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-secondary bg-secondary/10 scale-[1.02]"
                  : "border-border hover:border-accent hover:bg-muted/50"
              }`}
            >
              {image ? (
                <div className="relative">
                  <img src={image} alt="Uploaded" className="w-32 h-32 mx-auto object-cover rounded-full border-4 border-secondary shadow-lg" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    className="absolute top-0 right-1/3 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-md hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">Drop your photo here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4 text-eid-green" />
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow font-body"
              />
            </div>

            {/* Dedication */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquare className="w-4 h-4 text-eid-green" />
                Dedication
                <span className="ml-auto text-xs text-muted-foreground">{dedication.length}/100</span>
              </label>
              <textarea
                value={dedication}
                onChange={(e) => setDedication(e.target.value.slice(0, 100))}
                placeholder="A short Eid message..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow font-body resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isGenerating ? "Generating..." : "Download Image"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground font-body font-medium text-sm hover:opacity-90 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-eid-green text-primary-foreground font-body font-medium text-sm hover:opacity-90 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-foreground text-center">Live Preview</h3>
            <div className="glass-card rounded-2xl p-4 sm:p-6">
              <canvas
                ref={previewCanvasRef}
                className="w-full rounded-lg shadow-md"
                style={{ aspectRatio: "1/1" }}
              />
            </div>
          </div>
        </div>

        {/* Hidden full-res canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
};

export default FrameGenerator;
