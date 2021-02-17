// Control Props
// http://localhost:3000/isolated/exercise/06.js

import React, {useEffect, useRef} from 'react'
import {Switch} from '../switch'

const callAll = (...fns: ((...args: any) => unknown)[]) => (...args: any) =>
  fns.forEach(fn => fn?.(...args))

interface ToggleReducerState {
  on: boolean
}

interface TogglerProps {
  'aria-pressed': boolean
  onClick: (...args: unknown[]) => void
  on: boolean
  toggle: () => void
}

enum ToggleReducerActions {
  RESET = 'reset',
  TOGGLE = 'toggle',
}

type ToggleReducerActionType =
  | {type: ToggleReducerActions.TOGGLE}
  | {type: ToggleReducerActions.RESET; initialState: ToggleReducerState}

function useControlledSwitchWarning<T>(
  controlPropValue: T,
  controlPropName: string,
  componentName: string,
) {
  const onIsControlled = controlPropValue === null
  const {current: onWasControlled} = React.useRef(onIsControlled)

  useEffect(() => {
    if (onIsControlled && !onWasControlled) {
      console.error(
        `${componentName} is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled ${componentName}  for the lifetime of the component. Check the ${controlPropName}  prop.`,
      )
    }
    if (!onIsControlled && onWasControlled) {
      console.error(
        `\`${componentName}\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
      )
    }
  }, [componentName, controlPropName, onIsControlled, onWasControlled])
}

function useReadOnlyControlledComponentWarning<T>(
  controlPropValue: T,
  controlPropName: string,
  hasOnChange: boolean,
  onChangeProp: string,
  readOnly: boolean,
  readOnlyProp: string,
  componentName: string,
  initialValueProp: string,
) {
  const onIsControlled = controlPropValue === null
  useEffect(() => {
    if (onIsControlled && hasOnChange && !readOnlyProp) {
      console.error(
        `A \`${controlPropName}\` prop was provided to \`${componentName}\` without an \`${onChangeProp}\` handler. This will result in a read-only \`${controlPropName}\` value. If you want it to be mutable, use \`${initialValueProp}\`. Otherwise, set either \`${onChangeProp}\` or \`${readOnlyProp}\`.`,
      )
    }
  }, [
    componentName,
    controlPropName,
    hasOnChange,
    initialValueProp,
    onChangeProp,
    onIsControlled,
    readOnlyProp,
  ])
}
function toggleReducer(
  state: ToggleReducerState,
  action: ToggleReducerActionType,
) {
  switch (action.type) {
    case ToggleReducerActions.TOGGLE: {
      return {on: !state.on}
    }
    case ToggleReducerActions.RESET: {
      return action.initialState
    }
  }
}

function useToggle(
  {
    initialOn = false,
    reducer = toggleReducer,
    onChange = null,
    on: controlledOn = null,
    readOnly = false,
  } = {} as {
    initialOn?: boolean
    reducer?: typeof toggleReducer
    onChange?: (
      state: ToggleReducerState,
      action: ToggleReducerActionType,
    ) => void
    on?: boolean
    readOnly?: boolean
  },
) {
  const {current: initialState} = useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const onIsControlled = controlledOn !== null
  const on = onIsControlled && controlledOn !== null ? controlledOn : state.on
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useControlledSwitchWarning(controlledOn, 'on', 'useToggle')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReadOnlyControlledComponentWarning(
      controlledOn,
      'on',
      onChange === null,
      'onChange',
      readOnly,
      'readOnly',
      'useToggle',
      'initialOn',
    )
  }

  function dispatchWithOnChange(action: ToggleReducerActionType) {
    if (!onIsControlled) {
      dispatch(action)
    }
    if (onChange) {
      onChange(reducer({...state, on}, action), action)
    }
  }

  const toggle = () => dispatchWithOnChange({type: ToggleReducerActions.TOGGLE})
  const reset = () =>
    dispatchWithOnChange({type: ToggleReducerActions.RESET, initialState})

  function getTogglerProps<
    T extends Partial<React.ComponentProps<typeof Switch>> &
      Partial<TogglerProps>
  >({onClick, ...props} = {} as T) {
    return {
      'aria-pressed': on,
      onClick: onClick ? callAll(onClick, toggle) : toggle,
      ...props,
    }
  }

  function getResetterProps<
    T extends Partial<React.ComponentProps<typeof Switch>> &
      Partial<TogglerProps>
  >({onClick, ...props} = {} as T) {
    return {
      onClick: onClick ? callAll(onClick, toggle) : toggle,
      ...props,
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

function Toggle({
  on: controlledOn,
  onChange,
}: {
  on?: boolean
  onChange?: (
    state: ToggleReducerState,
    action: ToggleReducerActionType,
  ) => void
}) {
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange})
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(
    state: ToggleReducerState,
    action: ToggleReducerActionType,
  ) {
    if (action.type === ToggleReducerActions.TOGGLE && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}
