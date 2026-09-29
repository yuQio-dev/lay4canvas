export type BlockKind = 'eyebrow' | 'heading' | 'body' | 'button' | 'image' | 'divider'
export type TextAlign = 'start' | 'center' | 'end'
export type BlockTone = 'ink' | 'accent' | 'quiet'
export type Viewport = 'desktop' | 'tablet' | 'mobile'

export interface BuilderBlock {
  id: string
  kind: BlockKind
  content: string
  align: TextAlign
  widths: Record<Viewport, number>
  radius: number
  tone: BlockTone
}

export interface PageSection {
  name: string
  layout: 'stack' | 'split'
  mobileLayout: 'stack'
  gap: number
}

export interface PageDocument {
  name: string
  section: PageSection
  blocks: BuilderBlock[]
}

export const blockLibrary: Array<{
  kind: BlockKind
  label: string
  description: string
}> = [
  { kind: 'eyebrow', label: 'Eyebrow', description: 'Short context label' },
  { kind: 'heading', label: 'Heading', description: 'Primary page statement' },
  { kind: 'body', label: 'Body text', description: 'Supporting explanation' },
  { kind: 'button', label: 'Button', description: 'Primary call to action' },
  { kind: 'image', label: 'Image', description: 'Visual content field' },
  { kind: 'divider', label: 'Divider', description: 'Section rhythm' },
]

const defaults: Record<BlockKind, Omit<BuilderBlock, 'id' | 'kind'>> = {
  eyebrow: {
    content: 'Built for direct handoff',
    align: 'start',
    widths: { desktop: 72, tablet: 82, mobile: 100 },
    radius: 0,
    tone: 'accent',
  },
  heading: {
    content: 'Shape the page. Keep the intent.',
    align: 'start',
    widths: { desktop: 86, tablet: 92, mobile: 100 },
    radius: 0,
    tone: 'ink',
  },
  body: {
    content: 'Compose a responsive page visually, then export the constraints your coding agent needs.',
    align: 'start',
    widths: { desktop: 68, tablet: 78, mobile: 100 },
    radius: 0,
    tone: 'quiet',
  },
  button: {
    content: 'Build this page',
    align: 'start',
    widths: { desktop: 34, tablet: 42, mobile: 100 },
    radius: 10,
    tone: 'ink',
  },
  image: {
    content: 'Product preview',
    align: 'center',
    widths: { desktop: 100, tablet: 100, mobile: 100 },
    radius: 18,
    tone: 'quiet',
  },
  divider: {
    content: 'Section divider',
    align: 'start',
    widths: { desktop: 100, tablet: 100, mobile: 100 },
    radius: 0,
    tone: 'quiet',
  },
}

export function createBlock(kind: BlockKind): BuilderBlock {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${kind}-${Date.now()}-${Math.random().toString(16).slice(2)}`

  return {
    id,
    kind,
    ...defaults[kind],
    widths: { ...defaults[kind].widths },
  }
}

export function createStarterDocument(): PageDocument {
  return {
    name: 'Launch page',
    section: {
      name: 'Hero section',
      layout: 'stack',
      mobileLayout: 'stack',
      gap: 20,
    },
    blocks: [
      createBlock('eyebrow'),
      createBlock('heading'),
      createBlock('body'),
      createBlock('button'),
      createBlock('image'),
    ],
  }
}

export function describeBlock(block: BuilderBlock, viewport: Viewport = 'desktop'): string {
  const parts = [
    block.kind,
    `align=${block.align}`,
    `width.${viewport}=${block.widths[viewport]}%`,
    `tone=${block.tone}`,
  ]

  if (block.kind === 'button' || block.kind === 'image') {
    parts.push(`radius=${block.radius}px`)
  }

  return parts.join(' · ')
}

export function buildAgentBrief(document: PageDocument, viewport: Viewport): string {
  const lines = document.blocks.map((block, index) => {
    const label = block.content.trim() || block.kind
    const widths = `widths=desktop:${block.widths.desktop}%,tablet:${block.widths.tablet}%,mobile:${block.widths.mobile}%`
    return `${index + 1}. ${label} — ${block.kind} · align=${block.align} · ${widths} · tone=${block.tone}`
  })

  return [
    `Build the page “${document.name}”.`,
    `Primary review viewport: ${viewport}.`,
    `Structure: Page > ${document.section.name} > ordered blocks.`,
    `Section rules: layout=${document.section.layout}, mobile=${document.section.mobileLayout}, gap=${document.section.gap}px.`,
    'Preserve the following visual intent and ordering:',
    ...lines,
    'Use semantic HTML, visible keyboard focus, and responsive behavior without changing the content hierarchy.',
  ].join('\n')
}
