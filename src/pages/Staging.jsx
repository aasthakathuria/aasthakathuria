import { useState } from 'react'
import { CATEGORIES, UNITS } from '../constants'
import './Staging.css'

function Staging({ items: initialItems, onApprove, onCancel }) {
  const [items, setItems] = useState(initialItems)

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    )
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = items.filter((i) => i.category === cat.id)
    return acc
  }, {})

  const handleApprove = () => {
    const toSave = items.map(({ id, name, quantity, unit, category }) => ({
      id,
      name,
      quantity,
      unit,
      category,
      addedDate: new Date().toISOString(),
    }))
    onApprove(toSave)
  }

  if (items.length === 0) {
    return (
      <div className="staging">
        <div className="staging-actions">
          <button className="staging-btn secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <p className="staging-empty">No items found. Try another image.</p>
      </div>
    )
  }

  return (
    <div className="staging">
      <div className="staging-actions">
        <button className="staging-btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="staging-btn primary" onClick={handleApprove}>
          Approve
        </button>
      </div>

      <div className="staging-list">
        {CATEGORIES.map((cat) => {
          const list = grouped[cat.id] || []
          if (list.length === 0) return null
          return (
            <section key={cat.id} className="staging-category">
              <h3 className="staging-cat-title">{cat.label}</h3>
              {list.map((item) => (
                <div key={item.id} className="staging-item">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="staging-input name"
                  />
                  <div className="staging-item-meta">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="staging-input qty"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      className="staging-select"
                    >
                      {UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="staging-select"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="staging-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default Staging
