import { useEffect, useMemo, useState, type DragEvent } from 'react'
import {
  blockLibrary,
  buildAgentBrief,
  createBlock,
  createStarterDocument,
  describeBlock,
  type BlockKind,
  type BuilderBlock,
  type PageDocument,
  type Viewport,
} from './model'
import './App.css'

const STORAGE_KEY = 'lay4canvas:document:v1'
const LEGACY_STORAGE_KEY = 'visual-page-builder:document:v1'
const viewportWidths: Record<Viewport, number> = {
  desktop: 1120,
  tablet: 760,
  mobile: 390,
}

const fitScales: Record<Viewport, number> = {
  desktop: 0.68,
  tablet: 0.82,
  mobile: 1,
}

function loadDocument(): PageDocument {
  const starter = createStarterDocument()
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
      ?? window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return starter

    const parsed = JSON.parse(stored) as Omit<Partial<PageDocument>, 'blocks'> & {
      blocks?: Array<Partial<BuilderBlock> & { kind: BlockKind; width?: number }>
    }

    return {
      name: parsed.name ?? starter.name,
      section: parsed.section ?? starter.section,
      blocks: parsed.blocks?.map((block) => {
        const base = createBlock(block.kind)
        const legacyWidth = block.width ?? base.widths.desktop
        return {
          ...base,
          ...block,
          widths: block.widths ?? {
            desktop: legacyWidth,
            tablet: Math.min(100, legacyWidth + 8),
            mobile: 100,
          },
        }
      }) ?? starter.blocks,
    }
  } catch {
    return starter
  }
}

function App() {
  const [document, setDocument] = useState<PageDocument>(loadDocument)
  const [selectedId, setSelectedId] = useState<string | null>(document.blocks[1]?.id ?? null)
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [showExport, setShowExport] = useState(false)
  const [exportMode, setExportMode] = useState<'brief' | 'json'>('brief')
  const [notice, setNotice] = useState('Saved locally')
  const [zoomMode, setZoomMode] = useState<'fit' | 'actual'>('fit')
  const [isLoadingExport, setIsLoadingExport] = useState(false)

  const selectedBlock = document.blocks.find((block) => block.id === selectedId) ?? null
  const agentBrief = useMemo(() => buildAgentBrief(document, viewport), [document, viewport])
  const jsonExport = useMemo(() => JSON.stringify(document, null, 2), [document])
  const canvasScale = zoomMode === 'fit' ? fitScales[viewport] : 1

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
  }, [document])

  function addBlock(kind: BlockKind) {
    const block = createBlock(kind)
    setDocument((current) => ({ ...current, blocks: [...current.blocks, block] }))
    setSelectedId(block.id)
    setNotice(`${blockLibrary.find((item) => item.kind === kind)?.label ?? kind} added`)
  }

  function updateSelected(patch: Partial<BuilderBlock>) {
    if (!selectedId) return
    setDocument((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === selectedId ? { ...block, ...patch } : block),
    }))
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setDocument((current) => {
      const index = current.blocks.findIndex((block) => block.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= current.blocks.length) return current
      const blocks = [...current.blocks]
      const [block] = blocks.splice(index, 1)
      blocks.splice(nextIndex, 0, block)
      return { ...current, blocks }
    })
  }

  function removeSelected() {
    if (!selectedId) return
    setDocument((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== selectedId),
    }))
    setSelectedId(null)
    setNotice('Block removed')
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    const kind = event.dataTransfer.getData('application/x-builder-block') as BlockKind
    if (blockLibrary.some((item) => item.kind === kind)) addBlock(kind)
  }


  async function copyExport() {
    const text = exportMode === 'brief' ? agentBrief : jsonExport
    setIsLoadingExport(true)
    try {
      await navigator.clipboard.writeText(text)
      setNotice(exportMode === 'brief' ? 'Agent brief copied' : 'JSON copied')
    } catch {
      setNotice('Clipboard access failed — select the text manually')
    } finally {
      setIsLoadingExport(false)
    }
  }

  function downloadJson() {
    const blob = new Blob([jsonExport], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = `${document.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'page'}.json`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('JSON downloaded')
  }

  return (
    <main className="builder-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Lay4Canvas">
          <span className="brand-mark" aria-hidden="true">L4</span>
          <div>
            <strong>Lay4Canvas</strong>
            <span>Working prototype</span>
          </div>
        </div>

        <label className="page-name">
          <span>Page</span>
          <input
            type="text"
            value={document.name}
            onChange={(event) => setDocument((current) => ({ ...current, name: event.target.value }))}
            aria-label="Page name"
          />
        </label>

        <div className="viewport-switcher" aria-label="Preview width">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((item) => (
            <button
              key={item}
              type="button"
              className={viewport === item ? 'active' : ''}
              onClick={() => setViewport(item)}
              aria-pressed={viewport === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="topbar-actions">
          <span className="save-status">{notice}</span>
          <button type="button" className="export-button" onClick={() => setShowExport(true)}>
            Export build pack
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="left-rail" aria-label="Blocks and layers">
          <section className="rail-section palette-section">
            <div className="section-heading">
              <span>Blocks</span>
              <small>Drag or click</small>
            </div>
            <div className="block-library">
              {blockLibrary.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  draggable
                  className="library-item"
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/x-builder-block', item.kind)
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
                  onClick={() => addBlock(item.kind)}
                >
                  <span className={`block-glyph glyph-${item.kind}`} aria-hidden="true" />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="add-symbol" aria-hidden="true">+</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rail-section layers-section">
            <div className="section-heading">
              <span>Layers</span>
              <small>{document.blocks.length} blocks</small>
            </div>
            <div className="structure-tree" aria-label="Page structure">
              <span className="structure-root">Page · {document.name}</span>
              <span className="structure-section">└ {document.section.name} · {document.section.layout}</span>
            </div>
            <ol className="layer-list">
              {document.blocks.map((block, index) => (
                <li key={block.id}>
                  <button
                    type="button"
                    className={selectedId === block.id ? 'layer active' : 'layer'}
                    onClick={() => setSelectedId(block.id)}
                  >
                    <span className="layer-index">{String(index + 1).padStart(2, '0')}</span>
                    <span>{block.kind}</span>
                  </button>
                  {selectedId === block.id && (
                    <div className="layer-actions" aria-label={`Move ${block.kind}`}>
                      <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={index === 0} aria-label="Move block up">↑</button>
                      <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={index === document.blocks.length - 1} aria-label="Move block down">↓</button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </aside>

        <section
          className="stage"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          aria-label="Page canvas"
        >
          <div className="stage-ruler">
            <span>{viewportWidths[viewport]} px · {Math.round(canvasScale * 100)}%</span>
            <span className="canvas-guidance">Drop blocks into {document.section.name}</span>
            <div className="zoom-switcher" aria-label="Canvas zoom">
              <button type="button" className={zoomMode === 'fit' ? 'active' : ''} onClick={() => setZoomMode('fit')} aria-pressed={zoomMode === 'fit'}>Fit</button>
              <button type="button" className={zoomMode === 'actual' ? 'active' : ''} onClick={() => setZoomMode('actual')} aria-pressed={zoomMode === 'actual'}>100%</button>
            </div>
          </div>
          <div className="canvas-wrap">
            <div
              className="page-transform"
              style={{
                width: `${viewportWidths[viewport] * canvasScale}px`,
                minHeight: `${820 * canvasScale}px`,
              }}
            >
              <article
                className={`page-preview viewport-${viewport}`}
                style={{
                  width: `${viewportWidths[viewport]}px`,
                  transform: `scale(${canvasScale})`,
                }}
              >
                {document.blocks.length === 0 && (
                  <button type="button" className="empty-canvas" onClick={() => addBlock('heading')}>
                    Add the first block
                  </button>
                )}
                {document.blocks.map((block) => (
                  <PreviewBlock
                    key={block.id}
                    block={block}
                    viewport={viewport}
                    selected={block.id === selectedId}
                    onSelect={() => setSelectedId(block.id)}
                  />
                ))}
              </article>
            </div>
          </div>
          <div className="intent-rail" aria-live="polite">
            <span className="intent-label">Intent trace</span>
            <code>{selectedBlock ? `page > hero > ${describeBlock(selectedBlock, viewport)}` : 'Select a block to inspect its constraints'}</code>
          </div>
        </section>

        <aside className="inspector" aria-label="Block inspector">
          <div className="section-heading inspector-heading">
            <span>Inspector</span>
            <small>{selectedBlock?.kind ?? 'No selection'}</small>
          </div>

          {selectedBlock ? (
            <form className="inspector-form" onSubmit={(event) => event.preventDefault()}>
              {selectedBlock.kind !== 'divider' && (
                <label className="field-group">
                  <span>Content</span>
                  <textarea
                    value={selectedBlock.content}
                    rows={selectedBlock.kind === 'heading' || selectedBlock.kind === 'body' ? 4 : 2}
                    onChange={(event) => updateSelected({ content: event.target.value })}
                  />
                </label>
              )}

              <fieldset className="field-group">
                <legend>Alignment</legend>
                <div className="segmented-control">
                  {(['start', 'center', 'end'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      className={selectedBlock.align === align ? 'active' : ''}
                      onClick={() => updateSelected({ align })}
                      aria-pressed={selectedBlock.align === align}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="field-group range-field">
                <span>Width · {viewport} <output>{selectedBlock.widths[viewport]}%</output></span>
                <input
                  type="range"
                  min="24"
                  max="100"
                  value={selectedBlock.widths[viewport]}
                  onChange={(event) => updateSelected({
                    widths: {
                      ...selectedBlock.widths,
                      [viewport]: Number(event.target.value),
                    },
                  })}
                />
                <small className="breakpoint-note">Stored as an explicit {viewport} constraint.</small>
              </label>

              {(selectedBlock.kind === 'button' || selectedBlock.kind === 'image') && (
                <label className="field-group range-field">
                  <span>Corner radius <output>{selectedBlock.radius}px</output></span>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={selectedBlock.radius}
                    onChange={(event) => updateSelected({ radius: Number(event.target.value) })}
                  />
                </label>
              )}

              <fieldset className="field-group">
                <legend>Tone</legend>
                <div className="tone-options">
                  {(['ink', 'accent', 'quiet'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      className={selectedBlock.tone === tone ? `tone ${tone} active` : `tone ${tone}`}
                      onClick={() => updateSelected({ tone })}
                      aria-pressed={selectedBlock.tone === tone}
                    >
                      <span aria-hidden="true" />
                      {tone}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button type="button" className="remove-button" onClick={removeSelected}>
                Remove block
              </button>
            </form>
          ) : (
            <div className="inspector-empty">
              <span aria-hidden="true">↖</span>
              <p>Select a block on the canvas or in Layers to edit its intent.</p>
            </div>
          )}
        </aside>
      </section>

      {showExport && (
        <section className="export-overlay" role="dialog" aria-modal="true" aria-labelledby="export-title">
          <button type="button" className="overlay-dismiss" onClick={() => setShowExport(false)} aria-label="Close export panel" />
          <div className="export-panel">
            <header>
              <div>
                <span className="export-kicker">Portable by default</span>
                <h2 id="export-title">Export build pack</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setShowExport(false)} aria-label="Close export panel">×</button>
            </header>
            <div className="export-tabs" role="tablist" aria-label="Export format">
              <button type="button" role="tab" aria-selected={exportMode === 'brief'} className={exportMode === 'brief' ? 'active' : ''} onClick={() => setExportMode('brief')}>Agent brief</button>
              <button type="button" role="tab" aria-selected={exportMode === 'json'} className={exportMode === 'json' ? 'active' : ''} onClick={() => setExportMode('json')}>Page JSON</button>
            </div>
            <pre>{exportMode === 'brief' ? agentBrief : jsonExport}</pre>
            <footer>
              <p>{exportMode === 'brief' ? 'Use this as a precise implementation handoff.' : 'Keep the editable source outside this builder.'}</p>
              <div>
                {exportMode === 'json' && <button type="button" className="secondary-action" onClick={downloadJson}>Download JSON</button>}
                <button type="button" className="primary-action" onClick={copyExport} disabled={isLoadingExport}>{isLoadingExport ? 'Copying…' : `Copy ${exportMode === 'brief' ? 'brief' : 'JSON'}`}</button>
              </div>
            </footer>
          </div>
        </section>
      )}
    </main>
  )
}

interface PreviewBlockProps {
  block: BuilderBlock
  viewport: Viewport
  selected: boolean
  onSelect: () => void
}

function PreviewBlock({ block, viewport, selected, onSelect }: PreviewBlockProps) {
  const style = {
    width: `${block.widths[viewport]}%`,
    marginInlineStart: block.align === 'end' ? 'auto' : block.align === 'center' ? 'auto' : undefined,
    marginInlineEnd: block.align === 'center' ? 'auto' : undefined,
    textAlign: block.align,
    borderRadius: `${block.radius}px`,
  } as const

  return (
    <button
      type="button"
      className={`preview-block kind-${block.kind} tone-${block.tone}${selected ? ' selected' : ''}`}
      style={style}
      onClick={onSelect}
      aria-label={`Select ${block.kind}: ${block.content}`}
    >
      {block.kind === 'eyebrow' && <span>{block.content}</span>}
      {block.kind === 'heading' && <span className="preview-heading">{block.content}</span>}
      {block.kind === 'body' && <span className="preview-body">{block.content}</span>}
      {block.kind === 'button' && <span className="preview-button-label">{block.content}</span>}
      {block.kind === 'image' && (
        <span className="image-field">
          <span className="image-orbit orbit-one" />
          <span className="image-orbit orbit-two" />
          <span className="image-card">{block.content}</span>
        </span>
      )}
      {block.kind === 'divider' && <span className="divider-line" />}
    </button>
  )
}

export default App
