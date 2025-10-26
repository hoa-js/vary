import type { HoaExtension } from 'hoa'

declare module 'hoa' {
  interface HoaResponse {
    vary: (field: string | string[]) => void
  }
}

export declare function vary(): HoaExtension
export default vary