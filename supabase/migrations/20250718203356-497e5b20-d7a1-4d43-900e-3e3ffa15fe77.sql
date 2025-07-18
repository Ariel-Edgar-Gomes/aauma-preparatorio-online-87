
-- Adicionar o papel de admin ao usuário específico
-- Primeiro, vamos buscar o ID do usuário com o email arieledgargomes@gmail.com
-- e adicionar o papel de admin se ele não existir

DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'arieledgargomes@gmail.com';
    
    -- Se o usuário existe, adicionar o papel de admin
    IF user_uuid IS NOT NULL THEN
        -- Inserir o papel de admin se não existir
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_uuid, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Papel de admin adicionado ao usuário arieledgargomes@gmail.com';
    ELSE
        RAISE NOTICE 'Usuário arieledgargomes@gmail.com não encontrado';
    END IF;
END $$;
