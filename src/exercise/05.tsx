// State Reducer
// http://localhost:3000/isolated/exercise/05.js

import React, {useCallback} from 'react'
import {Switch} from '../switch'

interface ToggleReducerState {
  on: boolean
}

type ToggleReducerActionType =
  | {type: 'toggle'}
  | {type: 'reset'; initialState: ToggleReducerState}

const toggleReducer: React.Reducer<
  ToggleReducerState,
  ToggleReducerActionType
> = (state, action) => {
  switch (action.type) {
    case 'toggle': {
      return {on: !state.on}
    }
    case 'reset': {
      return action.initialState
    }
  }
}

interface TogglerProps {
  'aria-pressed': boolean
  onClick: (...args: unknown[]) => void
  on: boolean
  toggle: () => void
}

function useToggle({initialOn = false, reducer = toggleReducer} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const {on} = state

  const toggle = () => dispatch({type: 'toggle'})
  const reset = () => dispatch({type: 'reset', initialState})

  function getTogglerProps<
    T extends Partial<React.ComponentProps<typeof Switch>> &
      Partial<TogglerProps>
  >(customProps = {} as T) {
    const {onClick, ...otherProps} = customProps
    const onClickHandler =
      onClick ?? typeof onClick === 'function'
        ? () => {
            toggle()
            onClick()
          }
        : toggle
    return {
      'aria-pressed': on,
      onClick: onClickHandler,
      ...otherProps,
    }
  }

  function getResetterProps<
    T extends Partial<React.ComponentProps<typeof Switch>> &
      Partial<TogglerProps>
  >(props = {} as T) {
    const {onClick, ...otherProps} = props
    const onClickHandler =
      onClick ?? typeof onClick === 'function'
        ? () => {
            toggle()
            onClick()
          }
        : toggle
    return {
      onClick: onClickHandler,
      ...otherProps,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function App() {
  const [timesClicked, setTimesClicked] = React.useState(0)
  const clickedTooMuch = timesClicked >= 4

  const toggleStateReducer = useCallback(
    (state: ToggleReducerState, action: ToggleReducerActionType) => {
      switch (action.type) {
        case 'toggle': {
          if (clickedTooMuch) {
            return {on: state.on}
          }
          return {on: !state.on}
        }
        case 'reset': {
          return {on: false}
        }
      }
    },
    [clickedTooMuch],
  )

  const {on, getTogglerProps, getResetterProps} = useToggle({
    reducer: toggleStateReducer,
  })
  return (
    <div>
      <Switch
        {...getTogglerProps({
          disabled: clickedTooMuch,
          on: on,
          onClick: () => setTimesClicked(count => count + 1),
        })}
      />
      {clickedTooMuch ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : timesClicked > 0 ? (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      ) : null}
      <button {...getResetterProps({onClick: () => setTimesClicked(0)})}>
        Reset
      </button>
    </div>
  )
}

export default App
