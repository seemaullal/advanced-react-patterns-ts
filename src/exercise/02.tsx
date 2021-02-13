// Compound Components
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {Switch} from '../switch'

function Toggle({children}: {children: React.ReactNode}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return (
    <>
      {React.Children.map(children, (child, index) => {
        //@ts-expect-errors
        return React.cloneElement(child, {
          on,
          toggle,
        })
      })}
    </>
  )
}

const ToggleOn: React.FC<{on?: boolean}> = ({on, children}) => {
  return on ? <>{children}</> : null
}

const ToggleOff: React.FC<{on?: boolean}> = ({on, children}) => {
  return on ? null : <>{children}</>
}

function ToggleButton(
  props: Partial<React.ComponentProps<typeof Switch>> &
    Partial<{on: boolean; toggle: () => void}>,
) {
  const {on = false, toggle = () => void 0, ...otherProps} = props
  return <Switch on={on} onClick={toggle || (() => void 0)} {...otherProps} />
}

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <ToggleButton />
      </Toggle>
    </div>
  )
}

export default App
