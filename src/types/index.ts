export type User = {
  id: string
  display_name: string
  role: 'user' | 'admin'
}

export type Label = {
  id: string
  name: string
}

export type Comment = {
  id: string
  ticket_id: string
  author_id: {
    display_name: string
  }
  body: string
  created_at: string
}

export type Ticket = {
  id: string
  title: string
  description: string
  status: 'open' | 'closed'
  created_by: {
    display_name: string
    role: string
  }
  labels: Label[]
  comments: Comment[]
  created_at: string
  updated_at: string
}
