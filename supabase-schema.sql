-- =============================================
-- CINEAL DATABASE SCHEMA
-- Kopjo dhe ekzekuto në Supabase SQL Editor
-- =============================================

-- MOVIES TABLE
CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_sq TEXT,
  slug TEXT UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  duration TEXT NOT NULL,
  genre TEXT NOT NULL,
  rating DECIMAL(3,1) DEFAULT 0,
  description_sq TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  embed_url TEXT NOT NULL,
  subtitle_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('live', 'draft')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'vip', 'premium', 'moderator', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  membership_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WATCH HISTORY
CREATE TABLE watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  progress_seconds INTEGER DEFAULT 0
);

-- WATCHLIST
CREATE TABLE watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- RLS POLICIES
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Movies: public read for live, admin write
CREATE POLICY "Public can view live movies" ON movies
  FOR SELECT USING (status = 'live');

CREATE POLICY "Admin can do everything on movies" ON movies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Profiles: users see own profile, admin sees all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Admin can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Watch history: user sees own
CREATE POLICY "Users can manage own watch history" ON watch_history
  FOR ALL USING (user_id = auth.uid());

-- Watchlist: user manages own
CREATE POLICY "Users can manage own watchlist" ON watchlist
  FOR ALL USING (user_id = auth.uid());

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- INCREMENT VIEWS FUNCTION
CREATE OR REPLACE FUNCTION increment_views(movie_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE movies SET views = views + 1 WHERE id = movie_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SAMPLE DATA (test)
INSERT INTO movies (title, slug, year, duration, genre, rating, description_sq, poster_url, backdrop_url, embed_url, status) VALUES
(
  'Inception',
  'inception',
  2010,
  '2h 28min',
  'Sci-Fi',
  8.8,
  'Një hajdut i cili vjedh sekrete nga nënndërgjegjja njerëzore gjatë gjumit, merr detyra të kundërta — të implantojë një ide në mendjen e dikujt.',
  'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
  'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
  'https://iframe.mediadelivery.net/embed/YOUR_LIBRARY_ID/YOUR_VIDEO_ID',
  'live'
);
