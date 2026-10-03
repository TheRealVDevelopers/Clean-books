import { useEffect, useRef, useState } from 'react'

/**
 * Sizes a chart from its own container and hands the measured width and
 * height to a render prop.
 *
 * This replaces recharts' ResponsiveContainer, which measures 0px when a
 * chart mounts during a client-side route change and never re-measures —
 * leaving an SVG stuck at a stale size with no axes and no bars. Measuring
 * here, with a ResizeObserver plus a post-layout pass, keeps every chart
 * correct on first paint and on resize.
 */
export default function ChartBox({ height = 240, children, className = '' }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = Math.floor(el.clientWidth)
      setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev))
    }
    measure()
    // Route transitions can report 0 on the first pass; re-measure once the
    // browser has actually laid the page out.
    const raf = requestAnimationFrame(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <div ref={ref} className={'w-full min-w-0 ' + className} style={{ height }}>
      {width > 0 ? children(width, height) : null}
    </div>
  )
}
