import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---- TYPES ----
export type Movie = {
  id: string
  title: string
  title_sq?: string
  slug: string
  year: number
  duration: string
  genre: string
  rating: number
  description_sq: string
  poster_url: string
  backdrop_url: string
  embed_url: string       // Bunny.net iframe URL
  subtitle_url?: string   // .vtt URL
  status: 'live' | 'draft'
  created_at: string
}

export type User = {
  id: string
  email: string
  username?: string
  role: 'free' | 'vip' | 'premium' | 'moderator' | 'admin'
  status: 'active' | 'blocked'
  created_at: string
}

// ---- MOVIE QUERIES ----
export async function getMovies(limit = 20) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Movie[]
}

export async function getMovieBySlug(slug: string) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .single()
  if (error) throw error
  return data as Movie
}

export async function getMoviesByGenre(genre: string, limit = 12) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'live')
    .eq('genre', genre)
    .order('rating', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Movie[]
}

export async function getTrendingMovies(limit = 5) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'live')
    .order('rating', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Movie[]
}

export async function searchMovies(query: string) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'live')
    .ilike('title', `%${query}%`)
    .limit(24)
  if (error) throw error
  return data as Movie[]
}

// ---- ADMIN QUERIES ----
export async function getAllMovies() {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Movie[]
}

export async function addMovie(movie: Omit<Movie, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('movies')
    .insert([movie])
    .select()
    .single()
  if (error) throw error
  return data as Movie
}

export async function updateMovie(id: string, updates: Partial<Movie>) {
  const { data, error } = await supabase
    .from('movies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Movie
}

export async function deleteMovie(id: string) {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- USERS (Admin) ----
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as User[]
}

export async function updateUserRole(id: string, role: User['role']) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
  if (error) throw error
}

export async function blockUser(id: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'blocked' })
    .eq('id', id)
  if (error) throw error
}
