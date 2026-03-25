// app/subscriptions/[id]/edit/page.tsx
export const runtime = 'edge'

import EditSubscriptionClient from './EditSubscriptionClient'

export default function Page() {
    return <EditSubscriptionClient />
}
