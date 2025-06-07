import { useEffect } from "react";

// Tipe opsional untuk parameter options
interface LeafCursorOptions {
  element?: HTMLElement;
}

/**
 * React hook untuk animasi kursor daun (🍃, 🍂, 🍁) di seluruh halaman.
 * Otomatis aktif saat komponen dipasang, dan bersih saat dilepas.
 */
export function useLeafCursor() {
  useEffect(() => {
    function leafCursor(options: LeafCursorOptions = {}) {
      const hasWrapperEl = options && options.element;
      const element: HTMLElement = (hasWrapperEl as HTMLElement) || document.body;
      const possibleEmoji = ["🍃", "🍂", "🍁"];
      let width = window.innerWidth;
      let height = window.innerHeight;
      let cursor = { x: width / 2, y: width / 2 };
      let particles: Particle[] = [];
      let canvas: HTMLCanvasElement;
      let context: CanvasRenderingContext2D | null;
      let animationFrame: number;
      let canvImages: HTMLCanvasElement[] = [];
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotion.onchange = () => {
        if (prefersReducedMotion.matches) {
          destroy();
        } else {
          init();
        }
      };
      function init() {
        if (prefersReducedMotion.matches) {
          return false;
        }
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.style.pointerEvents = "none";
        if (hasWrapperEl) {
          canvas.style.position = "absolute";
          element.appendChild(canvas);
          canvas.width = element.clientWidth;
          canvas.height = element.clientHeight;
        } else {
          canvas.style.position = "fixed";
          document.body.appendChild(canvas);
          canvas.width = width;
          canvas.height = height;
        }
        if (!context) return;
        context.font = "20px serif";
        context.textBaseline = "middle";
        context.textAlign = "center";
        possibleEmoji.forEach((emoji) => {
          if (!context) return;
          let measurements = context.measureText(emoji);
          let bgCanvas = document.createElement("canvas");
          let bgContext = bgCanvas.getContext("2d");
          bgCanvas.width = measurements.width;
          bgCanvas.height = (measurements.actualBoundingBoxAscent || 20) * 2;
          if (!bgContext) return;
          bgContext.textAlign = "center";
          bgContext.font = "20px serif";
          bgContext.textBaseline = "middle";
          bgContext.fillText(
            emoji,
            bgCanvas.width / 2,
            measurements.actualBoundingBoxAscent || 20
          );
          canvImages.push(bgCanvas);
        });
        bindEvents();
        loop();
      }
      function bindEvents() {
        element.addEventListener("mousemove", onMouseMove as EventListener);
        element.addEventListener("touchmove", onTouchMove as EventListener, { passive: true });
        element.addEventListener("touchstart", onTouchMove as EventListener, { passive: true });
        window.addEventListener("resize", onWindowResize);
      }
      function onWindowResize(_e: UIEvent) {
        width = window.innerWidth;
        height = window.innerHeight;
        if (hasWrapperEl) {
          canvas.width = element.clientWidth;
          canvas.height = element.clientHeight;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
      }
      function onTouchMove(e: TouchEvent) {
        if (e.touches.length > 0) {
          for (let i = 0; i < e.touches.length; i++) {
            addParticle(
              e.touches[i].clientX,
              e.touches[i].clientY,
              canvImages[Math.floor(Math.random() * canvImages.length)]
            );
          }
        }
      }
      function onMouseMove(e: MouseEvent) {
        if (hasWrapperEl) {
          const boundingRect = element.getBoundingClientRect();
          cursor.x = e.clientX - boundingRect.left;
          cursor.y = e.clientY - boundingRect.top;
        } else {
          cursor.x = e.clientX;
          cursor.y = e.clientY;
        }
        addParticle(
          cursor.x,
          cursor.y,
          canvImages[Math.floor(Math.random() * canvImages.length)]
        );
      }
      function addParticle(x: number, y: number, img: HTMLCanvasElement) {
        particles.push(new Particle(x, y, img));
      }
      function updateParticles() {
        if (!context || particles.length === 0) return;
        context.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update(context);
        }
        for (let i = particles.length - 1; i >= 0; i--) {
          if (particles[i].lifeSpan < 0) {
            particles.splice(i, 1);
          }
        }
        if (particles.length === 0 && context) {
          context.clearRect(0, 0, width, height);
        }
      }
      function loop() {
        updateParticles();
        animationFrame = requestAnimationFrame(loop);
      }
      function destroy() {
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        cancelAnimationFrame(animationFrame);
        element.removeEventListener("mousemove", onMouseMove as EventListener);
        element.removeEventListener("touchmove", onTouchMove as EventListener);
        element.removeEventListener("touchstart", onTouchMove as EventListener);
        window.removeEventListener("resize", onWindowResize);
      }
      class Particle {
        position: { x: number; y: number };
        velocity: { x: number; y: number };
        lifeSpan: number;
        initialLifeSpan: number;
        canv: HTMLCanvasElement;
        constructor(x: number, y: number, canvasItem: HTMLCanvasElement) {
          const lifeSpan = Math.floor(Math.random() * 60 + 80);
          this.initialLifeSpan = lifeSpan;
          this.lifeSpan = lifeSpan;
          this.velocity = {
            x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
            y: 1 + Math.random(),
          };
          this.position = { x: x, y: y };
          this.canv = canvasItem;
        }
        update(context: CanvasRenderingContext2D) {
          this.position.x += this.velocity.x;
          this.position.y += this.velocity.y;
          this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
          this.velocity.y -= Math.random() / 300;
          this.lifeSpan--;
          const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);
          const degrees = 2 * this.lifeSpan;
          const radians = degrees * 0.0174533;
          context.save();
          context.translate(this.position.x, this.position.y);
          context.rotate(radians);
          context.drawImage(
            this.canv,
            (-this.canv.width / 2) * scale,
            -this.canv.height / 2,
            this.canv.width * scale,
            this.canv.height * scale
          );
          context.rotate(-radians);
          context.translate(-this.position.x, -this.position.y);
          context.restore();
        }
      }
      init();
      return {
        destroy: destroy,
      };
    }
    const cursor = leafCursor();
    return () => cursor.destroy();
  }, []);
}
