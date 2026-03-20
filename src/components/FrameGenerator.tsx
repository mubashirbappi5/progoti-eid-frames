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

        // 🧠 CREATE TEMP CANVAS FOR DETECTION
        const tempCanvas = document.createElement("canvas");
        const tctx = tempCanvas.getContext("2d");

        tempCanvas.width = size;
        tempCanvas.height = size;

        if (!tctx) return resolve();

        tctx.drawImage(frameImg, 0, 0, size, size);

        const imageData = tctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // 🔍 DETECT BLACK AREA
        let minX = size, minY = size;
        let maxX = 0, maxY = 0;

        for (let y = 0; y < size; y += 4) {
          for (let x = 0; x < size; x += 4) {
            const i = (y * size + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // detect dark area (black center)
            if (r < 50 && g < 50 && b < 50) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        const boxX = minX;
        const boxY = minY;
        const boxW = maxX - minX;
        const boxH = maxY - minY;

        // =========================
        // 🎯 DRAW USER IMAGE
        // =========================

        if (image) {
          const userImg = new Image();
          userImg.crossOrigin = "anonymous";

          userImg.onload = () => {

            const imgRatio = userImg.width / userImg.height;
            const boxRatio = boxW / boxH;

            let drawW, drawH;

            if (imgRatio > boxRatio) {
              drawH = boxH;
              drawW = drawH * imgRatio;
            } else {
              drawW = boxW;
              drawH = drawW / imgRatio;
            }

            const dx = boxX - (drawW - boxW) / 2;
            const dy = boxY - (drawH - boxH) / 2;

            ctx.drawImage(userImg, dx, dy, drawW, drawH);

            // 🔥 Smooth edge blend
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.restore();

            // 🖼 Frame on top
            ctx.drawImage(frameImg, 0, 0, size, size);

            // ✨ Name
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

              ctx.font = `bold ${50 * scale}px 'Playfair Display', serif`;
              ctx.textAlign = "center";

              ctx.shadowColor = "rgba(255,215,0,0.6)";
              ctx.shadowBlur = 10 * scale;

              ctx.fillStyle = gradient;
              ctx.fillText(name, size / 2, y);

              ctx.restore();
            }

            resolve();
          };

          userImg.src = image;
        } else {
          ctx.drawImage(frameImg, 0, 0, size, size);
          resolve();
        }
      };

      frameImg.src = eidFrame;
    });
  },
  [image, name]
);
