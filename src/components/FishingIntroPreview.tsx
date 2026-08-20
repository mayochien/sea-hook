// 下竿前的預覽動畫：魚線與魚鉤上下擺動、浪面下有假小魚游動，純裝飾用途，無需任何 props。
export function FishingIntroPreview() {
  return (
    <svg
      viewBox="0 0 128 72"
      className="h-24 w-44 overflow-visible"
      role="img"
      aria-label="魚線與魚鉤進出水面的動畫"
    >
      <defs>
        <path
          id="mini-fish"
          d="M0 0 C3 -3.2 9 -3.2 12 0 C9 3.2 3 3.2 0 0 Z M0.5 0 L-4.5 -2.8 L-4.5 2.8 Z"
        />
        <path
          id="mini-fish-l"
          d="M0 0 C-3 -3.2 -9 -3.2 -12 0 C-9 3.2 -3 3.2 0 0 Z M-0.5 0 L4.5 -2.8 L4.5 2.8 Z"
        />
      </defs>
      {/* 整體動畫內容往上移一點，避免遮住下方文字 */}
      <g transform="translate(0 -10)">
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -8;0 7;0 -8"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <path
          d="M28 0 Q82 20 72 48"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <g transform="translate(144 0) scale(-1 1)">
          <circle
            cx="72"
            cy="49"
            r="3"
            fill="#cbd5e1"
            stroke="#0f172a"
            strokeWidth="1"
          />
          <path
            d="M72 51 V60 C72 68 83 68 84 60 V57"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M83 57 L85 52 L87 57Z"
            fill="#cbd5e1"
            stroke="#f8fafc"
            strokeWidth="1"
          />
        </g>
      </g>
      {/* 半透明假小魚，在浪面下游來游去；兩隻魚各自在不重疊的水層內小幅上下擺動，路徑不交錯 */}
      <g fill="#facc15" opacity=".55">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="15 68;40 65;70 68;40 71;15 68"
            dur="5.5s"
            repeatCount="indefinite"
          />
          <use href="#mini-fish" />
        </g>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="120 78;85 81;45 78;85 75;120 78"
            dur="6.5s"
            begin="-1.8s"
            repeatCount="indefinite"
          />
          <use href="#mini-fish-l" />
        </g>
      </g>
      {/* <g fill="none" stroke="#67e8f9" strokeLinecap="round">
        <path d="M29 62 C40 57 51 57 62 62" strokeWidth="4" opacity=".9">
          <animate
            attributeName="d"
            values="M29 62 C40 57 51 57 62 62;M22 62 C39 52 54 52 69 62;M29 62 C40 57 51 57 62 62"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M67 64 C78 60 89 60 100 64" strokeWidth="4" opacity=".85">
          <animate
            attributeName="d"
            values="M67 64 C78 60 89 60 100 64;M60 64 C77 56 92 56 107 64;M67 64 C78 60 89 60 100 64"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </path>
      </g>
      <path
        d="M37 69 C52 65 76 65 91 69"
        fill="none"
        stroke="#67e8f9"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".8"
      /> */}
      </g>
    </svg>
  );
}
