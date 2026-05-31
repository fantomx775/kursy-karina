# Faktury firmowe przez Fakturownię

Zakup na firmę nadal używa Stripe Checkout do płatności i zebrania danych firmy
(nazwa, adres, NIP). Provider faktury wybierasz envem:

```env
COMPANY_INVOICE_PROVIDER=stripe
```

Dostępne wartości:

- `stripe` - obecne zachowanie, Stripe tworzy fakturę po płatności.
- `fakturownia` - Stripe zbiera dane, a aplikacja wystawia i wysyła fakturę przez Fakturownię po potwierdzeniu płatności.

## Envy dla Fakturowni

```env
COMPANY_INVOICE_PROVIDER=fakturownia
FAKTUROWNIA_ACCOUNT_DOMAIN=twoja-firma
FAKTUROWNIA_API_TOKEN=uzupelnij-token
FAKTUROWNIA_DEPARTMENT_ID=
FAKTUROWNIA_INVOICE_KIND=vat
FAKTUROWNIA_DEFAULT_TAX_RATE=zw
FAKTUROWNIA_PAYMENT_TYPE=card
FAKTUROWNIA_PAYMENT_TO_DAYS=0
FAKTUROWNIA_SEND_INVOICE_EMAIL=true
```

`FAKTUROWNIA_ACCOUNT_DOMAIN` może być samym prefiksem konta
(`twoja-firma`) albo pełnym adresem (`https://twoja-firma.fakturownia.pl`).

## Baza danych

Przed włączeniem providera `fakturownia` uruchom migrację:

```sql
database/migrations/021_add_company_invoice_tracking.sql
```

Nowe kolumny w `orders` przechowują tylko status automatyzacji i identyfikatory
zewnętrznej faktury. Token API Fakturowni nie jest zapisywany w bazie.
