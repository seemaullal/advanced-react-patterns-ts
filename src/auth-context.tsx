import * as React from 'react'
import type {User} from './types'

// normally this is going to implement a similar pattern
// learn more here: https://kcd.im/auth

const AuthContext = React.createContext<{user: User}>({
  user: {username: 'jakiechan', tagline: '', bio: ''},
})
AuthContext.displayName = 'AuthContext'
const AuthProvider = ({user, ...props}: {user: {user: User}; props: any}) => (
  <AuthContext.Provider value={user} {...props} />
)

function useAuth() {
  return React.useContext(AuthContext)
}

export {AuthProvider, useAuth}
