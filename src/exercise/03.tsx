// Flexible Compound Components
// http://localhost:3000/isolated/exercise/03.js

import React, {useContext} from 'react'
import {Switch} from '../switch'

interface ToggleContextInterface {
  on: boolean
  toggle: () => void
}
const ToggleContext = React.createContext<ToggleContextInterface | null>(null)

function Toggle({children}: {children: React.ReactNode}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)
  return (
    <ToggleContext.Provider value={{on, toggle}}>
      {children}
    </ToggleContext.Provider>
  )
}

function useToggle() {
  const toggleContext = useContext(ToggleContext)
  if (!toggleContext)
    throw new Error(
      'useToggle should only be used in a component wrapped in Toggle or <ToggleContext.Provider>',
    )
  return toggleContext
}

function ToggleOn({children}: {children: React.ReactNode}) {
  const {on} = useToggle()
  return on ? <>{children}</> : null
}

function ToggleOff({children}: {children: React.ReactNode}) {
  const {on} = useToggle()
  return on ? null : <>{children}</>
}

function ToggleButton({
  ...props
}: Partial<React.ComponentProps<typeof Switch>>) {
  const {on, toggle} = useToggle()
  return <Switch on={on} onClick={toggle} {...props} />
}

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <div>
          <ToggleButton />
        </div>
      </Toggle>
    </div>
  )
}

export default App
