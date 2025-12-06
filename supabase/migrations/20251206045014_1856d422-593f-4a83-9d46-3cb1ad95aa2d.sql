
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only super_admin can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create channels table
CREATE TABLE public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    youtube_channel_id TEXT UNIQUE,
    logo_url TEXT,
    subscribers_count TEXT DEFAULT '0',
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Channels are viewable by everyone"
ON public.channels FOR SELECT USING (true);

CREATE POLICY "Only super_admin can manage channels"
ON public.channels FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create summaries table
CREATE TABLE public.summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_url TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail TEXT,
    channel_id UUID REFERENCES public.channels(id),
    category TEXT NOT NULL DEFAULT 'Technology',
    intro TEXT NOT NULL,
    key_points JSONB NOT NULL DEFAULT '[]',
    read_time_minutes INTEGER DEFAULT 5,
    listen_time_minutes INTEGER DEFAULT 3,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Summaries are viewable by everyone"
ON public.summaries FOR SELECT USING (true);

CREATE POLICY "Only super_admin can insert summaries"
ON public.summaries FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super_admin can update summaries"
ON public.summaries FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super_admin can delete summaries"
ON public.summaries FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create channel_followers table
CREATE TABLE public.channel_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, channel_id)
);

ALTER TABLE public.channel_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Followers are viewable by everyone"
ON public.channel_followers FOR SELECT USING (true);

CREATE POLICY "Users can follow channels"
ON public.channel_followers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow channels"
ON public.channel_followers FOR DELETE
USING (auth.uid() = user_id);

-- Function to update followers count
CREATE OR REPLACE FUNCTION public.update_channel_followers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.channels SET followers_count = followers_count + 1 WHERE id = NEW.channel_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.channels SET followers_count = followers_count - 1 WHERE id = OLD.channel_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for followers count
CREATE TRIGGER on_channel_follow_change
AFTER INSERT OR DELETE ON public.channel_followers
FOR EACH ROW EXECUTE FUNCTION public.update_channel_followers_count();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)));
    
    -- Assign super_admin role if email matches
    IF NEW.email = 'chandusahuofficial@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
    ELSE
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON public.channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at
BEFORE UPDATE ON public.summaries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
