import { describe, expect, it } from 'vitest'
import { buildAgentBrief, createBlock, createStarterDocument, describeBlock } from './model'

describe('builder model', () => {
  it('creates a starter document with an editable page path', () => {
    const document = createStarterDocument()

    expect(document.name).toBe('Launch page')
    expect(document.section.name).toBe('Hero section')
    expect(document.blocks.map((block) => block.kind)).toEqual([
      'eyebrow',
      'heading',
      'body',
      'button',
      'image',
    ])
  })

  it('describes constraints without losing implementation values', () => {
    const button = createBlock('button')
    button.align = 'center'
    button.widths.mobile = 48
    button.radius = 16

    expect(describeBlock(button, 'mobile')).toContain('button')
    expect(describeBlock(button, 'mobile')).toContain('align=center')
    expect(describeBlock(button, 'mobile')).toContain('width.mobile=48%')
    expect(describeBlock(button, 'mobile')).toContain('radius=16px')
  })

  it('exports ordered content and the selected review viewport', () => {
    const document = createStarterDocument()
    document.blocks[1].content = 'A portable page intent'

    const brief = buildAgentBrief(document, 'mobile')

    expect(brief).toContain('Build the page “Launch page”.')
    expect(brief).toContain('Primary review viewport: mobile.')
    expect(brief).toContain('Structure: Page > Hero section > ordered blocks.')
    expect(brief).toContain('2. A portable page intent')
    expect(brief).toContain('widths=desktop:86%,tablet:92%,mobile:100%')
    expect(brief).toContain('semantic HTML')
  })
})
