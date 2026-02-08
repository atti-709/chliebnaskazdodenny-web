const CX = 33.14
const CY = 34.713
const R_OUT = 26
const RAY_COUNT = 15
const STEP = 360 / RAY_COUNT
const HALF_W = 1.38 // half the ray width (matches original ~2.76 unit width)

const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => {
  const rad = (i * STEP * Math.PI) / 180
  const sin = Math.sin(rad)
  const cos = Math.cos(rad)
  // perpendicular offset for constant width
  const px = HALF_W * cos
  const py = HALF_W * sin
  // tip points (at R_OUT along ray direction)
  const tx = CX + R_OUT * sin
  const ty = CY - R_OUT * cos
  return [
    `M${(CX + px).toFixed(2)} ${(CY + py).toFixed(2)}`,
    `L${(tx + px).toFixed(2)} ${(ty + py).toFixed(2)}`,
    `L${(tx - px).toFixed(2)} ${(ty - py).toFixed(2)}`,
    `L${(CX - px).toFixed(2)} ${(CY - py).toFixed(2)}Z`,
  ].join('')
}).join('')

const BINDING =
  'M66.2715 40.2356C65.1214 40.2356 64.0956 39.7744 63.3417 39.0234C62.5907 38.2695 62.1309 37.2437 62.1295 36.0936V34.713H4.14197V36.0936C4.14197 37.2437 3.68083 38.2695 2.92975 39.0234C2.17591 39.7744 1.15009 40.2342 0 40.2356V42.9969H26.3705C27.0098 46.1489 29.7932 48.5195 33.1357 48.5195C36.4769 48.5195 39.2617 46.1489 39.901 42.9969H66.2715V40.2356ZM37.2777 40.2356V41.6162C37.2777 42.7663 36.8166 43.7921 36.0655 44.546C35.3117 45.2971 34.2858 45.7568 33.1357 45.7582C31.9857 45.7582 30.9598 45.2971 30.206 44.546C29.4549 43.7921 28.9952 42.7663 28.9938 41.6162V40.2356H5.51434C6.11907 39.432 6.55674 38.4959 6.76383 37.4743H27.6117C28.7618 37.4743 29.7877 37.9354 30.5415 38.6865C31.2926 39.4403 31.7523 40.4661 31.7537 41.6162H34.515C34.515 40.4661 34.9762 39.4403 35.7272 38.6865C36.4811 37.9354 37.5069 37.4756 38.657 37.4743H59.5049C59.712 38.4959 60.151 39.432 60.7544 40.2356H37.2749H37.2777Z'

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
      <svg
        viewBox="0 0 66.3 49"
        className="w-16 h-auto md:w-20"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="rays-clip">
            <rect x="-10" y="-10" width="86.3" height="44.813" />
          </clipPath>
        </defs>

        {/* Rotating rays, clipped above the binding bar */}
        <g clipPath="url(#rays-clip)">
          <g
            className="animate-turn-pages"
            style={{
              transformOrigin: '33.14px 34.713px',
              transformBox: 'view-box',
            }}
          >
            <path d={RAYS} fill="#D7D09A" />
          </g>
        </g>

        {/* Static binding/base */}
        <path d={BINDING} fill="#D7D09A" />
      </svg>
    </div>
  )
}

export default LoadingSpinner
