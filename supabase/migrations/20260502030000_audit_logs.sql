
-- Audit logs for security monitoring
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'auth_failure', 'rate_limit_hit', etc.
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: only admins (service role) can write. Standard users can't see these.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- No policies = restricted to service_role by default.

CREATE INDEX audit_logs_event_idx ON public.audit_logs(event_type);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs(created_at);
