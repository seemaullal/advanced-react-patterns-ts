import React from 'react'
import * as userClient from '../../user-client'
import {useAuth} from '../../auth-context'
import type {User} from '../../types'

type UserReducerAction =
  | {type: 'start update'; updates: User}
  | {type: 'finish update'; updatedUser: User}
  | {type: 'fail update'; error: Error}
  | {type: 'reset'}

interface UserReducerState {
  user: User
  status: 'pending' | 'resolved' | 'rejected' | null
  storedUser: null | User
  error: null | Error
}

interface UserContextValue {
  state: UserReducerState
  dispatch: React.Dispatch<UserReducerAction>
}

const UserContext = React.createContext<UserContextValue>(null!)
UserContext.displayName = 'UserContext'

function userReducer(
  state: UserReducerState,
  action: UserReducerAction,
): UserReducerState {
  switch (action.type) {
    case 'start update': {
      return {
        ...state,
        user: {...state.user, ...action.updates},
        status: 'pending',
        storedUser: state.user,
      }
    }
    case 'finish update': {
      return {
        ...state,
        user: action.updatedUser,
        status: 'resolved',
        storedUser: null,
        error: null,
      }
    }
    case 'fail update': {
      return {
        ...state,
        status: 'rejected',
        error: action.error,
        user: state.storedUser as User,
        storedUser: null,
      }
    }
    case 'reset': {
      return {
        ...state,
        status: null,
        error: null,
      }
    }
  }
}

function useUser() {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider`)
  }
  return context
}

function updateUser(
  dispatch: React.Dispatch<UserReducerAction>,
  user: any,
  updates: any,
) {
  dispatch({type: 'start update', updates})
  return userClient.updateUser(user, updates).then(
    updatedUser => dispatch({type: 'finish update', updatedUser}),
    error => dispatch({type: 'fail update', error}),
  )
}

function UserProvider({children}: {children: React.ReactNode}) {
  const {user} = useAuth()
  const [state, dispatch] = React.useReducer(userReducer, {
    status: null,
    error: null,
    storedUser: user,
    user,
  })
  const value = {state, dispatch}
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export {UserProvider, useUser, updateUser}
