# Contrato de Frontend - Catálogo e Insights

Este documento especifica cómo el Frontend (Next.js) debe interactuar con el nuevo módulo de Catálogo implementado en el Backend (Spring Boot).

## Endpoints Disponibles

Para mejorar la experiencia de usuario (UX) y permitir la carga progresiva, los datos tabulares y los Insights generados por Inteligencia Artificial han sido separados en dos endpoints distintos.

Ambos endpoints reciben exactamente los mismos `Query Params` para mantener el contexto.

### Query Params Comunes (`FilterParams`)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `days` | `Integer` | Sí | Días hacia atrás para el análisis (ej. `30`). |
| `brand` | `String` | Sí | Nombre de la marca o `"all"`. |
| `category` | `String` | No | Filtro por categoría o `"all"`. |
| `department`| `String` | No | Filtro por departamento o `"all"`. |

---

### 1. Obtener Productos del Catálogo

**Endpoint:** `GET /api/catalog/products`

Este endpoint devuelve el rendimiento de los productos, incluyendo el cálculo de `returnRate` y `marketShare` (calculado sobre el total de ingresos de su categoría respectiva).

**Respuesta (JSON Array):**
```json
[
  {
    "productId": "SKU-12345",
    "productName": "Camiseta Básica Blanca",
    "category": "T-Shirts",
    "department": "Men",
    "retailPrice": 19.99,
    "unitsSold": 1500,
    "revenueNet": 29985.00,
    "returnRate": 0.05,
    "marketShare": 0.12
  }
]
```

### 2. Obtener Insights de Inteligencia Artificial

**Endpoint:** `GET /api/catalog/insights`

Este endpoint se conecta con un LLM (Mistral-7B) para agrupar y sugerir acciones estratégicas. Dado que el LLM puede tardar unos segundos en procesar, se recomienda llamar a este endpoint en paralelo y mostrar un esqueleto (`skeleton loader`) en la sección de "Action Cards".

**Respuesta (JSON Array):**
```json
[
  {
    "id": "1",
    "scope": "product",
    "affectedItems": [
      {
        "id": "SKU-12345",
        "name": "Camiseta Básica Blanca",
        "url": null
      },
      {
        "id": "SKU-67890",
        "name": "Camiseta Cuello V Blanca",
        "url": null
      }
    ],
    "type": "cannibalization",
    "title": "Posible Canibalización en T-Shirts",
    "description": "Ambos productos compiten directamente en el mismo rango de precios. Considera diferenciar el marketing o ajustar el precio de uno de ellos.",
    "impactScore": 8
  }
]
```

**Tipos de Insight Soportados (`type`):**
- `cannibalization` (Naranja)
- `market_share` (Azul)
- `dead_stock` (Rojo)
- `cross_sell` (Verde)
- `warning` (Rojo)
- `opportunity` (Verde)
- `price` (Azul)

---

## Recomendación de Flujo para el Frontend (Agente)

1. Cuando el usuario entra a la vista de Catálogo, el componente principal debe despachar dos llamadas de red concurrentes:
   - `fetch(/api/catalog/products?...)`
   - `fetch(/api/catalog/insights?...)`
2. Muestra los productos en la tabla tan pronto regresen (generalmente < 1 segundo).
3. Mantén un `Skeleton Loader` o indicador de `"Generando Insights con IA..."` en la sección superior mientras llega la segunda respuesta (puede tardar entre 2 y 5 segundos).
4. El backend ya se encarga de truncar los productos enviados al LLM para no sobrepasar la ventana de contexto. Simplemente pásale los mismos filtros y él sabrá qué hacer.
