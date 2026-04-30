Sube aquí los archivos MD de la base de conocimiento de VAAS.

Archivos esperados (los nombres deben coincidir exactamente):

  - md1_diccionario_variables.md
  - md2_esquema_tablas.md
  - md3_logica_negocio_queries.md
  - md4_borrowers.md

El servidor lee toda *.md de esta carpeta al arrancar y cachea el contenido
durante 60 segundos. Si agregas o modificas un MD, espera hasta 60s o reinicia
uvicorn para forzar la recarga.
