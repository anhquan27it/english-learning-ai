/** Nhân vật giáo viên AI "thầy Minh" — SVG, miệng chuyển động khi đang nói. */
export function TeacherAvatar({ speaking, size = 72 }: { speaking: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label="Giáo viên AI thầy Minh" role="img">
      <defs>
        <linearGradient id="tm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff7ed" />
          <stop offset="1" stopColor="#fed7aa" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#tm-bg)" />
      {/* áo sơ mi + cà vạt */}
      <path d="M22 120c2-20 17-30 38-30s36 10 38 30z" fill="#ea580c" />
      <path d="M48 90l12 14 12-14z" fill="#fff" />
      <path d="M57 98h6l2 18h-10z" fill="#1f2937" />
      <path d="M56 92h8l-1 7h-6z" fill="#111827" />
      {/* cổ */}
      <rect x="51" y="78" width="18" height="13" rx="3" fill="#f2c29b" />
      {/* tai */}
      <ellipse cx="35" cy="60" rx="4" ry="6" fill="#f2c29b" />
      <ellipse cx="85" cy="60" rx="4" ry="6" fill="#f2c29b" />
      {/* mặt */}
      <ellipse cx="60" cy="58" rx="25" ry="27" fill="#f8d4b4" />
      {/* tóc ngắn */}
      <path d="M34 54c-2-20 10-32 27-32 18 0 29 11 26 31-4-9-10-14-18-16-8 6-22 9-35 17z" fill="#1f2937" />
      {/* lông mày */}
      <path d="M44 51q6-3 11 0M65 51q5-3 11 0" stroke="#1f2937" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* mắt */}
      <ellipse cx="50" cy="59" rx="2.8" ry="3.4" fill="#111827" />
      <ellipse cx="70" cy="59" rx="2.8" ry="3.4" fill="#111827" />
      {/* kính */}
      <g fill="none" stroke="#9a3412" strokeWidth="1.8">
        <rect x="41" y="52" width="17" height="13" rx="4" />
        <rect x="62" y="52" width="17" height="13" rx="4" />
        <path d="M58 58h4" />
      </g>
      {/* mũi */}
      <path d="M60 63q-2 5 1 7" stroke="#d6a07a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* miệng */}
      {speaking ? (
        <ellipse className="mouth-talk" cx="60" cy="75" rx="5.5" ry="3.8" fill="#9f1239" />
      ) : (
        <path d="M52 73q8 7 16 0" stroke="#9f1239" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
