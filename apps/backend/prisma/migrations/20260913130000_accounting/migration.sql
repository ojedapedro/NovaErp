-- Migration: Accounting modules (fiscal_param + contabilidad)

-- -------------------------------------------------------------
-- FISCAL PARAMETERS
-- -------------------------------------------------------------
CREATE TABLE "tax_unit_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "value" DECIMAL(18,4) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "resolution" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tax_unit_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tax_type" VARCHAR(50) NOT NULL,
    "rate" DECIMAL(10,4) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tax_rates_type_valid_idx" ON "tax_rates"("tax_type", "valid_from", "valid_to");

CREATE TABLE "exchange_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "currency_code" VARCHAR(3) NOT NULL,
    "rate" DECIMAL(18,4) NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "exchange_rates_currency_date_key" UNIQUE ("currency_code", "date")
);

-- -------------------------------------------------------------
-- CHART OF ACCOUNTS (Plan de Cuentas VEN-NIF)
-- -------------------------------------------------------------
CREATE TABLE "chart_of_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    "parent_id" UUID,
    "is_control" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chart_of_accounts_company_code_key" UNIQUE ("company_id", "code"),
    CONSTRAINT "chart_of_accounts_company_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
    CONSTRAINT "chart_of_accounts_parent_fkey" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts"("id")
);

-- -------------------------------------------------------------
-- FISCAL PERIODS
-- -------------------------------------------------------------
CREATE TABLE "fiscal_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fiscal_periods_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fiscal_periods_company_name_key" UNIQUE ("company_id", "name"),
    CONSTRAINT "fiscal_periods_company_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- JOURNAL ENTRIES (Partitioned by month via pg_partman)
-- -------------------------------------------------------------
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entry_date" DATE NOT NULL,
    "company_id" UUID NOT NULL,
    "number" BIGINT NOT NULL,
    "concept" TEXT NOT NULL,
    "is_posted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pk_journal_entries" PRIMARY KEY ("id", "entry_date"),
    CONSTRAINT "journal_entries_company_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
) PARTITION BY RANGE ("entry_date");

CREATE INDEX "journal_entries_company_date_idx" ON "journal_entries"("company_id", "entry_date");

-- Create initial partitions manually
CREATE TABLE "journal_entries_y2026m09" PARTITION OF "journal_entries" FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE "journal_entries_y2026m10" PARTITION OF "journal_entries" FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

-- -------------------------------------------------------------
-- JOURNAL ENTRY LINES
-- -------------------------------------------------------------
CREATE TABLE "journal_entry_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "journal_entry_id" UUID NOT NULL,
    "entry_date" DATE NOT NULL,
    "account_id" UUID NOT NULL,
    "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "description" VARCHAR(255),
    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "journal_entry_lines_account_fkey" FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id")
);

CREATE INDEX "journal_entry_lines_entry_idx" ON "journal_entry_lines"("journal_entry_id", "entry_date");
