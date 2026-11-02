import { Plugin, Slot, Style, usePlugin } from "@opencode/plugin/gui"
import { Portal } from "solid-js/web"
import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js"

type UserMessage = {
  id: string
  type: "user"
  text: string
  time: { created: number }
}

const css = `
.oc-rail {
  position: fixed;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2147483000;
  display: flex;
  align-items: center;
  font: inherit;
}
.oc-ticks {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.64em;
  padding: 0.7em 0;
  transition: opacity .12s ease;
}
.oc-tick {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  background: color-mix(in srgb, currentColor 22%, transparent);
  transition: width .15s ease, background .15s ease;
}
.oc-tick.is-active {
  width: 18px;
  background: var(--oc-accent, #4d6bfe);
}
.oc-rail:hover .oc-ticks { opacity: 0; pointer-events: none; }
.oc-card {
  position: absolute;
  right: 0;
  top: 50%;
  width: 23.5em;
  max-height: 58vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.7em;
  border-radius: 1em;
  background: var(--oc-bg, #fff);
  box-shadow: 0 14px 44px rgba(15,15,20,.16), 0 0 0 1px rgba(15,15,20,.05);
  transform: translate(10px, -50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity .16s ease, transform .16s ease;
}
.oc-rail:hover .oc-card {
  opacity: 1;
  pointer-events: auto;
  transform: translate(0, -50%);
}
.oc-item {
  display: flex;
  align-items: center;
  gap: 0.7em;
  width: 100%;
  padding: 0.5em 0.64em;
  border: 0;
  border-radius: 0.57em;
  background: transparent;
  color: inherit;
  opacity: .55;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.oc-item:hover { background: color-mix(in srgb, currentColor 6%, transparent); }
.oc-item.is-active { opacity: 1; color: var(--oc-accent, #4d6bfe); }
.oc-label {
  flex: 1;
  min-width: 0;
  font-size: .96em;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.oc-mark {
  flex: none;
  width: 11px;
  height: 2px;
  border-radius: 1px;
  background: color-mix(in srgb, currentColor 25%, transparent);
}
.oc-item.is-active .oc-mark {
  width: 16px;
  background: var(--oc-accent, #4d6bfe);
}
`

function Rail() {
  const ctx = usePlugin()
  const [active, setActive] = createSignal<string>()
  let hold = false

  const session = () => ctx.sessions.current()
  const users = createMemo<UserMessage[]>(() => {
    const s = session()
    const data = s ? ctx.servers.get(s.server.id)?.data : undefined
    if (!s || !data) return []
    // 宿主导航的是「id < 复原点」的 user 消息，这里必须同规则，否则步数会错一条
    const revert = data.session.get(s.id)?.revert?.messageID
    return (data.session.message.list(s.id) as any[]).filter(
      (m) => m.type === "user" && (!revert || m.id < revert),
    ) as UserMessage[]
  })

  const scrollerOf = (el: HTMLElement) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight) return p
    }
    return undefined
  }

  // 宿主导航判断「当前消息」的规则：视口顶部往下 100px 处的那一行。
  // 跳转步数必须用它算起点，不能用侧边栏高亮（贴底时高亮在最后一条，但宿主起点在顶部那条）
  const topMessage = () => {
    const list = users()
    if (!list.length) return undefined
    const firstRow = document.querySelector<HTMLElement>("[data-message-id]")
    const viewport = firstRow && scrollerOf(firstRow)
    const line = (viewport?.getBoundingClientRect().top ?? 0) + 100
    let ref: string | undefined
    for (const el of document.querySelectorAll<HTMLElement>("[data-message-id]")) {
      if (el.getBoundingClientRect().top > line) break
      ref = el.getAttribute("data-message-id") || ref
    }
    if (!ref) return list[0].id
    const upTo = list.filter((m) => m.id <= ref)
    return upTo.length ? upTo[upTo.length - 1].id : list[0].id
  }

  // 贴底时桌面端是 pinned 状态，虚拟列表测量后会 scrollToEnd 把视图拉回底部；
  // 它自己的解除方式是向上滚轮，所以先补一个合成事件
  const unpin = () => {
    const row = document.querySelector<HTMLElement>("[data-message-id]")
    const scroller = row && scrollerOf(row)
    scroller?.dispatchEvent(new WheelEvent("wheel", { deltaY: -1, bubbles: true }))
  }

  // 顶部有 sticky 会话标题，直接 scrollIntoView 会把目标顶到标题底下，所以手动扣掉标题高度。
  // 桌面端导航的 rAF 收尾可能会再动一次滚动，所以 180ms 后再校正一遍。
  const reveal = (el: HTMLElement) => {
    const scroller = scrollerOf(el)
    if (!scroller) {
      el.scrollIntoView({ block: "start", behavior: "auto" })
      return
    }
    const title = scroller.querySelector<HTMLElement>("[data-session-title]")
    const offset = title?.offsetHeight ?? 64
    const align = () => {
      const delta = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top
      scroller.scrollTop += delta - offset
    }
    align()
    align()
    setTimeout(() => {
      if (!el.isConnected) return
      const delta = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top
      console.debug("[timeline] align", Math.round(offset), Math.round(delta), Math.round(scroller.scrollTop))
      if (Math.abs(delta - offset) > 2) align()
    }, 180)
  }

  const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  // 目标行对齐到 sticky 标题下沿，和宿主 scrollToElement 同一规则
  const alignTop = (el: HTMLElement) => {
    const scroller = scrollerOf(el)
    if (!scroller) return
    const title = scroller.querySelector<HTMLElement>("[data-session-title]")
    const delta = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top - (title?.offsetHeight ?? 0)
    if (Math.abs(delta) > 0.5) scroller.scrollTop += delta
  }

  // 宿主落位后虚拟器还会测量并位移一次内容：
  // 等「内容高度 + 目标位置」连续 3 帧不变，再交给 alignTop
  const settle = async (scroller: HTMLElement, id: string) => {
    const started = performance.now()
    let stable = 0
    let lastHeight = -1
    let lastTop = Number.NaN
    while (performance.now() - started < 1000) {
      const el = document.getElementById("message-" + id)
      const height = scroller.scrollHeight
      const top = el?.getBoundingClientRect().top ?? Number.NaN
      if (el && height === lastHeight && Math.abs(top - lastTop) < 0.5) stable++
      else stable = 0
      lastHeight = height
      lastTop = top
      if (stable >= 3 && el) return el
      await frame()
    }
    return document.getElementById("message-" + id) ?? undefined
  }

  const rowTop = (el: HTMLElement, scroller: HTMLElement) =>
    el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop

  // 当前窗口里的锚点：消息索引 → 该轮最上面一行的绝对偏移
  const anchorsOf = (scroller: HTMLElement) => {
    const list = users()
    const byIndex = new Map<number, number>()
    for (const el of document.querySelectorAll<HTMLElement>("[data-message-id]")) {
      const index = list.findIndex((m) => m.id === el.getAttribute("data-message-id"))
      if (index < 0) continue
      const top = rowTop(el, scroller)
      if (top < (byIndex.get(index) ?? Infinity)) byIndex.set(index, top)
    }
    return [...byIndex].map(([index, top]) => ({ index, top })).sort((a, b) => a.index - b.index)
  }

  // 用已知「消息索引 → 偏移」线性外推，直接跳到目标附近；锚点不足时退化成翻一屏
  const jumpOnce = (id: string) => {
    const row = document.querySelector<HTMLElement>("[data-message-id]")
    const scroller = row && scrollerOf(row)
    if (!scroller) return false
    const list = users()
    const target = list.findIndex((m) => m.id === id)
    if (target < 0) return false
    const anchors = anchorsOf(scroller)
    if (!anchors.length) return false
    const title = scroller.querySelector<HTMLElement>("[data-session-title]")
    const offset = title?.offsetHeight ?? 0
    const page = Math.max(64, scroller.clientHeight - offset - 40)
    const first = anchors[0]
    const last = anchors[anchors.length - 1]
    const before = scroller.scrollTop
    // 目标这一轮已经在窗口里，但用户消息行在视口上方：往上翻一屏把它挂出来
    if (first.index <= target && target <= last.index) {
      scroller.scrollBy({ top: -page })
      return scroller.scrollTop !== before
    }
    if (anchors.length >= 2 && last.index !== first.index) {
      const per = (last.top - first.top) / (last.index - first.index)
      if (per > 0) {
        const max = scroller.scrollHeight - scroller.clientHeight
        const top = first.top + (target - first.index) * per
        scroller.scrollTop = Math.min(max, Math.max(0, top - offset))
        return scroller.scrollTop !== before
      }
    }
    scroller.scrollBy({ top: target < first.index ? -page : page })
    return scroller.scrollTop !== before
  }

  // 兜底：深链/导航命令都不可用时，用估算位置逐次逼近
  const jumpDom = async (id: string) => {
    setActive(id)
    hold = true
    const t0 = performance.now()
    const mounted = document.getElementById("message-" + id)
    if (mounted) {
      reveal(mounted)
      return
    }
    unpin()
    await new Promise((resolve) => setTimeout(resolve, 50))
    for (let i = 0; i < 8; i++) {
      const el = document.getElementById("message-" + id)
      if (el) {
        reveal(el)
        console.debug("[timeline] jump ok", i, Math.round(performance.now() - t0))
        return
      }
      if (!jumpOnce(id)) return
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    console.debug("[timeline] jump fail", Math.round(performance.now() - t0))
  }

  // 宿主的 hash 深链可用时不会走到这里；失败时退回原来的步进
  const stepTo = async (id: string) => {
    const list = users()
    const target = list.findIndex((m) => m.id === id)
    if (target < 0) return
    const fromId = topMessage()
    const from = fromId ? list.findIndex((m) => m.id === fromId) : -1
    if (from < 0) {
      await jumpDom(id)
      return
    }
    // 先解除贴底：步数为 0（目标就在当前视口）时也要解除，否则校准会被 follow 拉回底部
    unpin()
    const steps = target - from
    if (steps) {
      const cmd = steps > 0 ? "message.next" : "message.previous"
      for (let i = 0; i < Math.abs(steps); i++) if (!ctx.commands.run(cmd)) break
    }
    await frame()
    if (!document.getElementById("message-" + id)) await jumpDom(id)
  }

  let jumpSeq = 0

  // 遮住行 → 宿主落位 → 等虚拟器测量稳定 → 两次对齐 → 揭开
  const go = async (id: string) => {
    if (!users().some((m) => m.id === id)) return
    const seq = ++jumpSeq
    const t0 = performance.now()
    setActive(id)
    hold = true

    const row = document.querySelector<HTMLElement>("[data-message-id]")
    const scroller = row ? scrollerOf(row) : undefined
    const content = scroller?.querySelector<HTMLElement>("[data-timeline-virtual-content]")
    if (!scroller || !content) return

    const previous = content.style.visibility
    content.style.visibility = "hidden"
    try {
      const hash = "#message-" + id
      if (location.hash !== hash) {
        history.replaceState(history.state, "", hash)
        window.dispatchEvent(new PopStateEvent("popstate", { state: history.state }))
        await frame()
      } else {
        unpin()
      }

      // hash 没把目标挂出来（路由没接管）→ 清掉 hash，走旧步进兜底
      if (!document.getElementById("message-" + id)) {
        history.replaceState(history.state, "", location.pathname + location.search)
        await stepTo(id)
      }

      const el = await settle(scroller, id)
      if (!el || seq !== jumpSeq) return
      alignTop(el)
      await frame()
      if (seq !== jumpSeq) return
      alignTop(el)
      console.debug(
        "[timeline] jump",
        Math.round(performance.now() - t0),
        Math.round(el.getBoundingClientRect().top - scroller.getBoundingClientRect().top),
      )
    } finally {
      if (seq === jumpSeq) content.style.visibility = previous
    }
  }

  const loaded = new Set<string>()

  createEffect(() => {
    const s = session()
    const data = s ? ctx.servers.get(s.server.id)?.data : undefined
    if (!s || !data || loaded.has(s.id)) return
    loaded.add(s.id)
    void data.session.message.loadMore(s.id, { all: true }).catch(() => {})
  })

  createEffect(() => {
    session()?.key
    setActive(undefined)
    hold = false
  })

  onMount(() => {
    const update = () => {
      if (hold) return
      const list = users()
      if (!list.length) return
      const firstRow = document.querySelector<HTMLElement>("[data-message-id]")
      const viewport = firstRow && scrollerOf(firstRow)
      // 贴底时最后一条消息可能顶不到视口顶部（内容不满一页），按顶部取会落到上一条；
      // 这种情况直接把当前消息定为最后一条
      if (viewport) {
        const max = viewport.scrollHeight - viewport.clientHeight
        if (max > 24 && max - viewport.scrollTop <= 24) {
          setActive(list[list.length - 1].id)
          return
        }
      }
      const current = topMessage()
      if (current) setActive(current)
    }

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    // 只有用户真的滚动会话时才解除「保持高亮」；点刻度、翻卡片都不算
    const inside = (e: Event) => {
      const row = document.querySelector<HTMLElement>("[data-message-id]")
      const scroller = row && scrollerOf(row)
      const target = e.target
      if (!scroller || !(target instanceof Node)) return false
      if (scroller.contains(target)) return true
      return target instanceof Element && !!target.closest(".scroll-view__thumb")
    }
    const releaseNow = () => {
      if (!hold) return
      hold = false
      update()
    }
    const onGesture = (e: Event) => {
      if (!e.isTrusted) return
      if (inside(e)) releaseNow()
    }
    const onKey = (e: KeyboardEvent) => {
      const target = e.target
      if (target instanceof Element && target.closest("input, textarea, [contenteditable]")) return
      if (["PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown", " "].includes(e.key)) releaseNow()
    }

    document.addEventListener("scroll", onScroll, true)
    document.addEventListener("wheel", onGesture, { passive: true, capture: true })
    document.addEventListener("touchstart", onGesture, { passive: true, capture: true })
    document.addEventListener("pointerdown", onGesture, true)
    document.addEventListener("keydown", onKey, true)
    const timer = window.setInterval(update, 800)
    update()

    onCleanup(() => {
      document.removeEventListener("scroll", onScroll, true)
      document.removeEventListener("wheel", onGesture, true)
      document.removeEventListener("touchstart", onGesture, true)
      document.removeEventListener("pointerdown", onGesture, true)
      document.removeEventListener("keydown", onKey, true)
      cancelAnimationFrame(frame)
      window.clearInterval(timer)
    })
  })

  return (
    <Show when={session()}>
      <Portal mount={document.body}>
        <div class="oc-rail">
          <div class="oc-ticks">
            <For each={users()}>
              {(m) => <div class="oc-tick" classList={{ "is-active": active() === m.id }} />}
            </For>
          </div>
          <div
            class="oc-card"
            onWheel={(event) => {
              const el = event.currentTarget
              const canScroll = el.scrollHeight > el.clientHeight + 1
              const atTop = el.scrollTop <= 0 && event.deltaY < 0
              const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && event.deltaY > 0
              // 卡片滚不动时别把滚轮传给页面
              if (!canScroll || atTop || atBottom) event.preventDefault()
              event.stopPropagation()
            }}
          >
            <For each={users()}>
              {(m) => (
                <button
                  class="oc-item"
                  classList={{ "is-active": active() === m.id }}
                  title={
                    new Date(m.time.created).toLocaleString() + "  " + (m.text || "（无文本）")
                  }
                  onClick={() => go(m.id)}
                >
                  <span class="oc-label">{m.text || "（无文本）"}</span>
                  <span class="oc-mark" />
                </button>
              )}
            </For>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export default Plugin.define({
  setup(ctx) {
    ctx.add(Style, css)
    ctx.add(Slot, { at: "window.bottom", render: () => <Rail /> })
  },
})
