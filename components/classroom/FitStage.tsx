"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Khung trình chiếu kiểu PowerPoint: slide luôn lấp đầy vùng hiển thị và hiện trọn vẹn,
 * không bao giờ phải cuộn.
 *  - Slide được thiết kế ở chiều rộng cố định (1280px trên máy tính) rồi phóng to/thu nhỏ
 *    theo kích thước màn hình, nên chữ to lên khi màn hình lớn.
 *  - Nếu nội dung dài hơn khung, nội dung tự thu nhỏ vừa đủ để hiện hết.
 */
export function FitStage({ children, overlay, padding = 56 }: { children: ReactNode; overlay?: ReactNode; padding?: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [contentH, setContentH] = useState(0);

  useLayoutEffect(() => {
    const outer = outerRef.current!;
    const content = contentRef.current!;
    const ro = new ResizeObserver(() => {
      setBox({ w: outer.clientWidth, h: outer.clientHeight });
      // offsetHeight không bị ảnh hưởng bởi transform → không bị vòng lặp đo
      setContentH(content.offsetHeight);
    });
    ro.observe(outer);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  // Chiều rộng thiết kế theo cỡ màn hình: máy tính 1280, máy tính bảng 900, điện thoại 600.
  const designW = box.w >= 960 ? 1280 : box.w >= 640 ? 900 : 600;
  const scale = box.w ? box.w / designW : 1;
  const designH = box.h / scale;
  const pad = designW >= 1280 ? padding : designW >= 900 ? padding * 0.75 : padding * 0.5;
  const room = designH - pad * 2;
  const shrink = contentH > room && room > 0 ? Math.max(0.45, room / contentH) : 1;

  return (
    <div ref={outerRef} className="relative h-full w-full overflow-hidden rounded-[32px] bg-white shadow-xl shadow-orange-900/5 ring-1 ring-orange-100">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: designW, height: designH, transform: `scale(${scale})`, visibility: box.w ? "visible" : "hidden" }}
      >
        <div className="h-full w-full" style={{ padding: pad }}>
          <div
            ref={contentRef}
            className="origin-top transition-transform duration-500 ease-out"
            style={{ transform: shrink < 1 ? `scale(${shrink})` : undefined }}
          >
            {children}
          </div>
        </div>
        {overlay}
      </div>
    </div>
  );
}
