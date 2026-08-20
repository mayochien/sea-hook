// 繪製釣魚遊戲畫面：天空與海浪、船隻、釣魚人物、釣竿與捲線器、魚線與魚鉤、海中游動的魚、釣到的魚
interface FishingSceneProps {
  marker: number;
  isGameRunning: boolean;
  isFishBiting: boolean;
  lastCatchFish: string | null;
}

const CAST_TRACK_START = 240;
const CAST_TRACK_WIDTH = 520;

// marker(0~100) 換算成竿線沿海面移動的實際 x 座標
const lineX = (value: number): number =>
  CAST_TRACK_START + (value / 100) * CAST_TRACK_WIDTH;

// 遊戲進行中魚鉤下沉較深，靜止時則停在較淺的位置
export function FishingScene({
  marker,
  isGameRunning,
  isFishBiting,
  lastCatchFish,
}: FishingSceneProps) {
  const hookDepthY = isGameRunning ? 230 : 190;

  return (
    <svg
      viewBox="0 0 800 280"
      className="h-56 w-full"
      role="img"
      aria-label="釣竿與魚鉤下竿遊戲"
    >
      <defs>
        <linearGradient id="fishing-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#bae9fd" />
          <stop offset="0.65" stopColor="#7dd9fd" />
          <stop offset="1" stopColor="#38befa" />
        </linearGradient>
        <linearGradient id="fishing-water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#075985" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="fishing-hook-metal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.32" stopColor="#cbd5e1" />
          <stop offset="0.7" stopColor="#64748b" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="fishing-rod-shaft" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="0.28" stopColor="#475569" />
          <stop offset="0.58" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="fishing-rod-grip" x1="0" x2="1">
          <stop offset="0" stopColor="#111827" />
          <stop offset="0.45" stopColor="#64748b" />
          <stop offset="1" stopColor="#1f2937" />
        </linearGradient>
        <filter
          id="fishing-boat-shadow"
          x="-20%"
          y="-100%"
          width="140%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <clipPath id="fishing-boat-clip">
          <rect width="800" height="280" />
        </clipPath>
        <clipPath id="fishing-water-clip">
          <rect x="0" y="148" width="800" height="132" />
        </clipPath>
        <path
          id="game-fish"
          d="M40 0 C36 -3 26 -9 18 -8 C10 -7 4 -4 0 0 C4 4 10 7 18 8 C26 9 36 3 40 0 Z M6 -4.5 Q7 -11 9 -13 Q14 -12 18 -6 Z M6 3.6 Q7 8.8 9 10.4 Q14 9.6 18 4.8 Z M1 0 L-13 -9 L-6 0 L-13 9 Z"
        />
        <path
          id="game-fish-l"
          d="M-40 0 C-36 -3 -26 -9 -18 -8 C-10 -7 -4 -4 0 0 C-4 4 -10 7 -18 8 C-26 9 -36 3 -40 0 Z M-6 -4.5 Q-7 -11 -9 -13 Q-14 -12 -18 -6 Z M-6 3.6 Q-7 8.8 -9 10.4 Q-14 9.6 -18 4.8 Z M-1 0 L13 -9 L6 0 L13 9 Z"
        />
      </defs>
      <rect width="800" height="280" fill="url(#fishing-sky)" />
      {/* 海面：底層深色海水填色 + 上層浪線，兩者都用 animate 周期性涢動 */}
      <path
        d="M0 140 C100 122 200 158 300 140 S500 122 600 140 S700 158 800 140 V280 H0 Z"
        fill="url(#fishing-water)"
      >
        <animate
          attributeName="d"
          dur="4s"
          repeatCount="indefinite"
          values="M0 140 C100 122 200 158 300 140 S500 122 600 140 S700 158 800 140 V280 H0 Z;M0 134 C100 114 200 168 300 136 S500 116 600 144 S700 170 800 134 V280 H0 Z;M0 146 C100 132 200 154 300 144 S500 130 600 136 S700 156 800 146 V280 H0 Z;M0 140 C100 122 200 158 300 140 S500 122 600 140 S700 158 800 140 V280 H0 Z"
        />
      </path>
      <path
        d="M0 140 C100 122 200 158 300 140 S500 122 600 140 S700 158 800 140"
        fill="none"
        stroke="#a5f3fc"
        strokeOpacity="0.75"
        strokeWidth="1.5"
      >
        <animate
          attributeName="d"
          dur="4s"
          repeatCount="indefinite"
          values="M0 140 C100 122 200 158 300 140 S500 122 600 140 S700 158 800 140;M0 134 C100 114 200 168 300 136 S500 116 600 144 S700 170 800 134;M0 146 C100 132 200 154 300 144 S500 130 600 136 S700 156 800 146;M0 140 C100 122 200 158 300 140 S500 122 600 140 S700 158 800 140"
        />
      </path>
      {/* 半透明假小魚，在海面下游來游去 */}
      <g clipPath="url(#fishing-water-clip)" fill="#e0f2fe" opacity=".28">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-40 190;840 190"
            dur="9s"
            repeatCount="indefinite"
          />
          <use href="#game-fish" />
        </g>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="840 230;-40 230"
            dur="10.5s"
            begin="-3s"
            repeatCount="indefinite"
          />
          <use href="#game-fish-l" transform="scale(0.8)" />
        </g>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-40 250;840 250"
            dur="12s"
            begin="-6s"
            repeatCount="indefinite"
          />
          <use href="#game-fish" transform="scale(1.15)" />
        </g>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="840 170;-40 170"
            dur="8s"
            begin="-2s"
            repeatCount="indefinite"
          />
          <use href="#game-fish-l" transform="scale(0.65)" />
        </g>
      </g>
      {/* 站在船邊釣魚的人物剑影：放在船身之前繪製，讓船身晃動時能蓋住人物腳邊 */}
      <g
        transform="translate(73 92) scale(0.5)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M177 200 Q162 135 150 128 Q135 158 150 220 Q136.5 300 140 200 L177 200 Z"
          fill="#365a78"
        />
        <path
          d="M135.6 123.1 Q135 117 146 108 Q160 102 169 115 L174 128 L166 139 L151 138 Q137 137 135.6 123.1 Z"
          fill="#f0c38d"
        />
        <path
          d="M136 119 Q144 101 160 106 Q169 110 172 119 L164 120 Q155 114 145 122 Z"
          fill="#334155"
        />
        {/* 脖子：補平臉部底端與肩膀交接處的凹角 */}
        {/* 圓鼻，改用小圓弧取代原本尖角的三角形 */}
        <circle cx="173" cy="126.5" r="3" fill="#f0c38d" />
        <circle cx="165" cy="125" r="2" fill="#333333" />
        {/* 前方手 */}
        <path d="M155 144 L185 158" stroke="#365a78" strokeWidth="8" />
        <circle cx="191" cy="160" r="4" fill="#f0c38d" />
        {/* 另一隻手：釣到魚時舉起來歡呼並小幅擺動，平常則自然垂放 */}
        {lastCatchFish && !isGameRunning ? (
          <g strokeLinecap="round">
            <path
              d="M140 145 L118 108"
              stroke="#365a78"
              strokeWidth="8"
              fill="none"
            >
              <animate
                attributeName="d"
                values="M140 145 L118 108;M140 145 L124 103;M140 145 L118 108"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </path>
            <circle r="4" fill="#f0c38d">
              <animate
                attributeName="cx"
                values="118;124;118"
                dur="0.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="108;103;108"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ) : (
          <g strokeLinecap="round">
            <path
              d="M146 145 L127 168"
              stroke="#365a78"
              strokeWidth="8"
              fill="none"
            />
            <circle cx="127" cy="168" r="4" fill="#f0c38d" />
          </g>
        )}
      </g>
      {/* 漂浮的小船，隨浪上下輕搖并微幅旋轉 */}
      <g clipPath="url(#fishing-boat-clip)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 120 190;-1 120 190;0.6 120 190;0 120 190"
          dur="4s"
          repeatCount="indefinite"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -2;0 1;0 0"
            dur="4s"
            repeatCount="indefinite"
          />
          <g transform="translate(-44 49) scale(0.85)">
            <ellipse
              cx="145"
              cy="239"
              rx="148"
              ry="13"
              fill="#082f49"
              fillOpacity="0.48"
              filter="url(#fishing-boat-shadow)"
            />
            <path
              d="M0 158 H306 L272 226 Q266 238 248 242 H48 Q30 238 24 226 Z"
              fill="#8b5e3c"
            />
            <path d="M8 166 H294 L286 184 H2 Z" fill="#f1d39b" />
            <g transform="translate(-47 0)">
              <path d="M112 158 V121 H192 L228 158 Z" fill="#dbeafe" />
              <path d="M106 121 H198 V128 H106 Z" fill="#f8fafc" />
              <rect
                x="132"
                y="133"
                width="20"
                height="14"
                rx="2"
                fill="#0f4c6e"
              />
              <rect
                x="164"
                y="133"
                width="20"
                height="14"
                rx="2"
                fill="#0f4c6e"
              />
            </g>
            <path d="M0 188 H292 L286 198 H0 Z" fill="#d6a75c" />
          </g>
        </g>
      </g>
      {/* 魚線：一端接站站尖，另一端逐鈣隨 marker 沿海面左右移動 */}
      <path
        d={`M264 27 Q${266 + marker * 4.8} ${isGameRunning ? 92 : 74} ${lineX(marker) - 16} ${hookDepthY + 4}`}
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 魚鈣本身；若 lastCatchFish 有值且魚竿已停止，就在鈣上顯示持續抖動的釣到魚 */}
      <g
        transform={`translate(${lineX(marker) - 16} ${hookDepthY + 4}) scale(-1 1)`}
      >
        <circle
          r="3"
          fill="url(#fishing-hook-metal)"
          stroke="#334155"
          strokeWidth="0.8"
        />
        <path
          d="M0 3 V16 C0 21 4 22 6 18 V15"
          fill="none"
          stroke="url(#fishing-hook-metal)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 15 L6 10 L7.5 15 Z"
          fill="url(#fishing-hook-metal)"
          stroke="#f8fafc"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
        <path
          d="M-0.8 4 V13"
          stroke="#ffffff"
          strokeOpacity="0.8"
          strokeWidth="0.8"
        />
        {lastCatchFish && !isGameRunning ? (
          <g
            transform="translate(12 24) rotate(-95) scale(0.6)"
            fill="#f4a259"
            stroke="#8a4a17"
            strokeWidth="1.2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              additive="sum"
              calcMode="linear"
              values="0 40 0;8 40 0;-8 40 0;8 40 0;-8 40 0;8 40 0;-8 40 0;8 40 0;-8 40 0;8 40 0;-8 40 0;0 40 0;0 40 0"
              keyTimes="0;0.0303;0.0606;0.0909;0.1212;0.1515;0.1818;0.2121;0.2424;0.2727;0.303;0.3333;1"
              dur="3s"
              repeatCount="indefinite"
            />
            <use href="#game-fish" />
          </g>
        ) : null}
      </g>
      {/* 釣竿與捲線器：魚兒夠鉤時竿尖會快速震動，遊戲進行中捲線器會旋轉 */}
      <g transform="translate(80 -12) rotate(-12 186 37)">
        <path
          d="M50 180 Q64 158 82 136"
          fill="none"
          stroke="url(#fishing-rod-grip)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <path
          d="M82 136 Q112 98 136 73"
          fill="none"
          stroke="url(#fishing-rod-shaft)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <g>
          {isFishBiting ? (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-4 136 73;4 136 73;-3 136 73;3 136 73;-4 136 73"
              dur="0.12s"
              repeatCount="indefinite"
            />
          ) : null}
          <path
            d="M136 73 Q147 62.5 157.5 54.75"
            fill="none"
            stroke="url(#fishing-rod-shaft)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M130 76 L140 82"
            stroke="#e2e8f0"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <g>
            {isFishBiting ? (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-6 157.5 54.75;6 157.5 54.75;-5 157.5 54.75;5 157.5 54.75;-6 157.5 54.75"
                dur="0.1s"
                repeatCount="indefinite"
              />
            ) : null}
            <path
              d="M157.5 54.75 Q172 44 186 37"
              fill="none"
              stroke="url(#fishing-rod-shaft)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle
              cx="154"
              cy="58"
              r="2.3"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
            <circle
              cx="186"
              cy="37"
              r="2.5"
              fill="url(#fishing-hook-metal)"
              stroke="#334155"
              strokeWidth="1"
            />
          </g>
        </g>
        <path
          d="M76 140 L87 146"
          stroke="#e2e8f0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="111"
          cy="99"
          r="3"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <g transform="translate(78 151) scale(0.75) translate(-78 -151)">
          <g>
            {isGameRunning ? (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 78 151"
                to="360 78 151"
                dur="0.45s"
                repeatCount="indefinite"
              />
            ) : null}
            <circle
              cx="78"
              cy="151"
              r="13"
              fill="url(#fishing-rod-grip)"
              stroke="#1f2937"
              strokeWidth="3"
            />
            <circle
              cx="78"
              cy="151"
              r="10"
              fill="none"
              stroke="#cbd5e1"
              strokeOpacity="0.55"
              strokeWidth="1.2"
            />
            <circle
              cx="78"
              cy="151"
              r="7"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
            />
            <path
              d="M78 138 V128 M78 164 V174"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
