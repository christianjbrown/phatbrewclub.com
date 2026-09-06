import { redirect } from 'next/navigation'
import { getVenues } from '@/lib/cms'

export default async function FunctionsIndex() {
  const venues = await getVenues()
  redirect(`/functions/${venues[0]?.slug ?? 'west-perth'}`)
}
