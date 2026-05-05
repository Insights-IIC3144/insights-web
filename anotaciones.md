El proyecto "Insights" es una plataforma analítica web desarrollada para AndesML, diseñada para proporcionar a las marcas (sellers) que venden a través de canales digitales visibilidad detallada sobre sus ventas, el comportamiento de sus clientes y su desempeño competitivo.

La plataforma es "Multi-tenant" (multicliente). Esto significa que la misma base de datos de BigQuery contiene información de muchos competidores (por ejemplo, Calvin Klein, Nike, Adidas). Sin un filtrado estricto, una marca podría ver accidentalmente el desempeño interno de su competencia.

Retailer (El Dueño del Canal): Es la plataforma donde se venden los productos
Marca/Brand (El Seller): Es el cliente final de Insights. Ellos quieren ver cómo les va en ese Retailer específico.

Cuando el usuario se loguea, su identidad (email) está amarrada en PostgreSQL a un RetailerID y una Brand específica. Tu clase CustomJwtAuthenticationConverter recupera esto y crea una Authority (un permiso) llamada BrandAuthority. Si un usuario intenta "hackear" la URL de la API para pedir datos de otra marca, el brandAccessService lo detectará o simplemente la consulta SQL forzará el filtro de la marca que el usuario tiene permitida en su perfil de base de datos, devolviendo cero resultados para marcas ajenas.

El sistema se basa en una arquitectura moderna y escalable:
Frontend: Desarrollado con Next.js y React, desplegado en Vercel.
Backend: API construida con Java , alojada en Render.
Datos y Procesamiento: Utiliza Google BigQuery para el análisis de grandes volúmenes de datos y PostgreSQL para la gestión de usuarios.

Me ayudas a agregar el topbar funcional (conexion backend/frontend), ya tengo hecho un mockup en codigo.
Para empezar quiero solo tener el Retailer (fijo) y Marca filtrado dependiendo del dropdown.
Dime que archivos son relevantes para modificar/editar/buscar para la implementación del front.

Hay unas peticiones listas:

 GET /login
 GET /dashboard
 GET /api/auth/me
 GET /api/proxy/filters -> filtros del dashboard (categories, countries, etc.)

 GET /api/proxy/executive/category-sales?days=90
 GET /api/proxy/executive/kpis?days=90
 brand=Calvin+Klein&days=7
 response:
 [
    {
        "date": "2026-05-05",
        "brand": "AG Adriano Goldschmied",
        "revenue": 225.0,
        "totalOrders": 1,
        "unitsSold": 1,
        "uniqueCustomers": 1
    },..

    }
]

elementos del TOPBAR:
1. FALTA: Retailer
2. FALTA: Marca actual (brand): DropdownMenu
4. FALTA: Buscador
5. LISTO "Últimos X dias": filtro de tiempo
6. FALTA: Exportar: genera archivo (CSV/Excel) basado en los filtros actuales (Marca + Fecha) y lo descarga
7. LISTO: Perfil: listo (auth0)

Endpoints a crear en el backend
- GET/api/auth/me: Perfil completo del usuario logueado (email, retailer, brand)

/me 
Preview: 
email, 
email_verified
family_name
...
sid
sub
updated_at

Request Headers: Cookie

Response:
{
    "given_name": ...,
    "family_name": ...,
    "nickname": ...,
    "name": ...,
    "picture": ...,
    "updated_at": ...,
    "email": ...,
    "email_verified": ...,
    "sub": ...,
    "sid": ...,
}

Estructura proyecto backend:
├── target/
├── .devcontainer/
├── .github/
├── Dockerfile
├── SPRING_BOOT_MIGRATION.md
├── views/
│   └── v_competitive_position.sql
├── docker-compose.yml
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── .gitattributes
├── mvnw.cmd
├── README.md
├── .git/
├── .gitignore
├── pom.xml
├── checkstyle.xml
├── .env
├── andesml-insights-494420-79cae97a1f56.json
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
│       └── java/
└── mvnw

Estructura proyecto frontend:
├── .env
├── .git/
├── .github/
├── .gitignore
├── .next/
├── .npmrc
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── anotaciones.md
├── app/
│   ├── (dashboard)/
│   │   ├── competitive-positioning/
│   │   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── sales/
│   ├── api/
│   │   ├── auth/
│   │   └── proxy/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── login/
│       └── page.tsx
├── components/
│   ├── .gitkeep
│   ├── auth/
│   │   ├── AuthShell.tsx
│   │   └── GoogleButton.tsx
│   ├── dashboard/
│   │   ├── ExecutiveCharts.tsx
│   │   └── ExecutiveKpiGrid.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── NavLink.tsx
│   ├── theme-provider.tsx
│   ├── ui/
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   └── ui-extra/
│       ├── ChartCard.tsx
│       ├── Filters.tsx
│       ├── KpiCard.tsx
│       ├── PageHeader.tsx
│       ├── Panel.tsx
│       └── SectionHeader.tsx
├── components.json
├── context/
│   └── DashboardContext.tsx
├── eslint.config.mjs
├── hooks/
│   ├── .gitkeep
│   ├── useCompetitiveData.ts
│   └── useExecutiveData.ts
├── lib/
│   ├── .gitkeep
│   ├── api.ts
│   ├── format.ts
│   ├── mock.ts
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
│   └── .gitkeep
├── README.md
├── services/
│   ├── competitiveService.ts
│   ├── executiveService.ts
│   └── filterService.ts
├── tsconfig.json
├── tsconfig.tsbuildinfo
└── types/
    ├── competitive.ts
    ├── executive.ts
    └── shared.ts
