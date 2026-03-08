# Gift & Advertisement ERP — Requirements (from specification)

This document maps the **Standard +** and **Professional +** feature list to modules and user limits for the Gift & Advertisement company ERP.

---

## Standard + (Baseline)

| Feature | Module / Screen | Notes |
|--------|------------------|--------|
| Manage vendor bills and payments | **Finance** → Vendor Bills & Payments | Supplier invoicing and payment tracking |
| Track sales and purchase orders | **Sales** → Orders; **Purchasing** → Orders | Incoming and outgoing orders |
| Record multi-currency transactions | **Finance** → Multi-Currency / Settings | Support for international clients and vendors |
| Bill timesheets | **Projects** → Timesheets | Time tracking and billing |
| Project profitability | **Projects** → Profitability | Per-project financial performance |
| Manage retainers | **Finance** → Retainers | Advance payments and recurring fees |
| Track inventory | **Inventory** | Stock for gifts and promotional items |
| Create price lists | **Sales** → Price Lists | Product and service pricing |
| Setup sales and purchase approvals | **Approvals** | Approval workflows for transactions |
| Customize business workflows | **Settings** → Workflows | Process customization |
| Collaborate (chat, voice, video, screen sharing) | **Collaboration** | Internal communication |
| Create custom user roles | **Settings** → Roles | Permissions and access control |
| **User limit** | **5 users** | Standard + tier |
| **Support** | Email, Voice, Chat | |

---

## Professional + (Standard + plus)

| Feature | Module / Screen | Notes |
|--------|------------------|--------|
| Fixed asset management | **Assets** | Long-term assets (equipment, etc.) |
| Manage budgets | **Finance** → Budgets | Planning and control of spend |
| Cashflow forecasting | **Finance** → Cashflow | Future cash in/out |
| Enable self-service portals for vendors | **Vendor Portal** | Vendors access info and tasks (broker-style portal) |
| Setup custom domain | **Settings** → Domain | Branded URL |
| Create business-specific custom modules | **Settings** → Custom Modules | Tailored modules |
| Add custom button | **Settings** → Customization | Custom actions in UI |
| Create custom field validation rules | **Settings** → Validation | Data integrity rules |
| Embed contextual web pages/apps | **Settings** → Embed | External apps in ERP |
| Manage custom functions | **Settings** → Custom Functions | Custom logic and automation |
| **User limit** | **10 users** | Professional + tier |
| **Support** | Email, Voice, Chat | Same as Standard + |

---

## Implementation map (app structure)

- **Dashboard** — Overview KPIs, recent activity, links to main modules  
- **Sales** — Orders, Price Lists  
- **Purchasing** — Purchase Orders  
- **Inventory** — Stock tracking  
- **Finance** — Vendor Bills & Payments, Retainers, Multi-Currency; (Prof) Budgets, Cashflow  
- **Projects** — Timesheets, Profitability  
- **Approvals** — Sales and purchase approval workflows  
- **Vendor Portal** — (Prof) Self-service for vendors  
- **Assets** — (Prof) Fixed asset management  
- **Settings** — Workflows, Roles, (Prof) Domain, Custom Modules, Buttons, Validation, Embed, Custom Functions  
- **Collaboration** — Chat / voice / video (UI entry point; integration TBD)

User limits (5 vs 10) and feature flags for Professional + can be driven by plan/subscription in backend and config.
