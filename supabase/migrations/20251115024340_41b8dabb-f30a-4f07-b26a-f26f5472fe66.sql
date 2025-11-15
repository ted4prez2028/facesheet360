-- Fix generate_ticket_number to have proper search_path
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'TKT-' || to_char(nextval('ticket_number_seq'), 'FM00000');
END;
$$;