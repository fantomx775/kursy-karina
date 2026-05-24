ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS company_invoice_requested BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS invoice_provider TEXT,
  ADD COLUMN IF NOT EXISTS invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_status TEXT,
  ADD COLUMN IF NOT EXISTS invoice_error TEXT,
  ADD COLUMN IF NOT EXISTS invoice_issued_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_invoice_provider_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_invoice_provider_check
      CHECK (invoice_provider IS NULL OR invoice_provider IN ('stripe', 'fakturownia'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_invoice_status_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_invoice_status_check
      CHECK (invoice_status IS NULL OR invoice_status IN ('pending', 'issued', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_invoice_provider_id
  ON public.orders(invoice_provider, invoice_id)
  WHERE invoice_id IS NOT NULL;

COMMENT ON COLUMN public.orders.company_invoice_requested IS
  'Whether the customer requested a company invoice during checkout.';
COMMENT ON COLUMN public.orders.invoice_provider IS
  'Invoice provider used for company invoices: stripe or fakturownia.';
COMMENT ON COLUMN public.orders.invoice_id IS
  'External invoice identifier from the selected invoice provider.';
COMMENT ON COLUMN public.orders.invoice_number IS
  'External invoice number from the selected invoice provider.';
COMMENT ON COLUMN public.orders.invoice_url IS
  'Public or provider-hosted invoice URL, when available.';
COMMENT ON COLUMN public.orders.invoice_status IS
  'Company invoice automation status: pending, issued, or failed.';
COMMENT ON COLUMN public.orders.invoice_error IS
  'Last sanitized company invoice automation error.';
COMMENT ON COLUMN public.orders.invoice_issued_at IS
  'Timestamp when the external company invoice was issued.';
