import { isBefore, startOfDay, addWeeks, addMonths, addYears, parseISO, format } from 'date-fns'
import { getSupabaseBrowserClient, Subscription } from './supabase'
const supabase = getSupabaseBrowserClient()

export const BILLING_CYCLES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Every 3 Months' },
  { id: 'half-yearly', label: 'Every 6 Months' },
  { id: 'yearly', label: 'Yearly' },
] as const

export function getMonthlyEquivalent(cost: number, cycle: string): number {
  if (cycle === 'weekly') return (cost * 52) / 12
  if (cycle === 'quarterly') return (cost * 4) / 12
  if (cycle === 'half-yearly') return (cost * 2) / 12
  if (cycle === 'yearly') return cost / 12
  return cost // monthly
}

export function calculateNextBillingDate(dateStr: string, cycle: string): string {
  let date = parseISO(dateStr)
  const today = startOfDay(new Date())

  while (isBefore(date, today)) {
    if (cycle === 'weekly') date = addWeeks(date, 1)
    else if (cycle === 'monthly') date = addMonths(date, 1)
    else if (cycle === 'quarterly') date = addMonths(date, 3)
    else if (cycle === 'half-yearly') date = addMonths(date, 6)
    else if (cycle === 'yearly') date = addYears(date, 1)
    else break 
  }
  return format(date, 'yyyy-MM-dd')
}

export async function autoRenewSubscriptions(subs: Subscription[]): Promise<Subscription[]> {
  let hasUpdates = false
  const updatedSubs = subs.map(sub => {
    if (sub.status === 'active' && sub.next_billing_date) {
      const billingDate = startOfDay(parseISO(sub.next_billing_date))
      const today = startOfDay(new Date())
      if (isBefore(billingDate, today)) {
        hasUpdates = true
        const nextDate = calculateNextBillingDate(sub.next_billing_date, sub.billing_cycle)
        
        // Fire and forget DB update
        supabase.from('subscriptions').update({ next_billing_date: nextDate }).eq('id', sub.id).then()
        
        return { ...sub, next_billing_date: nextDate }
      }
    }
    return sub
  })
  
  return updatedSubs
}

