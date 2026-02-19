
# 🚀 CryptoFlow JP - Despliegue Rápido

Este proyecto está optimizado para funcionar sin complicados pasos de compilación (Build).

## Pasos para subirlo a Vercel (Recomendado):

1.  **Sube el código a GitHub:**
    *   Crea un nuevo repositorio en GitHub (ej: `mi-pagina-crypto`).
    *   Sube todos estos archivos a la raíz del repositorio.

2.  **Conecta con Vercel:**
    *   Entra en [vercel.com](https://vercel.com) y regístrate con tu GitHub.
    *   Haz clic en **"Add New" -> "Project"**.
    *   Selecciona tu repositorio de GitHub.

3.  **Configura la API KEY (MUY IMPORTANTE):**
    *   Antes de darle a "Deploy", busca la sección **Environment Variables**.
    *   Añade una variable llamada: `API_KEY`.
    *   Pega tu clave de Gemini API como valor.

4.  **¡Lanza!:**
    *   Dale a **Deploy**. En menos de 1 minuto tu página estará online con una URL profesional.

## Configuración de AdSense:
Para que los anuncios aparezcan, edita `App.tsx` y busca los comentarios `{/* AdSense ... */}`. Sustituye los bloques de ejemplo por tu código de anuncio real (`ca-pub-XXXXX`).
