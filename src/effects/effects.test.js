import { describe, expect, it } from 'vitest'
import { mixColor } from './portal.js'
import { snowflakeCount } from './snow.js'

describe('snowflakeCount', () => {
  it('scales with screen size', () => {
    expect(snowflakeCount(1920, 1080)).toBeGreaterThan(snowflakeCount(390, 844))
  })

  it('never drops below a visible amount or above a safe maximum', () => {
    expect(snowflakeCount(200, 200)).toBe(50)
    expect(snowflakeCount(7680, 4320)).toBe(300)
  })
})

describe('portal color shift', () => {
  it('starts at Christmas gold and ends at neon', () => {
    expect(mixColor([247, 217, 120], [34, 211, 238], 0)).toEqual([247, 217, 120])
    expect(mixColor([247, 217, 120], [34, 211, 238], 1)).toEqual([34, 211, 238])
  })

  it('blends halfway in the middle', () => {
    expect(mixColor([0, 0, 0], [100, 200, 50], 0.5)).toEqual([50, 100, 25])
  })
})
