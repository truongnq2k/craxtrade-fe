import jwtDecode from 'jwt-decode'
import type { DecodedToken } from '../store/auth'

export function decodeJwt(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch {
    return null
  }
}


