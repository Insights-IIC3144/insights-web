# Tarea para el Backend: Endpoint de Insights Competitivos

El Frontend ahora necesita un endpoint de IA similar al de catálogo, pero enfocado en analizar los datos de **Posicionamiento Competitivo**.

## 1. El Endpoint

Deben implementar y exponer el siguiente endpoint GET (que el frontend está llamando actualmente a través del proxy interno):

```http
GET /competitive/insights?brand={brand}&days={days}...
```

## 2. Lógica y Prompt de IA

Este endpoint debe recibir los parámetros de filtro (igual que `getAll`), recuperar los datos de las categorías (los KPIs base) y enviárselos al modelo LLM de HuggingFace que ya están usando.

El LLM **debe** devolver una respuesta JSON estructurada con el siguiente esquema estricto (no encapsulado en markdown ````json`):

```json
[
  {
    "category": "string",
    "opportunityTitle": "string",
    "opportunityDescription": "string"
  }
]
```

### Instrucciones clave para el Prompt del LLM:
1. El texto en `opportunityTitle` debe ser un titular extremadamente corto y directo (max 4-5 palabras), por ejemplo: "Oportunidad de margen", "Baja competitividad en precio", "Fortaleza consolidada". Esto se mostrará en la tabla de detalles.
2. El texto en `opportunityDescription` debe ser un párrafo breve (máximo 2 oraciones) explicando la oportunidad o debilidad en base a los datos de Share de Ventas, Precios de la Marca vs Benchmark.
3. La IA debe devolver un array con un objeto por **CADA** categoría que reciba en los datos de entrada (si el backend le envía el top 5 de categorías, el array debe contener 5 insights, asegurándose de hacer match exacto del nombre en el campo `category`).
4. Todo debe estar estrictamente escrito en español.

## 3. Ejemplo de Salida (Respuesta HTTP)

```json
[
  {
    "category": "Tops & Tees",
    "opportunityTitle": "Precio elevado, pérdida share",
    "opportunityDescription": "El precio de la marca es 15% superior al benchmark, lo que explica la baja participación del 4.2% en volumen. Reducir el precio aumentaría considerablemente las ventas."
  },
  {
    "category": "Activewear",
    "opportunityTitle": "Posición dominante",
    "opportunityDescription": "La marca tiene un sólido share del 45% y precios competitivos. Mantener la estrategia actual y asegurar el nivel de stock."
  }
]
```
