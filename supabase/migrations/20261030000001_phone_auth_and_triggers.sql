-- Migration: 20261030000001_phone_auth_and_triggers.sql
-- Description: Phone OTP Auth support, auto profile creation, and RLS policies

-- 1. Ensure public.profiles has INSERT policy for authenticated users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
            ON public.profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 2. Trigger function to automatically create profile and assign customer role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
    extracted_name TEXT;
    extracted_phone TEXT;
BEGIN
    -- Extract full name from raw_user_meta_data if present
    extracted_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );

    -- Extract phone from auth user or metadata
    extracted_phone := COALESCE(
        NEW.phone,
        NEW.raw_user_meta_data->>'phone',
        ''
    );

    -- 1. Insert or update public.profiles
    INSERT INTO public.profiles (id, full_name, phone, created_at, updated_at)
    VALUES (
        NEW.id,
        NULLIF(extracted_name, ''),
        NULLIF(extracted_phone, ''),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        full_name = CASE 
            WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
            THEN EXCLUDED.full_name 
            ELSE public.profiles.full_name 
        END,
        updated_at = timezone('utc'::text, now());

    -- 2. Assign default 'customer' role if no role exists for this user
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.id, 'customer', timezone('utc'::text, now()))
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. Helper function to check if phone is verified
CREATE OR REPLACE FUNCTION public.is_phone_verified()
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT COALESCE(phone_confirmed_at IS NOT NULL, false)
        FROM auth.users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
