// Prop Collections and Getters
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {Switch} from '../switch'

interface TogglerProps {
  'aria-pressed': boolean
  onClick: (...args: unknown[]) => void
  on: boolean
  toggle: () => void
}

function useToggle() {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  function getTogglerProps<
    T extends Partial<React.ComponentProps<typeof Switch>> &
      Partial<TogglerProps>
  >(customProps = {} as T) {
    const {onClick, ...otherProps} = customProps
    const onClickHandler =
      onClick && typeof onClick === 'function'
        ? () => {
            onClick()
            toggle()
          }
        : toggle
    return {
      'aria-pressed': on,
      onClick: onClickHandler,
      ...otherProps,
    }
  }
  return {on, toggle, getTogglerProps}
}

function App() {
  const {on, getTogglerProps} = useToggle()
  return (
    <div>
      <Switch {...getTogglerProps({on})} />
      <hr />
      <button
        {...getTogglerProps({
          'aria-label': 'custom-button',
          onClick: () => console.info('onButtonClick'),
          id: 'custom-button-id',
        })}
      >
        {on ? 'on' : 'off'}
      </button>
    </div>
  )
}

export default App
