import supabase from './supabaseClient'
import type { Ticket, Comment, Label } from '../types'

async function fetchProfilesByIds(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map<string, { display_name: string; role: string }>();
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, role')
    .in('user_id', uniqueIds);
  if (error) throw error;
  const map = new Map<string, { display_name: string; role: string }>();
  for (const row of data as any[]) {
    map.set(row.user_id, { display_name: row.display_name, role: row.role });
  }
  return map;
}

export async function getTickets(filters?: {
  status?: 'open' | 'closed'
  search?: string
  label?: string
}) {
  let query = supabase
    .from('tickets')
    .select(`
      *,
      comments:comments(id, body, created_at, author_id),
      tickets_labels:tickets_labels(label:labels(id, name))
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Label filter is applied client-side in the UI

  const { data, error } = await query

  if (error) throw error
  const rows = (data as any[]) || []

  const createdByIds = rows.map((t) => t.created_by)
  const commentAuthorIds = rows.flatMap((t) => (t.comments || []).map((c: any) => c.author_id))
  const profileMap = await fetchProfilesByIds([...createdByIds, ...commentAuthorIds])

  const normalized = rows.map((t) => ({
    ...t,
    created_by: profileMap.get(t.created_by) ?? { display_name: 'Unknown', role: 'user' },
    comments: (t.comments || []).map((c: any) => ({
      ...c,
      author_id: { display_name: profileMap.get(c.author_id)?.display_name ?? 'Unknown' },
    })),
    labels: (t.tickets_labels || []).map((tl: any) => tl.label).filter(Boolean),
  }))

  return normalized as Ticket[]
}

export async function getTicket(id: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      comments:comments(id, body, created_at, author_id),
      tickets_labels:tickets_labels(label:labels(id, name))
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  const row: any = data
  const profileMap = await fetchProfilesByIds([
    row.created_by,
    ...((row.comments || []).map((c: any) => c.author_id) as string[]),
  ])

  const normalized: Ticket = {
    ...row,
    created_by: profileMap.get(row.created_by) ?? { display_name: 'Unknown', role: 'user' },
    comments: (row.comments || []).map((c: any) => ({
      ...c,
      author_id: { display_name: profileMap.get(c.author_id)?.display_name ?? 'Unknown' },
    })),
    labels: (row.tickets_labels || []).map((tl: any) => tl.label).filter(Boolean),
  }
  return normalized
}

export async function createTicket(ticket: {
  title: string
  description: string
  labelIds?: string[]
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      title: ticket.title,
      description: ticket.description,
      created_by: user.id
    })
    .select()
    .single()

  if (error) throw error

  // Add labels if provided
  if (ticket.labelIds && ticket.labelIds.length > 0) {
    const ticketLabels = ticket.labelIds.map(labelId => ({
      ticket_id: data.id,
      label_id: labelId
    }))
    const { error: labelsError } = await supabase
      .from('tickets_labels')
      .insert(ticketLabels)

    if (labelsError) {
      // Surface a helpful message; most common cause is RLS blocking non-admins
      throw new Error(
        labelsError.message.includes('row-level security')
          ? 'You do not have permission to set labels. Make your user an admin or relax the tickets_labels RLS policy.'
          : labelsError.message
      )
    }
  }

  return data
}

export async function updateTicketStatus(id: string, status: 'open' | 'closed') {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addComment(ticketId: string, body: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      ticket_id: ticketId,
      author_id: user.id,
      body
    })
    .select('*')
    .single()

  if (error) throw error
  const profileMap = await fetchProfilesByIds([data.author_id as unknown as string])
  const normalized: Comment = {
    ...(data as any),
    author_id: { display_name: profileMap.get(data.author_id as unknown as string)?.display_name ?? 'Unknown' },
  }
  return normalized
}

export async function getLabels() {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name')

  if (error) throw error
  return data as Label[]
}

export async function createLabel(name: string) {
  const { data, error } = await supabase
    .from('labels')
    .insert({ name })
    .select()
    .single()

  if (error) throw error
  return data as Label
}

export async function updateLabel(id: string, name: string) {
  const { data, error } = await supabase
    .from('labels')
    .update({ name })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Label
}
