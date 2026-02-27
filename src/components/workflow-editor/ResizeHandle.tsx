"use client";

import { useCallback, useRef, useEffect } from "react";

interface ResizeHandleProps {
  /** ドラッグ中にwidthの差分を返す */
  onResize: (deltaX: number) => void;
  /** ドラッグ方向。left=左パネル調整、right=右パネル調整 */
  direction?: "left" | "right";
}

export default function ResizeHandle({ onResize, direction = "left" }: ResizeHandleProps) {
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      startX.current = e.clientX;
      onResize(direction === "left" ? delta : -delta);
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize, direction]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className="shrink-0 relative group"
      style={{ width: 4, cursor: "col-resize" }}
    >
      {/* ホバー時にハイライト */}
      <div
        className="absolute inset-0 transition-colors duration-150"
        style={{ background: "#333" }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ background: "#7c3aed", width: 2, margin: "0 auto" }}
      />
    </div>
  );
}
