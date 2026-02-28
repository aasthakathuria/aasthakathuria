import { useState, useEffect } from 'react'
import { getItems } from '../services/storageService'
import { CATEGORIES } from '../constants'
import './Pantry.css'

function Pantry() {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(getItems())
  }, [])

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = items.filter((i) => i.category === cat.id)
    return acc
  }, {})

  if (items.length === 0) {
    return (
      <div className="pantry-empty">
        <p>No items yet.</p>
        <p className="sub">Scan a receipt to add groceries.</p>
      </div>
    )
  }

  return (
    <div className="pantry">
      {CATEGORIES.map((cat) => {
        const list = grouped[cat.id] || []
        if (list.length === 0) return null
        return (
          <section key={cat.id} className="pantry-category">
            <h3 className="pantry-cat-title">{cat.label}</h3>
            <ul className="pantry-list">
              {list.map((item) => (
                <li key={item.id} className="pantry-item">
                  <span className="pantry-name">{item.name}</span>
                  <span className="pantry-qty">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export default Pantry
