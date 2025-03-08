// This is a server component wrapper that dynamically renders the ClientHeader
// It will get server-side rendered initially, then the ClientHeader will take over for client-side updates

import { ClientHeader } from '@/components/client-header'

export function Header() {
  return <ClientHeader />
}
