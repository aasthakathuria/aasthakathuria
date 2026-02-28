import Tesseract from 'tesseract.js'
import { CATEGORIES, UNITS } from '../constants'

const CATEGORY_KEYWORDS = {
  produce: ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'carrot', 'onion', 'broccoli', 'potato', 'fruit', 'vegetable', 'avocado', 'spinach', 'celery', 'pepper', 'cucumber', 'grape', 'berry', 'melon'],
  bakery: ['bread', 'bagel', 'croissant', 'muffin', 'roll', 'cake', 'cookie', 'pastry', 'tortilla', 'pita'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'],
  meat: ['chicken', 'beef', 'pork', 'turkey', 'bacon', 'sausage', 'fish', 'salmon', 'steak', 'ground'],
  pantry: ['rice', 'pasta', 'flour', 'sugar', 'oil', 'cereal', 'beans', 'sauce', 'soup', 'canned', 'spice', 'salt', 'pepper', 'nut', 'honey', 'jam', 'peanut'],
  frozen: ['frozen', 'ice cream', 'pizza', 'fries'],
  beverages: ['juice', 'soda', 'water', 'coffee', 'tea', 'milk', 'drink', 'beer', 'wine'],
}

function guessCategory(name) {
  const lower = name.toLowerCase()
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return catId
  }
  return 'other'
}

function parseQuantityAndUnit(text) {
  const trimmed = text.trim()
  const numMatch = trimmed.match(/^([\d.]+)\s*(lb|oz|g|kg|pcs|units|lbs|oz\.?)?$/i)
  if (numMatch) {
    const qty = parseFloat(numMatch[1]) || 1
    let unit = (numMatch[2] || 'units').toLowerCase().replace(/\.$/, '')
    if (unit === 'lbs') unit = 'lb'
    return { quantity: qty, unit: UNITS.find((u) => u.id === unit) ? unit : 'units' }
  }
  const justNum = trimmed.match(/^([\d.]+)$/)
  if (justNum) return { quantity: parseFloat(justNum[1]) || 1, unit: 'units' }
  return { quantity: 1, unit: 'units' }
}

function parseLine(line) {
  const cleaned = line.replace(/^\s*[-•*]\s*/, '').trim()
  if (cleaned.length < 2) return null

  const parts = cleaned.split(/\s{2,}|\t/)
  let name = cleaned
  let quantity = 1
  let unit = 'units'

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1]
    const parsed = parseQuantityAndUnit(lastPart)
    if (parsed.unit !== 'units' || parsed.quantity !== 1) {
      name = parts.slice(0, -1).join(' ').trim()
      quantity = parsed.quantity
      unit = parsed.unit
    }
  }

  const qtyMatch = name.match(/([\d.]+)\s*(lb|oz|g|kg|pcs|units?)\s*$/i)
  if (qtyMatch) {
    name = name.replace(qtyMatch[0], '').trim()
    quantity = parseFloat(qtyMatch[1]) || 1
    unit = (qtyMatch[2] || 'units').toLowerCase()
    if (unit === 'lbs') unit = 'lb'
    if (!UNITS.find((u) => u.id === unit)) unit = 'units'
  }

  if (name.length < 1) return null

  return {
    name: name.replace(/\s+/g, ' ').trim(),
    quantity,
    unit,
    category: guessCategory(name),
  }
}

export async function extractTextFromImage(imageFile) {
  const { data } = await Tesseract.recognize(imageFile, 'eng', {
    logger: (m) => m.status === 'recognizing text' && console.log(m.progress),
  })
  return data.text
}

const JUNK_PATTERNS = [
  /^ingredients$/i, /^nutrition/i, /^net wt/i, /^serving/i,
  /^calories$/i, /^fat$/i, /^protein$/i, /^carb/i, /^sodium/i,
  /^allergen/i, /^contains:/i, /^made in/i, /^distributed/i,
  /^\d+%$/i, /^fl oz$/i, /^ml$/i, /^g\.?$/i,
]

function isJunkLine(line) {
  const t = line.trim()
  if (t.length < 2 || t.length > 60) return true
  return JUNK_PATTERNS.some((p) => p.test(t))
}

function parseAsProduct(text) {
  const lines = text.split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 2 && !isJunkLine(l))

  if (lines.length === 0) return []

  const qtyMatch = text.match(/([\d.]+)\s*(lb|oz|g|kg|lbs)\b/i)
  let quantity = 1
  let unit = 'units'
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1]) || 1
    const u = (qtyMatch[2] || '').toLowerCase()
    unit = u === 'lbs' ? 'lb' : ['lb', 'oz', 'g', 'kg'].includes(u) ? u : 'units'
  }

  const topLines = lines.slice(0, 3)
  const name = topLines.join(' ').replace(/\s+/g, ' ').trim().slice(0, 80)
  if (name.length < 2) return []

  return [{
    id: crypto.randomUUID(),
    name,
    quantity,
    unit,
    category: guessCategory(name),
  }]
}

export function parseItemsFromText(text) {
  const lines = text.split(/\n/).filter((l) => l.trim())
  const seen = new Set()
  const items = []

  for (const line of lines) {
    const item = parseLine(line)
    if (item && !seen.has(item.name.toLowerCase())) {
      seen.add(item.name.toLowerCase())
      items.push({
        id: crypto.randomUUID(),
        ...item,
      })
    }
  }

  if (items.length === 0 && text.trim().length > 3) {
    return parseAsProduct(text)
  }

  return items
}
