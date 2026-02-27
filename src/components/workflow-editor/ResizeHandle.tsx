"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
}

export default function ResizeHandle({ onResize }: ResizeHandleProps) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const [active, setActive] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      setActive(true);
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
      onResize(delta);
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setActive(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className="shrink-0 relative group"
      style={{ width: 4, cursor: "col-resize" }}
    >
      {/* 通常の境界線 */}
      <div
        className="absolute inset-0 transition-all duration-150"
        style={{
          background: active ? "#7c3aed" : "#2a2a2a",
          width: active ? 3 : 1,
          margin: "0 auto",
        }}
      />
      {/* ホバー時のハイライト */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{
          background: "#7c3aed",
          width: 2,
          margin: "0 auto",
        }}
      />
      {/* ドラッグ中のグロー */}
      {active && (
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(124, 58, 237, 0.15)",
            width: 12,
            marginLeft: -4,
          }}
        />
      )}
    </div>
  );
}
