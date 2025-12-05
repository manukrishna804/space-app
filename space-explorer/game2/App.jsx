import React from 'react'
import JigsawBoard from './components/JigsawBoard'

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
      <header>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Solar System Jigsaw — Step 3</h1>
        <p style={{ color: '#555' }}>Slicing a planet image into draggable puzzle pieces.</p>
      </header>

      <main style={{ marginTop: 20 }}>
        <JigsawBoard />
      </main>
    </div>
  )
}
