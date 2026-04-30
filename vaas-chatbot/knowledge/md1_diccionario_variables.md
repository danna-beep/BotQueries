# MD1 — Diccionario de Variables VAAS
> Fuente de verdad para el chatbot de queries. Cada bloque describe una variable: su definición, tipo de dato, valores permitidos y equivalencias por originador.

---

## LOAN TAPE MAPPER

> Variables del Loan Tape: información por contrato de crédito individual.

### Contract ID
- **Definición**: Código único (alfanumérico) de identificación de cada contrato individual
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Adelantos: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### Contract Number
- **Definición**: Código único (numérico) de identificación de cada contrato individual
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Adelantos: ✓

### Individual Contracts Outstanding Principal Balance
- **Definición**: Principal insoluto del crédito puntual
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Adelantos: ✓, Xepelin CIM: ✓

### Individual Contracts Adjusted Principal Balance
- **Definición**: Individual Contracts Outstanding Principal Balance ajustado por una condición adicional (ej: FICO Score)
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Aplazo: ✓

### Funder
- **Definición**: Entidad / Sociedad que fondea el dinero prestado para cada contrato individual
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""
- **Equivalencias por originador**: Adelantos: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### Product
- **Definición**: Originalmente llamado asset type - es el producto que se está prestando a los usuarios finales del borrower
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Addi Arch: ✓, Adelantos: ✓

### Product Type
- **Definición**: Subdivisiones dentro del Product
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### Account Debtor Type
- **Definición**: Característica específica del usuario/cliente/empresa deudora.  Puede variar de contrato a contrato
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Aplazo: ✓

### Eligible Type
- **Definición**: Client_type addi
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Configuración blanks**: ""
- **Equivalencias por originador**: Addi Arch: ✓

### Classification
- **Definición**: Clasificación del cliente/account debtor por tamaño
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Segment
- **Definición**: Clasificación del cliente/account debtor por tamaño
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Account Debtor Tax ID
- **Definición**: Código de identificación tributaria del account debtor (persona / empresa) que realiza una actividad económica y contribuye impuestos
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Account Debtor ID
- **Definición**: Código de identificación de identidad del account debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Account Debtor internal ID
- **Definición**: Código de identificación interno del account debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""
- **Equivalencias por originador**: Aplazo: ✓

### Account Debtor Name
- **Definición**: Código de identificación del usuario deudor del contrato
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin GS: ✓

### Payer Tax ID
- **Definición**: Código de identificación tributaria del usuario pagador de la deuda del contrato.  Es quien paga la factura en nombre del deudor.  Caso de uso particular de ciertas industrias con factoraje
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Payer ID
- **Definición**: Código de identificación de identidad del usuario pagador de la deuda del contrato.  Es quien paga la factura en nombre del deudor.  Caso de uso particular de ciertas industrias con factoraje
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Initial Amount
- **Definición**: Monto del préstamo completo
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### Loan Amount
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > 0
- **Configuración blanks**: 0

### First Loan Amount
- **Definición**: Monto del primer crédito que haya tomado el deudor en su historia con la fintech... si sos un first time client, el monto va a coincidir con el del crédito que estés mirando, si es un existing customer, van a diferir
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Aplazo: ✓

### Loan Term
- **Definición**: Tiempo asociado al repago del préstamos completo en días
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
Semanas
Meses
Años
- **Valores permitidos**: > 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### Current Loan Term
- **Definición**: Tiempo actualmente asociado al repago del préstamos completo en días
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
Semanas
Meses
Años
- **Valores permitidos**: > 0
- **Configuración blanks**: o

### Loan Payment Frequency
- **Definición**: Periodicidad con la que se tiene que pagar la deuda
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string

### Months On Balance
- **Definición**: Cantidad de meses que está el crédito en cartera
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
Semanas
Meses
Años
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: 0
- **Equivalente backend**: `10`
- **Equivalencias por originador**: Addi GS: ✓

### Interest Rate (%)
- **Definición**: Tasa de interés a pagarse por el préstamo
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales -  0,01
Número Entero - ej agregar % al lado
String - tiene el 10%
- **Valores permitidos**: > 0
- **Configuración blanks**: 0
- **Equivalente backend**: `0.01`
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Origination APR
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Modified Interest Rate (%)
- **Definición**: Tase de interés a pagarse por el préstamo modificada vs la tasa original
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalente backend**: `0.01`
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓

### Interest Multiple
- **Definición**: Percentage of disbursed principal that has to be paid back as interest
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalente backend**: `Definir Bien`

### Interest Rate
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Aplazo: ✓

### All In Rate
- **Definición**: Retorno del crédito otorgado teniendo en cuenta todos los aspectos posibles (interés per se, comisiones, MDR, etc.)
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Xepelin GS: ✓

### Current Usury Rate
- **Definición**: Tasa máxima de los intereses mensuales que puede cobrar un organismo a los agentes de la economía.  Depende del tipo de crédito, por lo que puede variar por contrato dentro de un mismo loan tape
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓

### Disbursement Date
- **Definición**: Fecha en la que se produce el desembolso del préstamo.  MM/DD/YYYY
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Days since disbursement
- **Definición**: Cuántos días pasaron desde que se entrego el crédito
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
Semanas
Meses
Años
- **Valores permitidos**: >=0
- **Configuración blanks**: 0

### Due Date
- **Definición**: Fecha en la que debe pagarse la totalidad del préstamo. MM/DD/YYYY
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Actual Payment Date
- **Definición**: Fecha en la que efectivamente se repaga la deuda. MM/DD/YYYY
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Assigned Date
- **Definición**: Fecha de cesión al fideicomiso
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Renegotiated Date
- **Definición**: Fecha en la que el crédito fue renegociado
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos

### Industry
- **Definición**: Industria a la que pertenece el Merchant
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Aplazo: ✓

### Merchant Name
- **Definición**: Nombre del Merchant
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Aplazo: ✓

### Credit Bureau Score
- **Definición**: Score crediticio del deudor reportado por un bureau de credito
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Internal Risk Score
- **Definición**: Score crediticio del deudor score que se genera por un modelo de riesgo interno de la empresa
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Aplazo: ✓

### Internal Risk Score (string)
- **Definición**: Score crediticio (de texto) del deudor score que se genera por un modelo de riesgo interno de la empresa
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Probability of Default
- **Definición**: ???? Probability of Default en addi
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓

### Merchant Discount Rate (MDR %)
- **Definición**: % de comisión para el borrower por facilitar la venta al merchant en punto de venta
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Aplazo: `x}`

### Affiliate Fee Rate
- **Definición**: % de comisión para el borrower por facilitar la venta al merchant online
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Guarantee Fee Rate (%)
- **Definición**: Fee pagado por el borrower en concepto de garantía en caso de default
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Days Past Due Buckets
- **Definición**: Dato de morosidad - indica en qué bucket de días de retraso en el pago de la/las cuotas adeudadas del préstamo
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
EJ: 
Buckets:
- 0-30, 30-60, +60
- 0<x<30, 30<x<60, x>60
- **Configuración blanks**: ""
- **Equivalencias por originador**: Adelantos: ✓

### Days Past Due
- **Definición**: Dato de morosidad - indica la cantidad exacta de días de retraso en el pago de la/las cuotas adeudadas del préstamo
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### Number of Delinquent Installments
- **Definición**: Cantidad de cuotas morosas que tiene el crédito
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Na
- **Valores permitidos**: > o = 0

### Client Max Days Past Due
- **Definición**: Máxima morosidad (en días) que tenga o haya tenido el cliente/deudor en su historia con la fintech, más allá del loan en sí que estemos mirando
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### Loan max Days Past Due
- **Definición**: Máxima morosidad (en días) que tenga o haya tenido un crédito particular
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓

### Loan Historical Max Days Past Due
- **Definición**: Morosidad asociada al pago total del crédito - última morosidad que haya tenido el día que se repagó
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0
- **Equivalencias por originador**: Xepelin CIM: ✓

### Foreberance
- **Definición**: El pago del deudor se encuentra temporalmente frenado o disminuído
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓

### Country
- **Definición**: País de Origen del Account Debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓

### Currency
- **Definición**: Indica la moneda de cada préstamo individual
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Loan Status
- **Definición**: Estatus del préstamo individual.  Puede variar de contrato a contrato.
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓

### Industry Universal ID
- **Definición**: Código que identifica la industria a la que pertenece el deudor (SCIAN en Mex, CIIU en Col, etc)
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Debtor Advance Rate
- **Definición**: Advance rate de la fintech para con su deudor/cliente
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Puntos Porcentuales - ej 10% o 0,01
Número Entero - ej agregar % al lado
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Xepelin CIM: ✓

### Prospect average age
- **Definición**: Es el promedio del rango de edad en el que se encuentra el deudor, no necesariamente coincide con su edad real
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Account Debtor Revenue under 100K
- **Definición**: Característica del Revenue del account debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Number of debtor active loans
- **Definición**: Cantidad de créditos activos de un mismo deudor
- **Fuente**: Loan Tape
- **Tipo de dato**: Bigdecimal
- **Valores permitidos**: > o = 0
- **Configuración blanks**: ""

### Age
- **Definición**: Edad real del deudor
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Aplazo: ✓

### Fully Paid Loan
- **Definición**: Préstamo fue repagado en su totalidad
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓

### Cancelled Loan
- **Definición**: Préstamo fue cancelado
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓

### Verified by Verification Agent
- **Definición**: Filtrado por un agente de verificación - funciona como un eligibility critera
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi GS: ✓

### Government
- **Definición**: Deudor es o no un ente gubernamental
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Not For Profit
- **Definición**: Deudor es o no una empresa sin fines de lucro
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Escrow Account
- **Definición**: Deudor dejó o no Garantía
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Xepelin CIM: ✓, Xepelin GS: ✓

### Geographic State
- **Definición**: Estado al que pertenece el deudor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Period of Operation
- **Definición**: Cantidad de tiempo de operación del cliente/deudor (para fintechs cuyos clientes sean empresas)
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: Días
Semanas
Meses
Años
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Inqueries
- **Definición**: cantidad de llamadas para verificar el score crediticio del deudor
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0
- **Equivalencias por originador**: Aplazo: ✓

### Client Payment (Unpaid)
- **Definición**: Client has not paid
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Returning Client
- **Definición**: New or existing customer
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 o 0
True o False
First time client, 2nd time client, 3rd time client
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Learning Population
- **Definición**: Small group of loans destined to test the market risk
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Loan Modification
- **Definición**: Loan has been renegotiated
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Terminated Ally
- **Definición**: Relationship with ally has been terminated
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0
- **Equivalencias por originador**: Addi Arch: ✓

### Billing Cycle
- **Definición**: Periodicity of client payment
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Cash Balance
- **Definición**: Saldos de la cuenta del usuario
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Cash Balance Date
- **Definición**: Fecha en la que se obtuvo el cash balance
- **Fuente**: Loan Tape
- **Tipo de dato**: LocalDate
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos

### Current Credit Limit
- **Definición**: Limite total de la tarjeta
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Card transactions
- **Definición**: Acumulado de transacciones de todas las tarjetas/productos que tiene el cliente
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Payments
- **Definición**: Cantidad de pagos realizados por el cliente
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Refunds
- **Definición**: Cantidad de refunds solicitados
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Adjustments
- **Definición**: TBD
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Cashbacks
- **Definición**: TBD
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Carried over balance
- **Definición**: Saldo positivo o negativo que se pasa de un período al otro
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Outstanding amount
- **Definición**: Cantidad utilizada del límite total de la tarjeta
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Loan Tape reporting date
- **Definición**: Fecha en la que se ejecutó el loan tape cargado
- **Fuente**: Loan Tape
- **Tipo de dato**: LocalDate
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos

### Affiliate
- **Definición**: El cliente es affiliado al borrower
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Restructured
- **Definición**: Ya modificaste el contrato
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Other tenor
- **Definición**: TBD
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Risk eligible
- **Definición**: El riesgo del cliente es elegible para el borrower?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### SAT
- **Definición**: Tiene SAT?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Bureau
- **Definición**: Tiene Bureau Score?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### CBU
- **Definición**: Reporta estados de cuenta CBU?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Invoice Issuer Name
- **Definición**: Nombre del emisor de la factura
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""
- **Equivalencias por originador**: Xepelin GS: ✓

### Invoice Issuer ID
- **Definición**: Código de identificación de identidad del usuario pagador de la deuda del contrato.
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Invoice Issuer tax ID
- **Definición**: Código de identificación de identidad del usuario pagador de la deuda del contrato.
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Payer Name
- **Definición**: Nombre del pagador de la deuda del contrato/factura
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Issue Date
- **Definición**: Fecha en que se emitió la factura
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
+ todas las que permitimos
- **Valores permitidos**: Fecha
- **Configuración blanks**: 0

### Negotiation Date
- **Definición**: Fecha en la que se negoció la factura/contrato
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Unidad / Interpretación**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
+ todas las que permitimos
- **Valores permitidos**: Fecha
- **Configuración blanks**: 0

### Debt
- **Definición**: Deuda de los estados financieros del cliente asociado al loan id con un determinado corte
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0

### Equity
- **Definición**: Patrimonio neto de los estados financieros del cliente asociado al loan id con un determinado corte
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0

### annual_imports
- **Definición**: Valor anual de las importaciones del cliente asociado al loan id
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0

### annual_sales
- **Definición**: Valor anual de las ventas del cliente asociado al loan id
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0

### Insurance Value
- **Definición**: Fee adicional en concepto de seguro a nivel loan id que paga el cliente del borrower
- **Fuente**: Loan Tape
- **Tipo de dato**: Número
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: 0

### advanceRate
- **Definición**: Se usan para eligibility criteria
- **Fuente**: Loan Agreement
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Adelantos: ✓, Xepelin CIM: ✓, Xepelin GS: ✓

### useFactor
- **Definición**: Se usan para concentration limits
- **Fuente**: Calculado
- **Equivalencias por originador**: Addi GS: ✓, Addi Arch: ✓, Adelantos: ✓, Xepelin CIM: ✓

### COPB
- **Definición**: es el outstanding principal
- **Fuente**: Calculado
- **Equivalencias por originador**: Xepelin GS: ✓

### groupID
- **Definición**: Se usan para concentration limits
- **Fuente**: Calculado
- **Equivalencias por originador**: Xepelin GS: ✓

### gruopIDComponents
- **Definición**: Se usan para concentration limits
- **Fuente**: Calculado
- **Equivalencias por originador**: Xepelin GS: ✓

### Warnings
- **Definición**: Son los mensajes de warning de validaciones ?
- **Fuente**: Calculado
- **Equivalencias por originador**: Xepelin GS: ✓

### Lender
- **Definición**: Es la entidad que prestará el dinero al Borrower siguiendo los estatutos demarcados en el Deal.  También llamado Financing Partner o acreedor
- **Fuente**: Loan Agreement

### Borrower
- **Definición**: Es la entidad que recibirá el dinero y que quedará en deuda con el Lender.  También llamado Deal Partner u originador
- **Fuente**: Loan Agreement

### Trust
- **Definición**: También llamado Fideicomiso, o special purpose vehicle (SPV)
En el Deal, habrá constantemente movimientos de dinero de ambas partes, sin embargo, estas dos partes jamás harán movimientos directamente, por razones de proceso y ley crearán una figura llamada Fideicomiso. Esta figura estará administrada por otra entidad, generalmente bancaria, que servirá de mediador entre ambas partes. El Fideicomiso recibe los activos por parte del Borrower y el cash por parte del Lender y le da el dinero al borrower mientras el se encarga de ir recibiendo las obligaciones antes otorgadas por el borrower.
- **Fuente**: Loan Agreement

### Trustee
- **Definición**: También llamado Fiducia o Fiduciaria.
Es la entidad que estará encargada de administrar los recursos del Trust, generalmente es un banco que presta este servicio y durante el transcurso del Deal cobrará por ser el ente administrador. El Trustee existe para una mayor transparencia y legalidad de todo el Deal entre ambas partes.
- **Fuente**: Loan Agreement

### SOFOM
- **Definición**: Es un tipo de sociedad contemplada en la legislación mexicana cuyo objetivo principal es el otorgamiento de crédito. Pueden ser entidades reguladas (ER) o no reguladas (ENR). También existen las Sociedad Financiera de Objeto Limitado (Sofol). Es de alguna manera coloquial la figura de Fideicomiso en Mexico.
- **Fuente**: Loan Agreement

### Master Trust
- **Definición**: Cuenta recaudadora de los pagos de cada cliente individual del borrower
- **Fuente**: Loan Agreement

### Master Trust Trustee
- **Definición**: Responsable por asignar los recaudos de pagos individuales del borrower a los Trusts de cada Debt Facility
- **Fuente**: Loan Agreement

### Funder (1, 2, ..., N)
- **Definición**: Entidad/Sociedad que fondea el dinero en cada Debt Facility
- **Fuente**: Loan Agreement

### Closing Date
- **Definición**: Fecha de firma de contrato e inicio de operación
- **Fuente**: Loan Agreement

### End of Draw date
- **Definición**: Fecha límite para solicitar advances
- **Fuente**: Loan Agreement

### End of Availability Date
- **Definición**: Fecha límite para comenzar amortización
- **Fuente**: Loan Agreement

### Maturity Date
- **Definición**: Fecha fin del contrato
- **Fuente**: Loan Agreement

### Due Date
- **Definición**: Fecha de finalización del tranche
- **Fuente**: Loan Agreement

### Start Date
- **Definición**: Fecha en la que se inició la reconciliación - fecha de upload del loan tape
- **Fuente**: Input: usuario front

### Last Reconciliation Event
- **Definición**: Fecha de la reconciliación anterior
- **Fuente**: Calculado

### Payment Date
- **Definición**: La fecha en la que se realizan los pagos asociados a la operación de un debt facility
- **Fuente**: Input: usuario front

### Disbursement Date
- **Definición**: La fecha en la que se realiza un desembolso / net advance
- **Fuente**: Input: usuario front

### Proposed date for Disbursement
- **Definición**: Fecha propuesta de desembolso por parte del borrower.  Suele estar asociado a reglas específicas (ej: entre N y X días)
- **Fuente**: Input: usuario front

### Total Commitment Amount
- **Definición**: Total del dinero del facility
- **Fuente**: Loan Agreement

### Available Amount
- **Definición**: Total disponible (total del dinero del facility - dinero ya pedido)
- **Fuente**: Loan Agreement

### Current Available Amount
- **Definición**: "Available Amount / Current Available Amount"
- **Fuente**: Loan Agreement

### Number of Tranches (1, 2, ..., N)
- **Fuente**: Loan Agreement

### Days to Complete Disbursement Data
- **Fuente**: Loan Agreement

### Min Net Advance
- **Fuente**: Loan Agreement

### Max Net Advance
- **Fuente**: Loan Agreement

### Net Advance Frequency
- **Fuente**: Loan Agreement

### Min Cash Release
- **Fuente**: Loan Agreement

### Max Cash Release
- **Fuente**: Loan Agreement

### Cash Release Frequency
- **Fuente**: Loan Agreement

### Interest Type
- **Definición**: Estrategia de interés: Si se trata de una tasa de interés flotante o fija
- **Fuente**: Loan Agreement

### Applicable Margin
- **Definición**: Porción de tasa de interés fija
- **Fuente**: Loan Agreement

### Reference Rate
- **Definición**: Nombre de la tasa, fuente de donde obtenerala, fecha de qué día usar
- **Fuente**: Loan Agreement

### Spread
- **Fuente**: Loan Agreement

### Upper Bound
- **Fuente**: Loan Agreement

### Interest Formula
- **Fuente**: Loan Agreement

### Interest Projection necesity
- **Definición**: Cálular hasta fin del período
- **Fuente**: Loan Agreement

### Collections Account Balance
- **Definición**: Es la cuenta donde se acreditan los pagos de los usuarios finales del originador (los clientes de nuestros borrowers) por el master trustee una vez que ellos hayan sido primero depositados en el Master Trust Account, e identificados como pertenecientes al trust particular en cuestión. También es la cuenta donde si hubiera BB deficiency, y el borrower quisiera curarlo con cash, pueda depositarlo. De esta cuenta también salen los pagos que tengan que hacerse por conceptos de fees, expenses, etc.
- **Fuente**: Input: usuario front / Datanomik

### Reserve Account Balance
- **Definición**: Es la cuenta donde, en algunos casos y bajo ciertas circunstancias, se debe dejar una reserva (transfiriendo según corresponda desde el collections account o bien en caso que fuera necesario, del credit account via un net advance si es que no se tiene cash suficiente pero igual el BB es superavitario)
- **Fuente**: Input: usuario front / Datanomik

### Margin Account Balance
- **Definición**: Es la cuenta donde, en algunos casos y bajo ciertas circunstancias, se debe dejar un margen de liquidez y de reserva por la operación de derivados.
- **Fuente**: Input: usuario front / Datanomik

### Credit Account Balance
- **Definición**: Es la cuenta del trust donde el lender deposita los advances requeridos.
- **Fuente**: Input: usuario front / Datanomik

### Disbursement Account Balance
- **Fuente**: Input: usuario front / Datanomik

### Master Trust Account Balance
- **Definición**: Es la cuenta donde los usuarios finales del originador (los clientes de nuestros borrowers) pagan sus cuotas. Aquí se acumulan esos pagos y después de x tiempo (por ejemplo una periodicidad semanal) se distribuyen más específicamente por el master trustee al Collections Account de cada trust particular que cuelga debajo de este Master Trust Account.
- **Fuente**: Input: usuario front / Datanomik

### Trust Expenses Reserve
- **Fuente**: Input: usuario front / Cálculo

### Servicing Costs Reserve
- **Fuente**: Input: usuario front / Cálculo

### Undrawn Fee Reserve
- **Fuente**: Input: usuario front / Cálculo

### Minimum Utilization Fee
- **Fuente**: Input: usuario front / Cálculo

### Interests Reserve
- **Fuente**: Input: usuario front / Cálculo

### Withholding Tax Reserve
- **Fuente**: Input: usuario front / Cálculo

### Figarantías Reserve
- **Fuente**: Input: usuario front / Cálculo

### Other Expense Reserves
- **Fuente**: Input: usuario front

### Raw Collateral Balance
- **Definición**: Raw OPB sum of all loans/receivables included in the loan tape (no adjustments made) (taking the loan tape as a whole at book value)
- **Fuente**: Calculado

### Prefilters (1, 2, ..., N)
- **Definición**: Necessary filters/validations that are not Elegiblity Criteria per se
- **Fuente**: Calculado

### Validations (1, 2, ..., N)
- **Definición**: Necessary filters/validations that are not Elegiblity Criteria per se
- **Fuente**: Calculado

### Total Collateral Balance
- **Definición**: Raw Collateral Balance net of Prefilters (validations)
- **Fuente**: Calculado

### Adjusted Collateral Balance
- **Definición**: Total Collateral Balance adjusted by discounts (e.g. MDF - not risk multipiers nor adv. rates)
- **Fuente**: Calculado

### Ineligible Collateral Balance
- **Definición**: Ineligible loans/receivables within Adjusted Collateral Balance
- **Fuente**: Calculado

### EligibilityCriteria (1,2,...,N)
- **Definición**: Individual EC that will result in filtering of the loan tape
- **Fuente**: Loan Agreement

### Eligible Collateral Balance
- **Definición**: Adjusted Collateral Balance net of Ineligible Collateral Balance
- **Fuente**: Calculado

### Excess Concentration Amount
- **Definición**: Amounts within Eligible Collateral Balance that exceed concentration limits
- **Fuente**: Calculado

### Concentration Limit with Utilization Factor <1 1
- **Fuente**: Calculado

### Concentration Limit with Utilization Factor <1 N
- **Fuente**: Calculado

### Net Collateral Balance
- **Definición**: Eligible Collateral Balance net of Excess Concentration Amount
- **Fuente**: Calculado

### Excess Delinquency Amount
- **Definición**: Amounts within Net Collateral Balance that exceed delinquency thresholds [SUMPRODUCT (Net Collateral Balance; 1- Risk Multipliers)]
- **Fuente**: Calculado

### Delinquency-Adjusted Net Collateral Balance
- **Definición**: Net Collateral Balance net of Excess Delinquency Amount
- **Fuente**: Calculado

### Collateral Borrowing Base Amount
- **Definición**: SUMPRODUCT (Delinquency-Adjusted Net Collateral Balance; Advance Rates)
- **Fuente**: Calculado

### Cash Borrowing Base Amount
- **Definición**: Cash available for BB - Cash that is unequivocally included within the Borrowing Base calculation (i.e. current cash balance net of planned/reserved fees and expeses)
- **Fuente**: Calculado

### Borrowing Base
- **Definición**: Collateral Borrowing Base Amount + Cash Borrowing Base Amount + **if applicable** --> Unrealized FX gains/(losses) + Hedging Costs + Unrealized FX Execution gains/(losses)
- **Fuente**: Calculado

### Unrealized FX gains/(losses)
- **Fuente**: Calculado

### Hedging Costs
- **Fuente**: Calculado

### Unrealized FX execution gains/(losses)
- **Fuente**: Calculado

### Outstanding Principal Balance
- **Definición**: Sum(net advance requested)
- **Fuente**: Calculado

### Cash Hold
- **Definición**: Collateral Borrowing Base Amount - OPB
- **Fuente**: Calculado

### Total Availability
- **Definición**: Borrowing Base - Outstanding Principal Balance >= 0
- **Fuente**: Calculado

### BB deficiency
- **Definición**: Borrowing Base - Outstanding Principal Balance < 0
- **Fuente**: Calculado

### Max Immediate Cash Release Available
- **Definición**: min(total availability, new collateral borrowing base amount, cash borrowing base amount)
- **Fuente**: Calculado

### Max Cash Release Available in N
- **Definición**: min(total availability, cash borrowing base amount) - if(se muestra max immediate cash release, max immediate cash release, 0)
- **Fuente**: Calculado

### Max Net Advance
- **Definición**: total availability - if(se muestra immediate cash release, immediate cash release, 0) - if(se muestra 3 day cash release, 3 day cash release, 0)
- **Fuente**: Calculado

### Immediate Cash Release Requested
- **Fuente**: Input: usuario front

### Cash Release Available in N Requested
- **Fuente**: Input: usuario front

### Net Advance Requested
- **Fuente**: Input: usuario front

### FX Hedge position Maturity Date
- **Fuente**: Input: usuario front

### FX Hedge position spot rate
- **Fuente**: Input: TRM

### FX hedge position disbursement spot rate
- **Fuente**: Input: usuario front

### FX hedge position forward rate
- **Fuente**: Input: usuario front

### Unrealized gains (losses)
- **Fuente**: Calculado

### Hedging Costs
- **Fuente**: Calculado

### Estimated gains (losses)
- **Definición**: Approximate settlement amount if the hedge were matured today
- **Fuente**: Calculado

### Annualized hedging costs
- **Fuente**: Calculado

### #{BORROWING_BASE_DEFICIENCY}
- **Definición**: Valor = 0 en caso de no tener deficiency, o positivo en caso de tener deficiency
- **Fuente**: Calculado

### #{BORROWING_BASE_IN_LOCAL_CURRENCY}
- **Definición**: Resultado del BB en borrower operation currency
- **Fuente**: Calculado

### #{CASH_TRUST}
- **Definición**: es lo que ingresa en borrower en la pantalla de additional info en la primera línea,
no incluye ningun descuento.  Completado por el borrower o, en su defecto, datanomik
- **Fuente**: Calculado

### #{HEDGING_COST}
- **Definición**: Hedging costs asociados a todos los forwards negociados hasta el momento contra la TRM del reconciliation date
- **Fuente**: Calculado

### #{UNREALIZED_GAIN}
- **Definición**: Resultados positivos, sumatoria de todos los unrealized gains
- **Fuente**: Calculado

### #{UNREALIZED_LOSSES}
- **Definición**: Resultados negativos, sumatoria de todos los unrealized losses
- **Fuente**: Calculado

### #{UNREALIZED_GAINS_AND_LOSSES}
- **Definición**: Resultado de NETO: Unrealized gain/loss en base al OPB y hedges
- **Fuente**: Calculado

### #{HEDGING_COST_AND_UNREALIZED_LOSSES}
- **Definición**: Sumatoria de Hedging costs y todos los unrealized losses
- **Fuente**: Calculado

### #{TOTAL_AVAILABLE_FUNDS}
- **Definición**: Igual a cash_trust Validar con finanzas que es el cash trust --> OK
- **Fuente**: Calculado

### #{TOTAL_COPB_WITH_ADVANCE_RATE}
- **Definición**: Según nuestro glosario, es el "Collateral Borrowing Base Amount"
- **Fuente**: Calculado

### #{SERVICING_COST}
- **Fuente**: Calculado

### #{SERVICING_COST_WITHOUT_VAT}
- **Definición**: SERVICING COST / 19%
- **Fuente**: Calculado

### #{TRUST_EXPENSES}
- **Fuente**: Calculado

### #{FIGARANTIAS}
- **Fuente**: Calculado

### #{WITHHOLDING_TAX}
- **Fuente**: Calculado

### #{INTEREST_EXPENSE}
- **Fuente**: Calculado

### #{UNUSED_FEE}
- **Fuente**: Calculado

### #{LAST_MONTH_INTEREST}
- **Fuente**: Calculado

### #{UPFRONT_FEE}
- **Fuente**: Calculado

### #{FORWARD_CONTRACTS_SETTLEMENT_EXPENSE}
- **Fuente**: Calculado

### #{OTHER}
- **Fuente**: Calculado

### #{CASH_RELEASE}
- **Definición**: Monto resultante de cash release posterior al cálculo del BB y solicitud de cash release por parte del borrower.  Borrower Operation Currency
- **Fuente**: Calculado

### #{NET_ADVANCE_AS_TEXT_ENGLISH}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency y escrito en palabras en inglés
- **Fuente**: Calculado

### #{NET_ADVANCE_AS_TEXT_SPANISH}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency y escrito en palabras en español
- **Fuente**: Calculado

### #{NET_ADVANCE_CASH_RELEASE_AMOUNT}
- **Definición**: Monto resultante de cash release + net advance posterior al cálculo del BB y solicitud de cash release y net advance por parte del borrower.  Borrower Operation Currency
- **Fuente**: Calculado

### #{NET_ADVANCE_CASH_RELEASE_DATE}
- **Definición**: es la fecha de reconciliación si solo se hizo cash_release, o la fecha del net_advance (la de generación del documento) si se hizo net advance y cash release
- **Fuente**: Calculado

### #{NET_ADVANCE}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency
- **Fuente**: Calculado

### #{NEW_OPB}
- **Definición**: variables.put(TemplateVariables.NEW_OPB, ""); DEBERÍA SER EL VALOR DEL NUEVO COLATERAL CEDIDO - es x advance rate o no? - Hablé con Fefo y es el RAW Collateral
- **Fuente**: Calculado

### #{OUTSTANDING_UPB_OF_ALL_LOANS_IN_LOCAL_CURRENCY}
- **Definición**: OPB en collateral currency sin contar el net advance en curso
- **Fuente**: Calculado

### #{NET_ADVANCE_DATE_ENGLISH}
- **Definición**: Fecha de generación del documento --> cuando paso a la pantalla de documentos.  no tiene que ver con la de descarga MM/DD/YYYY
- **Fuente**: Calculado

### #{NET_ADVANCE_DATE_SPANISH}
- **Definición**: Fecha de generación del documento --> cuando paso a la pantalla de documentos.  no tiene que ver con la de descarga DD/MM/YYYY
- **Fuente**: Calculado

### #{PROPOSED_DATE_FOR_DISBURSEMENT_ENGLISH}
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha USA
- **Fuente**: Calculado

### #{PROPOSED_DATE_FOR_DISBURSEMENT_SPANISH}
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha LATAM
- **Fuente**: Calculado

### #{RECONCILIATION_DATE_ENGLISH}
- **Definición**: MMMM, d, YYYY - MMMM = month in words - creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement
- **Fuente**: Calculado

### #{RECONCILIATION_DATE_SPANISH}
- **Definición**: d 'de' MMMM YYYY creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement
- **Fuente**: Calculado

### #{RECONCILIATION_DATE}
- **Definición**: MM/DD/YYYY - creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement
- **Fuente**: Calculado

### #{ADVANCE_RATE_CLIENT_FPI( "advance_rate_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_CLIENT_FPL("advance_rate_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_PROSPECT_FPI("advance_rate_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_PROSPECT_NO_PAYMENT("advance_rate_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_CLIENT_FPI("total_eligible_gross_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_CLIENT_FPL("total_eligible_gross_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_PROSPECT_FPI("total_eligible_gross_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_PROSPECT_NO_PAYMENT("total_eligible_gross_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_SUM("total_eligible_gross_prospect_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_CLIENT_FPI("total_eligible_net_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_CLIENT_FPL("total_eligible_net_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_PROSPECT_FPI("total_eligible_net_prospect_fpi"}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_PROSPECT_NO_PAYMENT("total_eligible_net_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_SUM("total_eligible_net_client_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_CLIENT_FPI("total_excluded_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_CLIENT_FPL("total_excluded_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_PROSPECT_FPI("total_excluded_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_PROSPECT_NO_PAYMENT("total_excluded_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_SUM("total_excluded_client_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_CLIENT_FPI("total_unpaid_principal_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_CLIENT_FPL("total_unpaid_principal_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_PROSPECT_FPI("total_unpaid_principal_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_PROSPECT_NO_PAYMENT("total_unpaid_principal_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_SUM("total_unpaid_principal_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TRANCHE_1_NET_COLLATERAL_BALANCE_LC}
- **Definición**: Suma de los montos de capital (Principal) pendientes de pago en los loans financiados con el 1er tramo del Facility
- **Fuente**: Calculado

### #{TRANCHE_2_NET_COLLATERAL_BALANCE_LC}
- **Definición**: Suma de los montos de capital (Principal) pendientes de pago en los loans financiados con el 2do tramo del Facility
- **Fuente**: Calculado

### #{FX_RATE_RECONCILIATION_DATE}
- **Definición**: Tasa de cambio oficial a la fecha del BB Reconciliation
- **Fuente**: Calculado

### #{OUTSTANDING_UPB_OF_ALL_LOANS_IN_USD}
- **Definición**: Suma de los Net Advances realizados hasta la fecha (en USD)
- **Fuente**: Calculado

### #{NET_ADVANCE_USD}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower en USD
- **Fuente**: Calculado

### #{NET_ADVANCE_USD_AS_TEXT_ENGLISH}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower en USD y escrito en palabras en inglés
- **Fuente**: Calculado

### #{OPB_AND_NET_ADVANCE_USD}
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD)
- **Fuente**: Calculado

### #{OPB_AND_NET_ADVANCE_USD_AS_TEXT_ENGLISH}
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD) y escrito en palabras en inglés
- **Fuente**: Calculado

### #{NEW_TOTAL_OPB_AS_TEXT_SPANISH}
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD) y escrito en palabras en español
- **Fuente**: Calculado

### #{MATURITY_DATE_ENGLISH}
- **Definición**: Fecha de vencimiento del Facility (MMMM, d, YYYY - MMMM = month in words)
- **Fuente**: Calculado

### #{MATURITY_DATE_SPANISH}
- **Definición**: Fecha de vencimiento del Facility ("d 'de' MMMM YYYY" = mes en palabras)
- **Fuente**: Calculado

---

## ASSIGNMENT TAPE

> Variables de la Assignment Tape: cesión de contratos como colateral.

### Contract ID (Assignment)
- **Definición**: Código único (alfanumérico) de identificación de cada contrato individual
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Contract ID (Assignment)
- **Definición**: Código único (alfanumérico) de identificación de cada contrato individual
- **Fuente**: Assignment Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Contract Number (Assignment)
- **Definición**: Código único (numérico) de identificación de cada contrato individual
- **Fuente**: Assignment Tape
- **Tipo de dato**: Bigdecimal
- **Valores permitidos**: > o = 0
- **Configuración blanks**: 0

### Assignment_Beneficiary (Assignment)
- **Definición**: Nombre del Beneficiario al que le fue cedido el contrato como colateral
- **Fuente**: Assignment Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Funder (Assignment)
- **Definición**: Entidad / Sociedad que fondea el dinero prestado para cada contrato individual
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Product (Assignment)
- **Definición**: Originalmente llamado asset type - es el producto que se está prestando a los usuarios finales del borrower
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Product Type (Assignment)
- **Definición**: Subdivisiones dentro del Product
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Account Debtor Type (Assignment)
- **Definición**: Característica específica del usuario/cliente/empresa deudora.  Puede variar de contrato a contrato
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Eligible Type (Assignment)
- **Definición**: Client_type addi
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Configuración blanks**: ""

### Classification (Assignment)
- **Definición**: Clasificación del cliente/account debtor por tamaño
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Configuración blanks**: ""

### Segment (Assignment)
- **Definición**: Clasificación del cliente/account debtor por tamaño
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Account Debtor Tax ID (Assignment)
- **Definición**: Código de identificación tributaria del account debtor (persona / empresa) que realiza una actividad económica y contribuye impuestos
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Account Debtor ID (Assignment)
- **Definición**: Código de identificación de identidad del account debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Account Debtor internal ID (Assignment)
- **Definición**: Código de identificación interno del account debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Account Debtor Name (Assignment)
- **Definición**: Código de identificación del usuario deudor del contrato
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Payer Tax ID (Assignment)
- **Definición**: Código de identificación tributaria del usuario pagador de la deuda del contrato.  Es quien paga la factura en nombre del deudor.  Caso de uso particular de ciertas industrias con factoraje
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Payer ID (Assignment)
- **Definición**: Código de identificación de identidad del usuario pagador de la deuda del contrato.  Es quien paga la factura en nombre del deudor.  Caso de uso particular de ciertas industrias con factoraje
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricciones
- **Configuración blanks**: ""

### Loan Payment Frequency (Assignment)
- **Definición**: Periodicidad con la que se tiene que pagar la deuda
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string

### Industry (Assignment)
- **Definición**: Industria a la que pertenece el Merchant
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Merchant Name (Assignment)
- **Definición**: Nombre del Merchant
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Internal Risk Score (string) (Assignment)
- **Definición**: Score crediticio (de texto) del deudor score que se genera por un modelo de riesgo interno de la empresa
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Days Past Due Buckets (Assignment)
- **Definición**: Dato de morosidad - indica en qué bucket de días de retraso en el pago de la/las cuotas adeudadas del préstamo
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
EJ: 
Buckets:
- 0-30, 30-60, +60
- 0<x<30, 30<x<60, x>60
- **Configuración blanks**: ""

### Foreberance (Assignment)
- **Definición**: El pago del deudor se encuentra temporalmente frenado o disminuído
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Country (Assignment)
- **Definición**: País de Origen del Account Debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Currency (Assignment)
- **Definición**: Indica la moneda de cada préstamo individual
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Loan Status (Assignment)
- **Definición**: Estatus del préstamo individual.  Puede variar de contrato a contrato.
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Industry Universal ID (Assignment)
- **Definición**: Código que identifica la industria a la que pertenece el deudor (SCIAN en Mex, CIIU en Col, etc)
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Sin Restricción
- **Configuración blanks**: ""

### Account Debtor Revenue under 100K (Assignment)
- **Definición**: Característica del Revenue del account debtor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Number of debtor active loans (Assignment)
- **Definición**: Cantidad de créditos activos de un mismo deudor
- **Fuente**: Loan Tape
- **Tipo de dato**: Bigdecimal
- **Valores permitidos**: > o = 0
- **Configuración blanks**: ""

### Fully Paid Loan (Assignment)
- **Definición**: Préstamo fue repagado en su totalidad
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Cancelled Loan (Assignment)
- **Definición**: Préstamo fue cancelado
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Verified by Verification Agent (Assignment)
- **Definición**: Filtrado por un agente de verificación - funciona como un eligibility critera
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Government (Assignment)
- **Definición**: Deudor es o no un ente gubernamental
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Not For Profit (Assignment)
- **Definición**: Deudor es o no una empresa sin fines de lucro
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Escrow Account (Assignment)
- **Definición**: Deudor dejó o no Garantía
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Geographic State (Assignment)
- **Definición**: Estado al que pertenece el deudor
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Client Payment (Unpaid) (Assignment)
- **Definición**: Client has not paid
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Returning Client (Assignment)
- **Definición**: New or existing customer
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 o 0
True o False
First time client, 2nd time client, 3rd time client
- **Configuración blanks**: 0

### Learning Population (Assignment)
- **Definición**: Small group of loans destined to test the market risk
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Loan Modification (Assignment)
- **Definición**: Loan has been renegotiated
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Terminated Ally (Assignment)
- **Definición**: Relationship with ally has been terminated
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Billing Cycle (Assignment)
- **Definición**: Periodicity of client payment
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: Valores permitidos en el string
- **Configuración blanks**: ""

### Cash Balance Date (Assignment)
- **Definición**: Fecha en la que se obtuvo el cash balance
- **Fuente**: Loan Tape
- **Tipo de dato**: LocalDate
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos

### Loan Tape reporting date (Assignment)
- **Definición**: Fecha en la que se ejecutó el loan tape cargado
- **Fuente**: Loan Tape
- **Tipo de dato**: LocalDate
- **Valores permitidos**: Fecha
- **Configuración blanks**: Hoy no tenemos

### Affiliate (Assignment)
- **Definición**: El cliente es affiliado al borrower
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Restructured (Assignment)
- **Definición**: Ya modificaste el contrato
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Other tenor (Assignment)
- **Definición**: TBD
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Risk eligible (Assignment)
- **Definición**: El riesgo del cliente es elegible para el borrower?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### SAT (Assignment)
- **Definición**: Tiene SAT?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Bureau (Assignment)
- **Definición**: Tiene Bureau Score?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### CBU (Assignment)
- **Definición**: Reporta estados de cuenta CBU?
- **Fuente**: Loan Tape
- **Tipo de dato**: String
- **Valores permitidos**: 1 = TRUE
0 = FALSE
- **Configuración blanks**: 0

### Lender (Assignment)
- **Definición**: Es la entidad que prestará el dinero al Borrower siguiendo los estatutos demarcados en el Deal.  También llamado Financing Partner o acreedor
- **Fuente**: Loan Agreement

### Borrower (Assignment)
- **Definición**: Es la entidad que recibirá el dinero y que quedará en deuda con el Lender.  También llamado Deal Partner u originador
- **Fuente**: Loan Agreement

### Trust (Assignment)
- **Definición**: También llamado Fideicomiso, o special purpose vehicle (SPV)
En el Deal, habrá constantemente movimientos de dinero de ambas partes, sin embargo, estas dos partes jamás harán movimientos directamente, por razones de proceso y ley crearán una figura llamada Fideicomiso. Esta figura estará administrada por otra entidad, generalmente bancaria, que servirá de mediador entre ambas partes. El Fideicomiso recibe los activos por parte del Borrower y el cash por parte del Lender y le da el dinero al borrower mientras el se encarga de ir recibiendo las obligaciones antes otorgadas por el borrower.
- **Fuente**: Loan Agreement

### Trustee (Assignment)
- **Definición**: También llamado Fiducia o Fiduciaria.
Es la entidad que estará encargada de administrar los recursos del Trust, generalmente es un banco que presta este servicio y durante el transcurso del Deal cobrará por ser el ente administrador. El Trustee existe para una mayor transparencia y legalidad de todo el Deal entre ambas partes.
- **Fuente**: Loan Agreement

### SOFOM (Assignment)
- **Definición**: Es un tipo de sociedad contemplada en la legislación mexicana cuyo objetivo principal es el otorgamiento de crédito. Pueden ser entidades reguladas (ER) o no reguladas (ENR). También existen las Sociedad Financiera de Objeto Limitado (Sofol). Es de alguna manera coloquial la figura de Fideicomiso en Mexico.
- **Fuente**: Loan Agreement

### Master Trust (Assignment)
- **Definición**: Cuenta recaudadora de los pagos de cada cliente individual del borrower
- **Fuente**: Loan Agreement

### Master Trust Trustee (Assignment)
- **Definición**: Responsable por asignar los recaudos de pagos individuales del borrower a los Trusts de cada Debt Facility
- **Fuente**: Loan Agreement

### Funder (1, 2, ..., N) (Assignment)
- **Definición**: Entidad/Sociedad que fondea el dinero en cada Debt Facility
- **Fuente**: Loan Agreement

### Closing Date (Assignment)
- **Definición**: Fecha de firma de contrato e inicio de operación
- **Fuente**: Loan Agreement

### End of Draw date (Assignment)
- **Definición**: Fecha límite para solicitar advances
- **Fuente**: Loan Agreement

### End of Availability Date (Assignment)
- **Definición**: Fecha límite para comenzar amortización
- **Fuente**: Loan Agreement

### Maturity Date (Assignment)
- **Definición**: Fecha fin del contrato
- **Fuente**: Loan Agreement

### Due Date (Assignment)
- **Definición**: Fecha de finalización del tranche
- **Fuente**: Loan Agreement

### Start Date (Assignment)
- **Definición**: Fecha en la que se inició la reconciliación - fecha de upload del loan tape
- **Fuente**: Input: usuario front

### Last Reconciliation Event (Assignment)
- **Definición**: Fecha de la reconciliación anterior
- **Fuente**: Calculado

### Payment Date (Assignment)
- **Definición**: La fecha en la que se realizan los pagos asociados a la operación de un debt facility
- **Fuente**: Input: usuario front

### Disbursement Date (Assignment)
- **Definición**: La fecha en la que se realiza un desembolso / net advance
- **Fuente**: Input: usuario front

### Proposed date for Disbursement (Assignment)
- **Definición**: Fecha propuesta de desembolso por parte del borrower.  Suele estar asociado a reglas específicas (ej: entre N y X días)
- **Fuente**: Input: usuario front

### Total Commitment Amount (Assignment)
- **Definición**: Total del dinero del facility
- **Fuente**: Loan Agreement

### Available Amount (Assignment)
- **Definición**: Total disponible (total del dinero del facility - dinero ya pedido)
- **Fuente**: Loan Agreement

### Current Available Amount (Assignment)
- **Definición**: "Available Amount / Current Available Amount"
- **Fuente**: Loan Agreement

### Number of Tranches (1, 2, ..., N) (Assignment)
- **Fuente**: Loan Agreement

### Days to Complete Disbursement Data (Assignment)
- **Fuente**: Loan Agreement

### Min Net Advance (Assignment)
- **Fuente**: Loan Agreement

### Max Net Advance (Assignment)
- **Fuente**: Loan Agreement

### Net Advance Frequency (Assignment)
- **Fuente**: Loan Agreement

### Min Cash Release (Assignment)
- **Fuente**: Loan Agreement

### Max Cash Release (Assignment)
- **Fuente**: Loan Agreement

### Cash Release Frequency (Assignment)
- **Fuente**: Loan Agreement

### Interest Type (Assignment)
- **Definición**: Estrategia de interés: Si se trata de una tasa de interés flotante o fija
- **Fuente**: Loan Agreement

### Applicable Margin (Assignment)
- **Definición**: Porción de tasa de interés fija
- **Fuente**: Loan Agreement

### Reference Rate (Assignment)
- **Definición**: Nombre de la tasa, fuente de donde obtenerala, fecha de qué día usar
- **Fuente**: Loan Agreement

### Spread (Assignment)
- **Fuente**: Loan Agreement

### Upper Bound (Assignment)
- **Fuente**: Loan Agreement

### Interest Formula (Assignment)
- **Fuente**: Loan Agreement

### Interest Projection necesity (Assignment)
- **Definición**: Cálular hasta fin del período
- **Fuente**: Loan Agreement

### Collections Account Balance (Assignment)
- **Definición**: Es la cuenta donde se acreditan los pagos de los usuarios finales del originador (los clientes de nuestros borrowers) por el master trustee una vez que ellos hayan sido primero depositados en el Master Trust Account, e identificados como pertenecientes al trust particular en cuestión. También es la cuenta donde si hubiera BB deficiency, y el borrower quisiera curarlo con cash, pueda depositarlo. De esta cuenta también salen los pagos que tengan que hacerse por conceptos de fees, expenses, etc.
- **Fuente**: Input: usuario front / Datanomik

### Reserve Account Balance (Assignment)
- **Definición**: Es la cuenta donde, en algunos casos y bajo ciertas circunstancias, se debe dejar una reserva (transfiriendo según corresponda desde el collections account o bien en caso que fuera necesario, del credit account via un net advance si es que no se tiene cash suficiente pero igual el BB es superavitario)
- **Fuente**: Input: usuario front / Datanomik

### Margin Account Balance (Assignment)
- **Definición**: Es la cuenta donde, en algunos casos y bajo ciertas circunstancias, se debe dejar un margen de liquidez y de reserva por la operación de derivados.
- **Fuente**: Input: usuario front / Datanomik

### Credit Account Balance (Assignment)
- **Definición**: Es la cuenta del trust donde el lender deposita los advances requeridos.
- **Fuente**: Input: usuario front / Datanomik

### Disbursement Account Balance (Assignment)
- **Fuente**: Input: usuario front / Datanomik

### Master Trust Account Balance (Assignment)
- **Definición**: Es la cuenta donde los usuarios finales del originador (los clientes de nuestros borrowers) pagan sus cuotas. Aquí se acumulan esos pagos y después de x tiempo (por ejemplo una periodicidad semanal) se distribuyen más específicamente por el master trustee al Collections Account de cada trust particular que cuelga debajo de este Master Trust Account.
- **Fuente**: Input: usuario front / Datanomik

### Trust Expenses Reserve (Assignment)
- **Fuente**: Input: usuario front / Cálculo

### Servicing Costs Reserve (Assignment)
- **Fuente**: Input: usuario front / Cálculo

### Undrawn Fee Reserve (Assignment)
- **Fuente**: Input: usuario front / Cálculo

### Minimum Utilization Fee (Assignment)
- **Fuente**: Input: usuario front / Cálculo

### Interests Reserve (Assignment)
- **Fuente**: Input: usuario front / Cálculo

### Withholding Tax Reserve (Assignment)
- **Fuente**: Input: usuario front / Cálculo

### Figarantías Reserve (Assignment)
- **Fuente**: Input: usuario front / Cálculo

### Other Expense Reserves (Assignment)
- **Fuente**: Input: usuario front

### Raw Collateral Balance (Assignment)
- **Definición**: Raw OPB sum of all loans/receivables included in the loan tape (no adjustments made) (taking the loan tape as a whole at book value)
- **Fuente**: Calculado

### Prefilters (1, 2, ..., N) (Assignment)
- **Definición**: Necessary filters/validations that are not Elegiblity Criteria per se
- **Fuente**: Calculado

### Validations (1, 2, ..., N) (Assignment)
- **Definición**: Necessary filters/validations that are not Elegiblity Criteria per se
- **Fuente**: Calculado

### Total Collateral Balance (Assignment)
- **Definición**: Raw Collateral Balance net of Prefilters (validations)
- **Fuente**: Calculado

### Adjusted Collateral Balance (Assignment)
- **Definición**: Total Collateral Balance adjusted by discounts (e.g. MDF - not risk multipiers nor adv. rates)
- **Fuente**: Calculado

### Ineligible Collateral Balance (Assignment)
- **Definición**: Ineligible loans/receivables within Adjusted Collateral Balance
- **Fuente**: Calculado

### EligibilityCriteria (1,2,...,N) (Assignment)
- **Definición**: Individual EC that will result in filtering of the loan tape
- **Fuente**: Loan Agreement

### Eligible Collateral Balance (Assignment)
- **Definición**: Adjusted Collateral Balance net of Ineligible Collateral Balance
- **Fuente**: Calculado

### Excess Concentration Amount (Assignment)
- **Definición**: Amounts within Eligible Collateral Balance that exceed concentration limits
- **Fuente**: Calculado

### Concentration Limit with Utilization Factor <1 1 (Assignment)
- **Fuente**: Calculado

### Concentration Limit with Utilization Factor <1 N (Assignment)
- **Fuente**: Calculado

### Net Collateral Balance (Assignment)
- **Definición**: Eligible Collateral Balance net of Excess Concentration Amount
- **Fuente**: Calculado

### Excess Delinquency Amount (Assignment)
- **Definición**: Amounts within Net Collateral Balance that exceed delinquency thresholds [SUMPRODUCT (Net Collateral Balance; 1- Risk Multipliers)]
- **Fuente**: Calculado

### Delinquency-Adjusted Net Collateral Balance (Assignment)
- **Definición**: Net Collateral Balance net of Excess Delinquency Amount
- **Fuente**: Calculado

### Collateral Borrowing Base Amount (Assignment)
- **Definición**: SUMPRODUCT (Delinquency-Adjusted Net Collateral Balance; Advance Rates)
- **Fuente**: Calculado

### Cash Borrowing Base Amount (Assignment)
- **Definición**: Cash available for BB - Cash that is unequivocally included within the Borrowing Base calculation (i.e. current cash balance net of planned/reserved fees and expeses)
- **Fuente**: Calculado

### Borrowing Base (Assignment)
- **Definición**: Collateral Borrowing Base Amount + Cash Borrowing Base Amount + **if applicable** --> Unrealized FX gains/(losses) + Hedging Costs + Unrealized FX Execution gains/(losses)
- **Fuente**: Calculado

### Unrealized FX gains/(losses) (Assignment)
- **Fuente**: Calculado

### Hedging Costs (Assignment)
- **Fuente**: Calculado

### Unrealized FX execution gains/(losses) (Assignment)
- **Fuente**: Calculado

### Outstanding Principal Balance (Assignment)
- **Definición**: Sum(net advance requested)
- **Fuente**: Calculado

### Cash Hold (Assignment)
- **Definición**: Collateral Borrowing Base Amount - OPB
- **Fuente**: Calculado

### Total Availability (Assignment)
- **Definición**: Borrowing Base - Outstanding Principal Balance >= 0
- **Fuente**: Calculado

### BB deficiency (Assignment)
- **Definición**: Borrowing Base - Outstanding Principal Balance < 0
- **Fuente**: Calculado

### Max Immediate Cash Release Available (Assignment)
- **Definición**: min(total availability, new collateral borrowing base amount, cash borrowing base amount)
- **Fuente**: Calculado

### Max Cash Release Available in N (Assignment)
- **Definición**: min(total availability, cash borrowing base amount) - if(se muestra max immediate cash release, max immediate cash release, 0)
- **Fuente**: Calculado

### Max Net Advance (Assignment)
- **Definición**: total availability - if(se muestra immediate cash release, immediate cash release, 0) - if(se muestra 3 day cash release, 3 day cash release, 0)
- **Fuente**: Calculado

### Immediate Cash Release Requested (Assignment)
- **Fuente**: Input: usuario front

### Cash Release Available in N Requested (Assignment)
- **Fuente**: Input: usuario front

### Net Advance Requested (Assignment)
- **Fuente**: Input: usuario front

### FX Hedge position Maturity Date (Assignment)
- **Fuente**: Input: usuario front

### FX Hedge position spot rate (Assignment)
- **Fuente**: Input: TRM

### FX hedge position disbursement spot rate (Assignment)
- **Fuente**: Input: usuario front

### FX hedge position forward rate (Assignment)
- **Fuente**: Input: usuario front

### Unrealized gains (losses) (Assignment)
- **Fuente**: Calculado

### Hedging Costs (Assignment)
- **Fuente**: Calculado

### Estimated gains (losses) (Assignment)
- **Definición**: Approximate settlement amount if the hedge were matured today
- **Fuente**: Calculado

### Annualized hedging costs (Assignment)
- **Fuente**: Calculado

### #{BORROWING_BASE_DEFICIENCY} (Assignment)
- **Definición**: Valor = 0 en caso de no tener deficiency, o positivo en caso de tener deficiency
- **Fuente**: Calculado

### #{BORROWING_BASE_IN_LOCAL_CURRENCY} (Assignment)
- **Definición**: Resultado del BB en borrower operation currency
- **Fuente**: Calculado

### #{CASH_TRUST} (Assignment)
- **Definición**: es lo que ingresa en borrower en la pantalla de additional info en la primera línea,
no incluye ningun descuento.  Completado por el borrower o, en su defecto, datanomik
- **Fuente**: Calculado

### #{HEDGING_COST} (Assignment)
- **Definición**: Hedging costs asociados a todos los forwards negociados hasta el momento contra la TRM del reconciliation date
- **Fuente**: Calculado

### #{UNREALIZED_GAIN} (Assignment)
- **Definición**: Resultados positivos, sumatoria de todos los unrealized gains
- **Fuente**: Calculado

### #{UNREALIZED_LOSSES} (Assignment)
- **Definición**: Resultados negativos, sumatoria de todos los unrealized losses
- **Fuente**: Calculado

### #{UNREALIZED_GAINS_AND_LOSSES} (Assignment)
- **Definición**: Resultado de NETO: Unrealized gain/loss en base al OPB y hedges
- **Fuente**: Calculado

### #{HEDGING_COST_AND_UNREALIZED_LOSSES} (Assignment)
- **Definición**: Sumatoria de Hedging costs y todos los unrealized losses
- **Fuente**: Calculado

### #{TOTAL_AVAILABLE_FUNDS} (Assignment)
- **Definición**: Igual a cash_trust Validar con finanzas que es el cash trust --> OK
- **Fuente**: Calculado

### #{TOTAL_COPB_WITH_ADVANCE_RATE} (Assignment)
- **Definición**: Según nuestro glosario, es el "Collateral Borrowing Base Amount"
- **Fuente**: Calculado

### #{SERVICING_COST} (Assignment)
- **Fuente**: Calculado

### #{SERVICING_COST_WITHOUT_VAT} (Assignment)
- **Definición**: SERVICING COST / 19%
- **Fuente**: Calculado

### #{TRUST_EXPENSES} (Assignment)
- **Fuente**: Calculado

### #{FIGARANTIAS} (Assignment)
- **Fuente**: Calculado

### #{WITHHOLDING_TAX} (Assignment)
- **Fuente**: Calculado

### #{INTEREST_EXPENSE} (Assignment)
- **Fuente**: Calculado

### #{UNUSED_FEE} (Assignment)
- **Fuente**: Calculado

### #{LAST_MONTH_INTEREST} (Assignment)
- **Fuente**: Calculado

### #{UPFRONT_FEE} (Assignment)
- **Fuente**: Calculado

### #{FORWARD_CONTRACTS_SETTLEMENT_EXPENSE} (Assignment)
- **Fuente**: Calculado

### #{OTHER} (Assignment)
- **Fuente**: Calculado

### #{CASH_RELEASE} (Assignment)
- **Definición**: Monto resultante de cash release posterior al cálculo del BB y solicitud de cash release por parte del borrower.  Borrower Operation Currency
- **Fuente**: Calculado

### #{NET_ADVANCE_AS_TEXT_ENGLISH} (Assignment)
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency y escrito en palabras en inglés
- **Fuente**: Calculado

### #{NET_ADVANCE_AS_TEXT_SPANISH} (Assignment)
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency y escrito en palabras en español
- **Fuente**: Calculado

### #{NET_ADVANCE_CASH_RELEASE_AMOUNT} (Assignment)
- **Definición**: Monto resultante de cash release + net advance posterior al cálculo del BB y solicitud de cash release y net advance por parte del borrower.  Borrower Operation Currency
- **Fuente**: Calculado

### #{NET_ADVANCE_CASH_RELEASE_DATE} (Assignment)
- **Definición**: es la fecha de reconciliación si solo se hizo cash_release, o la fecha del net_advance (la de generación del documento) si se hizo net advance y cash release
- **Fuente**: Calculado

### #{NET_ADVANCE} (Assignment)
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency
- **Fuente**: Calculado

### #{NEW_OPB} (Assignment)
- **Definición**: variables.put(TemplateVariables.NEW_OPB, ""); DEBERÍA SER EL VALOR DEL NUEVO COLATERAL CEDIDO - es x advance rate o no? - Hablé con Fefo y es el RAW Collateral
- **Fuente**: Calculado

### #{OUTSTANDING_UPB_OF_ALL_LOANS_IN_LOCAL_CURRENCY} (Assignment)
- **Definición**: OPB en collateral currency sin contar el net advance en curso
- **Fuente**: Calculado

### #{NET_ADVANCE_DATE_ENGLISH} (Assignment)
- **Definición**: Fecha de generación del documento --> cuando paso a la pantalla de documentos.  no tiene que ver con la de descarga MM/DD/YYYY
- **Fuente**: Calculado

### #{NET_ADVANCE_DATE_SPANISH} (Assignment)
- **Definición**: Fecha de generación del documento --> cuando paso a la pantalla de documentos.  no tiene que ver con la de descarga DD/MM/YYYY
- **Fuente**: Calculado

### #{PROPOSED_DATE_FOR_DISBURSEMENT_ENGLISH} (Assignment)
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha USA
- **Fuente**: Calculado

### #{PROPOSED_DATE_FOR_DISBURSEMENT_SPANISH} (Assignment)
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha LATAM
- **Fuente**: Calculado

### #{RECONCILIATION_DATE_ENGLISH} (Assignment)
- **Definición**: MMMM, d, YYYY - MMMM = month in words - creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement
- **Fuente**: Calculado

### #{RECONCILIATION_DATE_SPANISH} (Assignment)
- **Definición**: d 'de' MMMM YYYY creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement
- **Fuente**: Calculado

### #{RECONCILIATION_DATE} (Assignment)
- **Definición**: MM/DD/YYYY - creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement
- **Fuente**: Calculado

### #{ADVANCE_RATE_CLIENT_FPI( "advance_rate_client_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_CLIENT_FPL("advance_rate_client_fpl")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_PROSPECT_FPI("advance_rate_prospect_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_PROSPECT_NO_PAYMENT("advance_rate_prospect_no_payment")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_CLIENT_FPI("total_eligible_gross_client_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_CLIENT_FPL("total_eligible_gross_client_fpl")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_PROSPECT_FPI("total_eligible_gross_prospect_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_PROSPECT_NO_PAYMENT("total_eligible_gross_prospect_no_payment")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_SUM("total_eligible_gross_prospect_sum")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_CLIENT_FPI("total_eligible_net_client_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_CLIENT_FPL("total_eligible_net_client_fpl")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_PROSPECT_FPI("total_eligible_net_prospect_fpi"} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_PROSPECT_NO_PAYMENT("total_eligible_net_prospect_no_payment")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_SUM("total_eligible_net_client_sum")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_CLIENT_FPI("total_excluded_client_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_CLIENT_FPL("total_excluded_client_fpl")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_PROSPECT_FPI("total_excluded_prospect_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_PROSPECT_NO_PAYMENT("total_excluded_prospect_no_payment")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_SUM("total_excluded_client_sum")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_CLIENT_FPI("total_unpaid_principal_client_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_CLIENT_FPL("total_unpaid_principal_client_fpl")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_PROSPECT_FPI("total_unpaid_principal_prospect_fpi")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_PROSPECT_NO_PAYMENT("total_unpaid_principal_prospect_no_payment")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_SUM("total_unpaid_principal_sum")} (Assignment)
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TRANCHE_1_NET_COLLATERAL_BALANCE_LC} (Assignment)
- **Definición**: Suma de los montos de capital (Principal) pendientes de pago en los loans financiados con el 1er tramo del Facility
- **Fuente**: Calculado

### #{TRANCHE_2_NET_COLLATERAL_BALANCE_LC} (Assignment)
- **Definición**: Suma de los montos de capital (Principal) pendientes de pago en los loans financiados con el 2do tramo del Facility
- **Fuente**: Calculado

### #{FX_RATE_RECONCILIATION_DATE} (Assignment)
- **Definición**: Tasa de cambio oficial a la fecha del BB Reconciliation
- **Fuente**: Calculado

### #{OUTSTANDING_UPB_OF_ALL_LOANS_IN_USD} (Assignment)
- **Definición**: Suma de los Net Advances realizados hasta la fecha (en USD)
- **Fuente**: Calculado

### #{NET_ADVANCE_USD} (Assignment)
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower en USD
- **Fuente**: Calculado

### #{NET_ADVANCE_USD_AS_TEXT_ENGLISH} (Assignment)
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower en USD y escrito en palabras en inglés
- **Fuente**: Calculado

### #{OPB_AND_NET_ADVANCE_USD} (Assignment)
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD)
- **Fuente**: Calculado

### #{OPB_AND_NET_ADVANCE_USD_AS_TEXT_ENGLISH} (Assignment)
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD) y escrito en palabras en inglés
- **Fuente**: Calculado

### #{NEW_TOTAL_OPB_AS_TEXT_SPANISH} (Assignment)
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD) y escrito en palabras en español
- **Fuente**: Calculado

### #{MATURITY_DATE_ENGLISH} (Assignment)
- **Definición**: Fecha de vencimiento del Facility (MMMM, d, YYYY - MMMM = month in words)
- **Fuente**: Calculado

### #{MATURITY_DATE_SPANISH} (Assignment)
- **Definición**: Fecha de vencimiento del Facility ("d 'de' MMMM YYYY" = mes en palabras)
- **Fuente**: Calculado

---

## PAYMENT MAPPER

> Variables del Payment Tape y gateways de pago.

### Payment_Date
- **Definición actual**: Fecha en la que se realiza el pago
- **Definición TO BE**: Fecha en la que el Gateway informó el pago
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Provider Creation Date`
- **Tipo de dato**: Gateway Files
Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: ""

### Payment_ID
- **Definición actual**: Código de identificación del pago en el gateway
- **Almacenamiento DWH**: payments_distributions
Base Borrower Db Payments
- **Nombre en DWH**: `Provider payment id
Provider ID`
- **Tipo de dato**: Gateway Files
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Currency
- **Definición actual**: Moneda en la que se realizó la transacción
- **Almacenamiento DWH**: payments_distributions
Base Borrower Db Payments
- **Nombre en DWH**: `Currency
Currency`
- **Tipo de dato**: Gateway Files
Payment Tape

### Payment_Amount
- **Definición actual**: Valor monetario de la transacción
- **Definición TO BE**: Monto abonado por el pagador
- **Almacenamiento DWH**: payments_distributions
Base Borrower Db Payments
- **Nombre en DWH**: `Total Payment
Amount`
- **Tipo de dato**: Gateway Files
Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Contract_ID
- **Definición actual**: Código único (alfanumérico) de identificación de cada contrato individual
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Asset_id`
- **Tipo de dato**: Loan Tape

### Contract_Number
- **Definición actual**: Código único (numérico) de identificación de cada contrato individual
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Asset_id`
- **Tipo de dato**: Loan Tape
Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Account_Debtor_ID
- **Definición actual**: Código único (alfanumérico) que identifica al pagador.
- **Definición TO BE**: Código único (alfanumérico) que identifica al beneficiario del crédito. No necesariamente es el pagador
- **Almacenamiento DWH**: payments_distributions
Base Borrower Db Payments
- **Nombre en DWH**: `Provider loan debtor id
Loan Debtor Legal ID`
- **Tipo de dato**: Loan Tape
Payment Tape

### Payer_ID
- **Definición actual**: Código único (alfanumérico) que identifica al pagador.
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Payer Legal ID`
- **Tipo de dato**: Gateway Files
Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Gateway
- **Definición actual**: Nombre del medio de pago a través del cuál se realiza la transacción
- **Definición TO BE**: Canal de pago donde se originó el pago
- **Almacenamiento DWH**: payment_distributions
Base Borrower Db Payments
- **Nombre en DWH**: `Channel
Payment Gateway Code`
- **Tipo de dato**: Gateway Files
Payment Tape

### Payment_Detail
- **Definición actual**: Descripción del direccionamiento del Payment Amount (Ej: Capital, intereses, VAT, etc)
- **Definición TO BE**: Información extra proveniente del gateway de pago
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Provider Extra Information`
- **Tipo de dato**: Gateway Files

### Payment_Principal
- **Definición actual**: Valor monetario de la transacción correspondiente al pago de capital
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Current Principal`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Interest
- **Definición actual**: Valor monetario de la transacción correspondiente al pago de intereses
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Current Interest`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Fees
- **Definición actual**: Valor monetario de la transacción correspondiente al pago de fees
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Collection Fees`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Transfer_ID
- **Definición actual**: Código único (Alfanumérico) que identifica la transacción
- **Definición TO BE**: Código único de identificación del pago en la cuenta bancaria, una vez que fue desembolsado.
- **Almacenamiento DWH**: Base Borrower Db Payments
Base Funds Transfers
- **Nombre en DWH**: `Fund Transfer ID
ID`
- **Tipo de dato**: Extracto Bancario
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Reference
- **Definición actual**: Código único (Alfanumérico) auxiliar al Transfer ID, que identifica la transacción.
- **Tipo de dato**: Payment tape

### Contact Number
- **Definición actual**: Numero de telefono del pagador
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Contact Number`
- **Tipo de dato**: Loan Tape
Payment Tape

### Email
- **Definición actual**: Email del pagador
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Email`
- **Tipo de dato**: Loan Tape
Payment Tape

### Full_Name
- **Definición actual**: Nombre completo del pagador
- **Tipo de dato**: Loan Tape
Payment Tape

### Payment_Method
- **Definición actual**: Payment_Method
- **Definición TO BE**: Método de pago. Aplica para pasarelas que ofrecen varios métodos de pago
- **Tipo de dato**: Loan Tape
Payment Tape

### individual_adjusted_outstanding_principal_balance
- **Definición actual**: Individual Contracts Outstanding Principal Balance ajustado por una condición adicional (ej: FICO Score)
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### New variables from DWH - NOT IN DICCIONARY

### Internal_Payment_ID
- **Definición actual**: Código de identificación del pago en el gateway
- **Almacenamiento DWH**: payments_distributions
Base Borrower Db Payments
- **Nombre en DWH**: `Internal payment id
ID`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Borrower Code
- **Definición actual**: Stakeholder principal del pago (ej: borrower)
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Stakeholder principal del pago (ej: borrower)`
- **Tipo de dato**: Interno

### Borrower Db Conciliation Date Date
- **Definición actual**: Fecha en la que concilió el pago entre canales y la bd del cliente (LMS, Excel, etc.)
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Fecha en la que concilió el pago entre canales y la bd del cliente (LMS, Excel, etc.)`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: ""

### Borrower Db Conciliation ID
- **Definición actual**: Id interno de la conciliación entre canales y la bd del cliente (LMS,Excel,Etc.)
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Id interno de la conciliación entre canales y la bd del cliente (LMS,Excel,Etc.)`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Borrower Db Payment ID
- **Definición actual**: Id del pago en la base del stakeholder principal (Ej.: Borrower)
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Id del pago en la base del stakeholder principal (Ej.: Borrower)`
- **Tipo de dato**: Payment tape

### Creation Date
- **Definición actual**: Fecha de creación del registro en nuestra base
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Fecha de creación del registro en nuestra base`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: ""

### Disbursement Conciliation Date Date
- **Definición actual**: Fecha en que concilió el pago con los reportes de desembolsos de los canales
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Fecha en que concilió el pago con los reportes de desembolsos de los canales`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: ""

### Disbursement Conciliation ID
- **Definición actual**: Id interno de la conciliación entre canales y archivos de desembolsos
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Id interno de la conciliación entre canales y archivos de desembolsos`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Disbursement ID
- **Definición actual**: Id del desembolso en las bases internas de Vaas
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Id del desembolso en las bases internas de Vaas`
- **Tipo de dato**: Gateway Files

### Disbursement Reference Code
- **Definición actual**: id del desembolso en los archivos de los canales
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `id del desembolso en los archivos de los canales`
- **Tipo de dato**: Gateway Files

### Fund Transfer Conciliation Date Date
- **Definición actual**: Fecha en la que se concilió el desembolso en el extracto bancario
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Fecha en la que se concilió el desembolso en el extracto bancario`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: ""

### Last Update Date Date Date
- **Definición actual**: Fecha de auditoría: último cambio del registro
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Fecha de auditoría: último cambio del registro`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: ""

### Loan Debtor Legal ID Type
- **Definición actual**: Tipo de identificación. Ej.: CC
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Tipo de identificación. Ej.: CC`
- **Tipo de dato**: Gateway Files

### Payer Legal ID Type
- **Definición actual**: Tipo de identificación. Ej.: CC
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Tipo de identificación. Ej.: CC`
- **Tipo de dato**: Gateway Files

### Provider Last Update Date Date
- **Definición actual**: última fecha de actualización del registro en las bases del canal
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `última fecha de actualización del registro en las bases del canal`
- **Tipo de dato**: Gateway Files
- **Validación**: > o = 0
- **Configuración blanks**: ""

### Status
- **Definición actual**: Estado del pago en las bases del canal
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Estado del pago en las bases del canal`
- **Tipo de dato**: Gateway Files

### Version
- **Definición actual**: Versión del registro en las bases del canal
- **Almacenamiento DWH**: Base Borrower Db Payments
- **Nombre en DWH**: `Versión del registro en las bases del canal`
- **Tipo de dato**: Gateway Files
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Moratory_interest
- **Definición actual**: Valor monetario de la transacción correspondiente a los intereses de mora
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Moratory interest`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Guarantee
- **Definición actual**: Valor monetario actual de la garantía
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Guarantee`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Prepayment_benefit
- **Definición actual**: Valor de descuentos por pago adelantado
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Prepayment benefit`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_interest_without_prepayment
- **Definición actual**: Interes original del pago, sin descuentos por prepago
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Sweep`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Leftover
- **Definición actual**: Valor monetario sobrante luego de aplicado el pago
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Current interest without prepayment`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Sweep
- **Definición actual**: ??
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Leftover`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Interest_overdue
- **Definición actual**: Días de demora en la recepción del pago de intereses
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Interest overdue`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Principal_overdue
- **Definición actual**: Días de demora en la recepción del pago del capital
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Principal overdue`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Guarantee_overdue
- **Definición actual**: Días de demora en la recepción del pago de la garantía
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Guarantee overdue`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Unpaid_guarantee
- **Definición actual**: Valor monetario de garantías impagas
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Unpaid guarantee`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Unpaid_principal
- **Definición actual**: Valor monetario de capital impago
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Unpaid principal`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Delinquency_iof
- **Definición actual**: Valor monetario de la transacción correspondiente a Delinquency
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Delinquency iof`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Payment_Current_guarantee
- **Definición actual**: Valor monetario actual de la garantía
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Currenct guarantee`
- **Tipo de dato**: Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Distribution_ID
- **Definición actual**: Código único (alfanumérico) que identifica la distribución en la que ingresó el pago. Si no tiene aún no fue distribuido.
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Distribution ID`
- **Tipo de dato**: Interno
- **Validación**: > o = 0
- **Configuración blanks**: 0

### Capital
- **Almacenamiento DWH**: payments_distributions
- **Nombre en DWH**: `Distribution ID`
- **Tipo de dato**: Loan Tape
Payment Tape
- **Validación**: > o = 0
- **Configuración blanks**: 0

### contract_type
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Tipo de contrato`
- **Tipo de dato**: Scheduled Payments

### borrower_contract_id
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `ID de contrato dentro de la compañía`
- **Tipo de dato**: Scheduled Payments

### atom_contract_id
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `ID del átomo`
- **Tipo de dato**: Scheduled Payments

### borrower_installment_reference
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Número de la cuota`
- **Tipo de dato**: Scheduled Payments

### date
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `fecha esperada de pago`
- **Tipo de dato**: Scheduled Payments

### gross_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Monto bruto de la cuota esperada`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

### net_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Monto neto de la cuota esperada`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

### fee_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Monto de fees de la cuota esperada`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

### interest_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Monto de intereses esperado`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

### tax_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Monto de impuestos esperados`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

### profit_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Utilidad esperada de la cuota`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

### principal_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Monto de capital esperado`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

### guarantee_amount
- **Almacenamiento DWH**: scheduled_payments_installments
- **Nombre en DWH**: `Monto de reserva esperado`
- **Tipo de dato**: Scheduled Payments
- **Validación**: >=0
- **Configuración blanks**: 0

---

## VERIFICATION / EXTRACCIÓN DE DOCUMENTOS

> Variables extraídas de documentos (OCR/AI). Usadas en el flujo de verificación de contratos.

### document_title
- **Definición**: Título del documento, salvo mail o captura de DNI todos tienen uno.
- **Documento / Dimensión**: All

### document_date
- **Definición**: Fecha de emisión del documento.
- **Documento / Dimensión**: All

### signature
- **Definición**: Signature
- **Documento / Dimensión**: All
- **Tipo de dato**: STRING

### signature_existence
- **Definición**: Existencia de firma
- **Documento / Dimensión**: All

### fingerprint_existence
- **Definición**: Existencia o no de huella, no es obligatorio pero algunos pagarés se cierran con firma y con huella.
- **Documento / Dimensión**: All

### amount_of_pages
- **Definición**: Cantidad de páginas que tiene el file.
- **Documento / Dimensión**: All

### macro_contract_id
- **Definición**: Código agrupador de contratos, suele estar asociado al pagaré.
- **Documento / Dimensión**: Crédito

### contract_id
- **Definición**: Código único (alfanumérico) de identificación de cada contrato individual. Cruza entre varios documentos que pueden estar asociados a una misma operación de crédito entre borrower y deudor.
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Sin Restricciones

### loan_term
- **Definición**: Tiempo asociado al repago del préstamos completo en días
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: Días
Semanas
Meses
Años
- **Valores permitidos**: > 0

### loan_payment_frequency
- **Definición**: Periodicidad con la que se tiene que pagar la deuda, puede expresado en días, meses, trimestres, semestres, años, etc
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Valores permitidos en el string

### initial_amount
- **Definición**: Monto del préstamo completo.
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: > 0

### installments
- **Definición**: Cantidad de cuotas o pagos.
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: entero
- **Valores permitidos**: > 0

### disbursement_date
- **Definición**: Fecha en la que se produce el desembolso del préstamo.  MM/DD/YYYY
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha

### due_date
- **Definición**: Fecha en la que debe pagarse la totalidad del préstamo. MM/DD/YYYY
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha

### currency
- **Definición**: Indica la moneda de cada préstamo individual
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Valores permitidos en el string

### account_debtor_id
- **Definición**: Código de identificación de identidad del account debtor (deudor), puede ser NIT.
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Sin Restricciones

### account_debtor_tax_id
- **Definición**: Código de identificación tributaria del account debtor (persona / empresa) que realiza una actividad económica y contribuye impuestos. NIT extendido.
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Sin Restricciones

### account_debtor_name
- **Definición**: Razón social del deudor
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Sin Restricciones

### payer_tax_id
- **Definición**: Código de identificación tributaria del usuario pagador de la deuda del contrato.  Es quien paga la factura en nombre del deudor.  Caso de uso particular de ciertas industrias con factoraje. NIT.
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Sin Restricciones

### payer_id
- **Definición**: Código de identificación de identidad del usuario pagador de la deuda del contrato.  Es quien paga la factura en nombre del deudor.  Caso de uso particular de ciertas industrias con factoraje.
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Sin Restricciones

### billing_cycle
- **Definición**: Periodicity of client payment
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Valores permitidos en el string

### origination_date
- **Definición**: Fecha en la que se firma el contrato entre las partes.
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Valores permitidos en el string

### merchant_name
- **Definición**: Nombre del Merchant (caso finkargo - proveedor del cliente, quien vende la mercadería)
- **Documento / Dimensión**: Operation
- **Valores permitidos**: Valores permitidos en el string

### underlying_currency
- **Definición**: moneda de la operación o transacción subyacente, no es la del préstamo que desembolsa el borrower - común para financiamiento de B2B
- **Documento / Dimensión**: Crédito
- **Valores permitidos**: Valores permitidos en el string

### account_legal_rep_name
- **Definición**: Nombre del representante legal del deudor.
- **Documento / Dimensión**: ID
- **Valores permitidos**: Valores permitidos en el string

### account_legal_rep_id
- **Definición**: ID del representante legal del deudor.
- **Documento / Dimensión**: ID
- **Valores permitidos**: Valores permitidos en el string

### country
- **Definición**: País de Origen del Account Debtor
- **Documento / Dimensión**: ID
- **Valores permitidos**: Valores permitidos en el string

### geographic_state
- **Definición**: Estado al que pertenece el deudor
- **Documento / Dimensión**: ID
- **Valores permitidos**: Valores permitidos en el string

### document_type
- **Definición**: Tipo de documento de identidad presentado (DNI o Pasaporte por ej)
- **Documento / Dimensión**: ID
- **Tipo de dato**: Passport / Pasaporte / Documento Nacional de Identidad / NIT
- **Valores permitidos**: Valores permitidos en el string

### id_date_of_expiry
- **Definición**: Fecha de expiración del documento de identidad presentado
- **Documento / Dimensión**: ID
- **Tipo de dato**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha

### id_issuing_state
- **Definición**: Pais de emisión del documento de identidad presentado
- **Documento / Dimensión**: ID
- **Valores permitidos**: Valores permitidos en el string

### birth_date
- **Definición**: Fecha de nacimiento
- **Documento / Dimensión**: ID
- **Tipo de dato**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha

### equity
- **Definición**: Patrimonio neto de los estados financieros del cliente asociado al loan id con un determinado corte
- **Documento / Dimensión**: Estados Financieros
- **Valores permitidos**: > 0

### debt
- **Definición**: Deuda de los estados financieros del cliente asociado al loan id con un determinado corte
- **Documento / Dimensión**: Estados Financieros
- **Valores permitidos**: > 0

### fecha_estados_financieros
- **Definición**: fecha en la que se actualizaron los estados financieros (ojo que creo que no se dice así.. sería fecha de corte de balance me parece)
- **Documento / Dimensión**: Estados Financieros
- **Tipo de dato**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha

### credit_bureau_score
- **Definición**: Score crediticio del deudor reportado por un bureau de credito
- **Documento / Dimensión**: Historia crediticia
- **Valores permitidos**: > 0

### amount_of_inqueries
- **Definición**: cantidad de llamadas para verificar el score crediticio del deudor
- **Documento / Dimensión**: Historia crediticia
- **Valores permitidos**: > o = 0

### risk_query_date
- **Definición**: fecha en la que se hizo la consulta
- **Documento / Dimensión**: Historia crediticia
- **Tipo de dato**: MM/DD/YYYY
DD/MM/YYYY
MM/YYYY
- **Valores permitidos**: Fecha

### risk_query_result
- **Definición**: resultado de la búsqueda en listas ofac
- **Documento / Dimensión**: Historia crediticia
- **Valores permitidos**: Valores permitidos en el string

### invoice_cufe
- **Definición**: uuid de factura en el sistema de facturas digitales en Colombia (RADIAN)
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: Valores permitidos en el string

### invoice_number
- **Definición**: ID de la factura (no es el CUFE) - es el identificador tipo secuencial
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: Valores permitidos en el string

### invoice_issuer_id
- **Definición**: ID del emisor
- **Documento / Dimensión**: Invoice
- **Tipo de dato**: entero
- **Valores permitidos**: > 0

### invoice_issuer_name
- **Definición**: Nombre del emisor
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: Valores permitidos en el string

### invoice_amount
- **Definición**: monto total de la factura (con IVA)
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: > 0

### invoice_issuing_date
- **Definición**: Fecha de emisión de la factura
- **Documento / Dimensión**: Invoice

### invoice_payment_due_date
- **Definición**: Fecha de vencimiento de la factura
- **Documento / Dimensión**: Invoice

### invoice_payer_name
- **Definición**: Nombre o razón social [Datos del Adquirente / Comprador]
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: Valores permitidos en el string

### invoice_payer_id
- **Definición**: Número Documento [Datos del Adquirente / Comprador]
- **Documento / Dimensión**: Invoice
- **Tipo de dato**: entero
- **Valores permitidos**: > 0

### invoice_tax_payer_type
- **Definición**: Tipo de Contribuyente [Datos del Adquirente / Comprador]
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: Valores permitidos en el string

### invoice_payer_email
- **Definición**: Correo [Datos del Adquirente / Comprador]
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: Valores permitidos en el string

### invoice_internal_reference_id
- **Definición**: Factura # [Notas Finales]
- **Documento / Dimensión**: Invoice
- **Tipo de dato**: entero
- **Valores permitidos**: > 0

### biilling_period_-_from_date
- **Definición**: Periodo (inicio) [Notas Finales]
- **Documento / Dimensión**: Invoice

### biilling_period_-_to_date
- **Definición**: Periodo (fin) [Notas Finales]
- **Documento / Dimensión**: Invoice

### last_payment_date
- **Definición**: Pago oportuno [Notas Finales]
- **Documento / Dimensión**: Invoice

### last_payment_amount
- **Definición**: Pago anterior [Notas Finales]
- **Documento / Dimensión**: Invoice
- **Valores permitidos**: > 0

### supplier_name
- **Definición**: Nombre del proveedor de mercadería o vendor. Caso particular para operaciones de comercio internacional.
- **Documento / Dimensión**: Operation

### merchandise_value
- **Definición**: Valor total de la operación - suele ser mayor que el valor del préstamo. Caso particular para operaciones de comercio internacional.
- **Documento / Dimensión**: Operation

### annual_imports
- **Definición**: Valor anual de las importaciones del cliente asociado al loan id
- **Documento / Dimensión**: Estados Financieros

### puerto_origen
- **Definición**: puerto de salida de producto importado - caso finkargo
- **Documento / Dimensión**: Operation

### monto_de_servicio_de_giro
- **Definición**: monto_de_servicio_de_giro
- **Documento / Dimensión**: Operation

### monto_de_servicio_de_fianza_(si_aplica):
- **Definición**: monto_de_servicio_de_fianza_(si_aplica):
- **Documento / Dimensión**: Operation

### monto_de_servicio_de_garantías_(si_aplica):
- **Definición**: monto_de_servicio_de_garantías_(si_aplica):
- **Documento / Dimensión**: Operation

### plazo_inicial_solicitado
- **Definición**: rever
- **Documento / Dimensión**: Crédito

### plazo_final_definitivo
- **Definición**: rever
- **Documento / Dimensión**: Crédito

### invoice_discount
- **Definición**: Detalle de descuento en la factura
- **Documento / Dimensión**: Invoice

### installment_principal_amount
- **Definición**: Porción de la cuota que corresponde al pago de capital (principal)
- **Documento / Dimensión**: Crédito

### guarantor_name
- **Definición**: Nombre Avalista

### credit_max_amount
- **Definición**: Monto máximo del crédito

### installment_total_amount
- **Definición**: Valor de la cuota total del préstamo

### interest_rate
- **Definición**: tasa de interés (efectiva anual) - revisar cómo juega vs las variables del mapper de loan tape
- **Documento / Dimensión**: Crédito

### promissory_note_id
- **Definición**: número de pagaré - suele ser distinto al número de crédito
- **Documento / Dimensión**: Pagaré

### guarantor_existence
- **Definición**: Si existe o si hay avalista

### goods_description
- **Definición**: Descripción del producto o servicio comercializado

### account_debtor_signature
- **Definición**: firma deudor

### serial_number
- **Definición**: número serie de motor - caso crediorbe

### last_page
- **Definición**: última página de un documento
- **Documento / Dimensión**: All

### creditor_nit
- **Definición**: revisar utilización

### engine_number
- **Definición**: número de motor - caso crediorbe

### guaranteed_amount
- **Definición**: monto garantizado - rever

### account_debtor_surname
- **Definición**: apellido deudor

### insurance_policy
- **Definición**: póliza de seguro

### account_debtor_address
- **Definición**: Account Debtor Address
- **Tipo de dato**: STRING

### company_start_date
- **Definición**: Company Start Date
- **Tipo de dato**: DATE

### license_update
- **Definición**: License Update (Year Only)
- **Tipo de dato**: LONG

### account_legal_rep_position_name_and_id
- **Definición**: Account Legal Rep Position Name And ID
- **Tipo de dato**: STRING

### account_legal_rep_surname
- **Definición**: Account Legal Rep Surname
- **Tipo de dato**: STRING

### service_amount
- **Definición**: Service amount
- **Tipo de dato**: BIG_DECIMAL

### country_of_origin
- **Definición**: País de Origen del Producto
- **Tipo de dato**: STRING

### endorsement
- **Definición**: Endorsement
- **Tipo de dato**: STRING

### payer_name
- **Definición**: Payer Name
- **Tipo de dato**: STRING

### exchange_rate
- **Definición**: tipo de cambio utilizado para calcular total del desembolso en caso de que la operación suyacente sea en otra moneda

### interest_rate_(%)_-_efectiva
- **Definición**: Tasa de interés efectiva a pagarse por el préstamo.
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: Puntos Porcentuales -  0,01
Número Entero - ej agregar % al lado
String - tiene el 10%
- **Valores permitidos**: > 0

### interest_rate_(%)_-_nominal
- **Definición**: Tasa de interés nominal a pagarse por el préstamo.
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: LIBOR, IBR, SOFR, etc + Puntos Porcentuales -  0,01
Número Entero - ej agregar % al lado
String - tiene el 10%
- **Valores permitidos**: > 0

### interest_rate_(fixed)
- **Definición**: comentar con eze si conviene tomar la info así para atajar los casos de uso de tasa variable
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: Puntos Porcentuales -  0,01
Número Entero - ej agregar % al lado
String - tiene el 10%
- **Valores permitidos**: > 0

### interest_rate_(variable)
- **Definición**: comentar con eze si conviene tomar la info así para atajar los casos de uso de tasa variable
- **Documento / Dimensión**: Crédito
- **Tipo de dato**: LIBOR, IBR, SOFR, etc
- **Valores permitidos**: Valores permitidos en el string

---

## BD PAYMENTS — CAMPOS INTERNOS

> Campos de la base de datos interna de pagos de VAAS. Usados en dashboards y reportes.

### Creation Date
- **Definición**: Fecha en la que se creó el registro en nuestras base (Auditoia interna)

### ID
- **Definición**: ID interno de Vaas para el pago

### Last Update Date Date
- **Definición**: Fecha de auditoria interna

### Amount
- **Definición**: Monto

### Borrower Code
- **Definición**: Nombre del borrower al que corresponde la data
- **Uso en dashboards**: Filtrar por el borrower para ver solo datos del mismo

### Borrower DB conciliation ID
- **Definición**: ID del registro en la BD del borrower
- **Uso en dashboards**: ID de la conciliación. Si tiene id, es porque está conciliado

### Borrower DB Conciliation Date
- **Definición**: Fecha de conciliación V1 - el día que conciliaron
- **Uso en dashboards**: Fecha en la que se concilió el pago contra la base del borrower

### Borrower DB payment ID
- **Definición**: ID en la base de Addi (Client Tape)
- **Uso en dashboards**: Este ID identifica el pago en la base del borrower. Si no tiene ID en la base del borrower es porque no se concilió.

### Disbursement Conciliation Date
- **Definición**: Fecha de conciliación V2 - el día que conciliaron
- **Uso en dashboards**: Fecha en la que se verificó que el pago fue conciliado entre reporte de pagos, y reporte de desembolsos

### Disbursement ID
- **Definición**: ID del desembolso
- **Uso en dashboards**: Código del desembolso en los reportes/fuentes

### Disbursement Reference Code
- **Definición**: Código con el que desembolso relaciona al pago que corresponde

### Fund Transfer Conciliation Date
- **Definición**: Fecha de conciliación con el extracto bancario
- **Uso en dashboards**: Fecha en la que se verificó que el pago fue desembolsado. Se encontró en el extracto bancario

### Loan Debtor Legal ID
- **Definición**: Id del clientes (Ej: Número de cédula)

### Loan Debtor Legal ID Type
- **Definición**: Tipo de ID (Ej: CC)

### Payer Legal ID
- **Definición**: Id del clientes (Ej: Número de cédula) - REAL (El dibu pagó por Messi)

### Payer Legal ID Type
- **Definición**: Tipo de ID (Ej: CC) - REAL (El dibu pagó por Messi)

### Payment Gateway Code
- **Definición**: Nombre del gateway de pago
- **Uso en dashboards**: Se utiliza para los filtros y segregar la info

### Provider Creation Date
- **Definición**: Fecha en la que pago el cliente de Addi. Fecha con la que se arman los gráficos

### Provider Extra Information
- **Definición**: No se usa. Info adicional que mandan los gateways

### Provider ID
- **Definición**: ID externo del pago (En el gateway)

### Provider Last Update Date
- **Definición**: Last update en las bases del gateway

### Status
- **Definición**: Informa si el pago fue aprobado. Marca los Refunded, Rejected y los Approved

---

## LOAN AGREEMENT — VARIABLES DE CONTRATO

> Variables del contrato maestro entre Lender y Borrower (Parties, Dates, Rates, Covenants).

### Lender
- **Definición**: Es la entidad que prestará el dinero al Borrower siguiendo los estatutos demarcados en el Deal.  También llamado Financing Partner o acreedor
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Borrower
- **Definición**: Es la entidad que recibirá el dinero y que quedará en deuda con el Lender.  También llamado Deal Partner u originador
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Trust
- **Definición**: También llamado Fideicomiso, o special purpose vehicle (SPV)
En el Deal, habrá constantemente movimientos de dinero de ambas partes, sin embargo, estas dos partes jamás harán movimientos directamente, por razones de proceso y ley crearán una figura llamada Fideicomiso. Esta figura estará administrada por otra entidad, generalmente bancaria, que servirá de mediador entre ambas partes. El Fideicomiso recibe los activos por parte del Borrower y el cash por parte del Lender y le da el dinero al borrower mientras el se encarga de ir recibiendo las obligaciones antes otorgadas por el borrower.
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Trustee
- **Definición**: También llamado Fiducia o Fiduciaria.
Es la entidad que estará encargada de administrar los recursos del Trust, generalmente es un banco que presta este servicio y durante el transcurso del Deal cobrará por ser el ente administrador. El Trustee existe para una mayor transparencia y legalidad de todo el Deal entre ambas partes.
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### SOFOM
- **Definición**: Es un tipo de sociedad contemplada en la legislación mexicana cuyo objetivo principal es el otorgamiento de crédito. Pueden ser entidades reguladas (ER) o no reguladas (ENR). También existen las Sociedad Financiera de Objeto Limitado (Sofol). Es de alguna manera coloquial la figura de Fideicomiso en Mexico.
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Master Trust
- **Definición**: Cuenta recaudadora de los pagos de cada cliente individual del borrower
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Master Trust Trustee
- **Definición**: Responsable por asignar los recaudos de pagos individuales del borrower a los Trusts de cada Debt Facility
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Funder (1, 2, ..., N)
- **Definición**: Entidad/Sociedad que fondea el dinero en cada Debt Facility
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Closing Date
- **Definición**: Fecha de firma de contrato e inicio de operación
- **Fuente**: Loan Agreement
- **Tipo de dato**: LocalDate

### End of Draw date
- **Definición**: Fecha límite para solicitar advances
- **Fuente**: Loan Agreement
- **Tipo de dato**: LocalDate

### End of Availability Date
- **Definición**: Fecha límite para comenzar amortización
- **Fuente**: Loan Agreement
- **Tipo de dato**: LocalDate

### Maturity Date
- **Definición**: Fecha fin del contrato
- **Fuente**: Loan Agreement
- **Tipo de dato**: LocalDate

### Due Date
- **Definición**: Fecha de finalización del tranche
- **Fuente**: Loan Agreement
- **Tipo de dato**: LocalDate

### Start Date
- **Definición**: Fecha en la que se inició la reconciliación - fecha de upload del loan tape
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate

### Last Reconciliation Event
- **Definición**: Fecha de la reconciliación anterior
- **Fuente**: Calculado
- **Tipo de dato**: LocalDate

### Payment Date
- **Definición**: La fecha en la que se realizan los pagos asociados a la operación de un debt facility
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate

### Disbursement Date
- **Definición**: La fecha en la que se realiza un desembolso / net advance
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate

### Proposed date for Disbursement
- **Definición**: Fecha propuesta de desembolso por parte del borrower.  Suele estar asociado a reglas específicas (ej: entre N y X días)
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate

### Total Commitment Amount
- **Definición**: Total del dinero del facility - totalidad de la línea de crédito
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Available Amount
- **Definición**: Total disponible (total del dinero del facility - net advances ya solicitados)
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Current Available Amount
- **Definición**: "Available Amount / Current Available Amount"
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Min Net Advance
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Max Net Advance
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Net Advance Frequency
- **Fuente**: Loan Agreement
- **Tipo de dato**: Long

### Min Cash Release
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Max Cash Release
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Cash Release Frequency
- **Fuente**: Loan Agreement
- **Tipo de dato**: Long

### Interest Type
- **Definición**: Estrategia de interés: Si se trata de una tasa de interés flotante o fija
- **Fuente**: Loan Agreement
- **Tipo de dato**: String

### Applicable Margin
- **Definición**: Porción de tasa de interés fija
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Reference Rate
- **Definición**: Nombre de la tasa, fuente de donde obtenerala, fecha de qué día usar
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Spread
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Upper Bound
- **Fuente**: Loan Agreement
- **Tipo de dato**: Bigdecimal

### Interest Formula
- **Fuente**: Loan Agreement

### Interest Projection necesity
- **Definición**: Cálular hasta fin del período
- **Fuente**: Loan Agreement

### Collections Account Balance
- **Definición**: Es la cuenta donde se acreditan los pagos de los usuarios finales del originador (los clientes de nuestros borrowers) por el master trustee una vez que ellos hayan sido primero depositados en el Master Trust Account, e identificados como pertenecientes al trust particular en cuestión. También es la cuenta donde si hubiera BB deficiency, y el borrower quisiera curarlo con cash, pueda depositarlo. De esta cuenta también salen los pagos que tengan que hacerse por conceptos de fees, expenses, etc.
- **Fuente**: Input: usuario front / Datanomik
- **Tipo de dato**: Bigdecimal

### Reserve Account Balance
- **Definición**: Es la cuenta donde, en algunos casos y bajo ciertas circunstancias, se debe dejar una reserva (transfiriendo según corresponda desde el collections account o bien en caso que fuera necesario, del credit account via un net advance si es que no se tiene cash suficiente pero igual el BB es superavitario)
- **Fuente**: Input: usuario front / Datanomik
- **Tipo de dato**: Bigdecimal

### Margin Account Balance
- **Definición**: Es la cuenta donde, en algunos casos y bajo ciertas circunstancias, se debe dejar un margen de liquidez y de reserva por la operación de derivados.
- **Fuente**: Input: usuario front / Datanomik
- **Tipo de dato**: Bigdecimal

### Credit Account Balance
- **Definición**: Es la cuenta del trust donde el lender deposita los advances requeridos.
- **Fuente**: Input: usuario front / Datanomik
- **Tipo de dato**: Bigdecimal

### Disbursement Account Balance
- **Fuente**: Input: usuario front / Datanomik
- **Tipo de dato**: Bigdecimal

### Master Trust Account Balance
- **Definición**: Es la cuenta donde los usuarios finales del originador (los clientes de nuestros borrowers) pagan sus cuotas. Aquí se acumulan esos pagos y después de x tiempo (por ejemplo una periodicidad semanal) se distribuyen más específicamente por el master trustee al Collections Account de cada trust particular que cuelga debajo de este Master Trust Account.
- **Fuente**: Input: usuario front / Datanomik
- **Tipo de dato**: Bigdecimal

### N Account Balance
- **Definición**: Cualquier otra cuenta que pueda exisitr.. debería poder configurarse
- **Fuente**: Input: usuario front / Datanomik
- **Tipo de dato**: Bigdecimal

### Trust Expenses Reserve
- **Fuente**: Input: usuario front / Cálculo
- **Tipo de dato**: Bigdecimal

### Servicing Costs Reserve
- **Fuente**: Input: usuario front / Cálculo
- **Tipo de dato**: Bigdecimal

### Undrawn Fee Reserve
- **Fuente**: Input: usuario front / Cálculo
- **Tipo de dato**: Bigdecimal

### Minimum Utilization Fee
- **Fuente**: Input: usuario front / Cálculo
- **Tipo de dato**: Bigdecimal

### Interests Reserve
- **Fuente**: Input: usuario front / Cálculo
- **Tipo de dato**: Bigdecimal

### Withholding Tax Reserve
- **Fuente**: Input: usuario front / Cálculo
- **Tipo de dato**: Bigdecimal

### Figarantías Reserve
- **Fuente**: Input: usuario front / Cálculo
- **Tipo de dato**: Bigdecimal

### Other Expense Reserves
- **Fuente**: Input: usuario front
- **Tipo de dato**: Bigdecimal

### N Expense Reserve
- **Definición**: Cualquier otra expense que exista.. debería poder configurarse
- **Fuente**: Input: usuario front
- **Tipo de dato**: Bigdecimal

### Raw Collateral Balance
- **Definición**: Raw OPB sum of all loans/receivables included in the loan tape (no adjustments made) (taking the loan tape as a whole at book value)
- **Fuente**: Calculado

### Prefilters (1, 2, ..., N)
- **Definición**: Necessary filters/validations that are not Elegiblity Criteria per se
- **Fuente**: Calculado

### Validations (1, 2, ..., N)
- **Definición**: Necessary filters/validations that are not Elegiblity Criteria per se
- **Fuente**: Calculado

### Total Collateral Balance
- **Definición**: Raw Collateral Balance net of Prefilters (validations) | Raw - prefiltros - validaciones
- **Fuente**: Calculado

### Discounts (1, 2, ..., N)
- **Definición**: MDF, Affiliate fee, etc - not risk multipiers nor adv. rates. Varía por deal.
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal

### Adjusted Collateral Balance
- **Definición**: Total Collateral Balance adjusted by discounts (e.g. MDF, Affiliate fee, etc - not risk multipiers nor adv. rates)
- **Fuente**: Calculado

### Ineligibles
- **Definición**: Ineligible loans/receivables within Adjusted Collateral Balance - suma de todos los contratos inelegibles neto de overlaps
- **Fuente**: Calculado

### EligibilityCriteria (1,2,...,N)
- **Definición**: Individual EC that will result in filtering of the loan tape
- **Fuente**: Loan Agreement

### Eligible Collateral Balance
- **Definición**: Adjusted Collateral Balance net of Ineligible Collateral Balance
- **Fuente**: Calculado
- **Equivalente backend**: `elegible_copb / #ECB en BB template / #ECB_BLA en documentos`

### Excess Suboptimal amount
- **Definición**: Amounts within Eligible Collateral Balance that result in suboptimal collateral balance
- **Fuente**: Calculado

### Concentration limit with inclusion factor = 0 1
- **Fuente**: Calculado

### Concentration limit with inclusion factor = 0 N
- **Fuente**: Calculado

### Optimized Collateral Balance applying inclusion factor
- **Definición**: Eligible Collateral Balance net of Excess Suboptimal Amount by inclusion factor
- **Fuente**: Calculado

### Excess Concentration Amount
- **Definición**: Amounts within Eligible and Optimized Collateral Balance that exceed concentration limits applying utilization factor
- **Fuente**: Calculado

### Concentration Limit with Utilization Factor <1 1
- **Fuente**: Calculado

### Concentration Limit with Utilization Factor <1 N
- **Fuente**: Calculado

### Net Collateral Balance
- **Definición**: Eligible and Optimized Collateral Balance net of Excess Concentration and Suboptimal Amount by inclusion factor and utilization factor
- **Fuente**: Calculado

### Excess Delinquency Amount
- **Definición**: Amounts within Net Collateral Balance that exceed delinquency thresholds [SUMPRODUCT (Net Collateral Balance; 1- Risk Multipliers)] . Post Concentration Limits
- **Fuente**: Calculado

### Delinquency-Adjusted Net Collateral Balance
- **Definición**: Net Collateral Balance net of Excess Delinquency Amount
- **Fuente**: Calculado

### Haircut
- **Definición**: variable en jupyter que agrupa el monto descontado por aplicación de advance rate
- **Fuente**: Calculado

### Collateral Borrowing Base Amount
- **Definición**: SUMPRODUCT (Delinquency-Adjusted Net Collateral Balance; Advance Rates)
- **Fuente**: Calculado

### Cash Borrowing Base Amount
- **Definición**: Cash available for BB - Cash that is unequivocally included within the Borrowing Base calculation
- **Fuente**: Calculado

### Borrowing Base
- **Definición**: Collateral Borrowing Base Amount + Cash Borrowing Base Amount + **if applicable** --> Unrealized FX gains/(losses) + Hedging Costs + Unrealized FX Execution gains/(losses)
- **Fuente**: Calculado

### Unrealized FX gains/(losses) --> Forward
- **Definición**: advance 1 * (FXhoy - spot1) + ... + advance n * (fxhoy - spotn)
- **Fuente**: Calculado

### Unrealized gains - Forward
- **Fuente**: Calculado

### Unrealized losses - Forward
- **Fuente**: Calculado

### FX Rate
- **Definición**: cuál es la tasa de tipo de cambio a tomar
- **Fuente**: Scrapping / Integración

### Hedging Costs - Forward
- **Definición**: advance 1 * (spot1 - fwd1) * días desde advance 1 / días totales del hedge advance 1 + ….+ advance n * (spotn - fwdn) * días desde advance n / días totales del hedge advance n
- **Fuente**: Calculado

### Valuation component - Forward
- **Definición**: Efecto por valoración que tiene un derivado : derivative MtM - unrealized - hedging cost
- **Fuente**: Calculado

### FX execution gains/(losses)
- **Definición**: advance 1 * (settlement spot - rollover spot) + ...
- **Fuente**: Calculado

### Outstanding Principal Balance
- **Definición**: Sum(net advance requested) in lender currency
- **Fuente**: Calculado

### Total Availability (BB Deficency)
- **Definición**: Borrowing Base/Today's FX Rate - Outstanding Principal Balance (result in lender currency)
- **Fuente**: Calculado

### Advance Availability (Cash on Hold)
- **Definición**: Collateral Borrowing Base Amount + Hedging Costs - OPB x Today's FX Rate (result in local currency)
- **Fuente**: Calculado

### Max Immediate Cash Release Available
- **Definición**: IF Factoraje (min(total availability, new collateral borrowing base amount, cash borrowing base amount) ; min(total availability, cash borrowing base amount))
- **Fuente**: Calculado

### Max Cash Release Available in N
- **Definición**: IF Factoraje (min(total availability, cash borrowing base amount) - if(max immediate cash release > 0); max immediate cash release, 0))
- **Fuente**: Calculado

### Max Net Advance
- **Definición**: total availability - if(max immediate cash release > 0); max immediate cash release, 0)) - if(max cash release in N >0); max cash release in N, 0))
- **Fuente**: Calculado

### Immediate Cash Release Requested
- **Definición**: Immediate Cash Release requested by borrower
- **Fuente**: Input: usuario front

### Cash Release Available in N Requested
- **Definición**: Cash Release in N requested by borrower
- **Fuente**: Input: usuario front

### Net Advance Requested
- **Definición**: Net Advance requested by borrower
- **Fuente**: Input: usuario front

### FX Hedge position Maturity Date
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate

### FX Hedge position spot rate
- **Fuente**: Input: TRM

### FX hedge position disbursement spot rate
- **Fuente**: Input: usuario front

### FX hedge position forward rate
- **Fuente**: Input: usuario front

### Unrealized gains (losses)
- **Fuente**: Calculado

### Hedging Costs
- **Fuente**: Calculado

### Annualized hedging costs - Active Positions
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal

### Estimated gains (losses)  - Active Positions
- **Definición**: Approximate settlement amount if the hedge were matured today
- **Fuente**: Calculado

### #{BORROWING_BASE_DEFICIENCY}
- **Definición**: Valor = 0 en caso de no tener deficiency, o positivo en caso de tener deficiency
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{BORROWING_BASE_IN_LOCAL_CURRENCY}
- **Definición**: Resultado del BB en borrower operation currency
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{CASH_TRUST}
- **Definición**: es lo que ingresa en borrower en la pantalla de additional info en la primera línea,
no incluye ningun descuento.  Completado por el borrower o, en su defecto, datanomik.
- **Fuente**: Input: usuario front / Datanomik

### #{HEDGING_COST}
- **Definición**: Hedging costs asociados a todos los forwards negociados hasta el momento contra la TRM del reconciliation date
- **Fuente**: Calculado

### #{UNREALIZED_GAIN}
- **Definición**: Resultados positivos, sumatoria de todos los unrealized gains
- **Fuente**: Calculado

### #{UNREALIZED_LOSSES}
- **Definición**: Resultados negativos, sumatoria de todos los unrealized losses
- **Fuente**: Calculado

### #{UNREALIZED_GAINS_AND_LOSSES}
- **Definición**: Resultado de NETO: Unrealized gain/loss en base al OPB y hedges
- **Fuente**: Calculado

### #{HEDGING_COST_AND_UNREALIZED_LOSSES}
- **Definición**: Sumatoria de Hedging costs y todos los unrealized losses
- **Fuente**: Calculado

### #{TOTAL_AVAILABLE_FUNDS}
- **Definición**: Igual a cash_trust Validar con finanzas que es el cash trust --> OK
- **Fuente**: Calculado

### #{TOTAL_COPB_WITH_ADVANCE_RATE}
- **Definición**: Según nuestro glosario, es el "Collateral Borrowing Base Amount"
- **Fuente**: Calculado

### #{SERVICING_COST}
- **Definición**: Fee por gestión del loan agreement, addi se cobra este fee por la gestión de la cartera y cobros. Es un % del outstanding balance del loan. Se paga según resultado de waterfall, una vez al mes (ordenamiento de expenses).
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{SERVICING_COST_WITHOUT_VAT}
- **Definición**: SERVICING COST / 19%. Se muestra junto con el servicing cost.
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{SERVICING_COST_DATE_ENGLISH}
- **Definición**: Fecha propuesta para realizar la transferencia, formato MM/DD/YYYY
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate
- **Equivalente backend**: `No fue creada`

### #{SERVICING_COST_DATE_SPANISH}
- **Definición**: Fecha propuesta para realizar la transferencia, formato MM/DD/YYYY
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate
- **Equivalente backend**: `No fue creada`

### #{TRUST_EXPENSES}
- **Definición**: Fee que se le paga al trustee o fiduciario. Fee fijo o %, depende el caso. Se reserva pero no requiere transfer instruction porque lo descuenta directamente la cuenta del fideicomiso.
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{TRUST_EXPENSES_DATE_ENGLISH}
- **Definición**: Fecha propuesta para realizar la transferencia, formato MM/DD/YYYY
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate
- **Equivalente backend**: `No fue creada`

### #{TRUST_EXPENSES_DATE_ENGLISH}
- **Definición**: Fecha propuesta para realizar la transferencia, formato MM/DD/YYYY
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate
- **Equivalente backend**: `No fue creada`

### #{FIGARANTIAS}
- **Fuente**: Calculado
- **Equivalente backend**: `Ver con tech`

### #{WITHHOLDING_TAX}
- **Definición**: Tax sobre intereses cuando el lender es extranjero, calculado y pagado por el borrower (fideicomiso). Gestión a cargo del fiduciario como persona jurídica. No va a transfer instructions pero hay que profundizar. Se paga de acuerdo al calendario tributario.
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{INTEREST_EXPENSE}
- **Definición**: Pago de intereses por OPB de parte del borrower al lender. Va a la transfer instructions, se paga con el cash trust y requiere de input fecha.
- **Fuente**: Input: usuario front
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{INTEREST_EXPENSE_DATE_ENGLISH}
- **Definición**: Fecha propuesta para el pago de intereses por OPB de parte del borrower al lender. Va a la transfer instructions. Formato MM/DD/YYYY
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate
- **Equivalente backend**: `INTEREST_EXPENSE_DATE_ENGLISH`

### #{INTEREST_EXPENSE_DATE_SPANISH}
- **Definición**: Pago de intereses por OPB de parte del borrower al lender. Va a la transfer instructions, se paga con el cash trust y requiere de input fecha.
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate
- **Equivalente backend**: `INTEREST_EXPENSE_DATE_SPANISH`

### #{INTEREST_UNUSED_EXPENSES}
- **Definición**: Es la suma de unused fee e interest expense, forma parte de las instrucciones de transferencia. El receptor es el mismo y se paga la mismo tiempo siempre y cuando sea hacia la misma entidad (ej. un architect).
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `Ver con tech`

### #{INTEREST_UNUSED_EXPENSES_DATE_SPANISH}
- **Definición**: Fecha propuesta de pago/desembolso de unused expenses por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha LATAM
- **Fuente**: Input
- **Equivalente backend**: `INTEREST_UNUSED_EXPENSES_DATE_SPANISH`

### #{UNUSED_FEE}
- **Definición**: Fee por no desembolsar el 100% del commitment. Borrower paga al Lender, requiere instrucción de transferencia.
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal

### #{LAST_MONTH_INTEREST}
- **Fuente**: Calculado

### #{UPFRONT_FEE}
- **Definición**: These are fees paid by the borrower to the lender at the beginning of the loan for administrative costs or other expenses. If the loan is not drawn down in full, some of the upfront fee may be considered unused.
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal

### #{FORWARD_CONTRACTS_SETTLEMENT_EXPENSE}
- **Fuente**: Calculado

### #{OTHER}
- **Definición**: No requiere instrucción de transferencia? Cómo se debería acomodar el template en estos casos?
- **Fuente**: Calculado

### #{LENDER_EXPENSES}
- **Definición**: Suma de todos los intereses y fees a incluir en instrucción de transferencia. Suma los inputs en front end (cash availability): 
- Interest Expense
- Unused Fee
- Minimum Utilization Fee

Del deal de Clara GS
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `CREAR PARA CLARA (más detalles en definición)`

### #{LENDER_EXPENSES_TEXT}
- **Definición**: LENDER EXPENSES escrito en texto español
- **Fuente**: Calculado
- **Tipo de dato**: String
- **Equivalente backend**: `CREAR PARA CLARA (más detalles en definición)`

### #{LENDER_EXPENSES_DATE_SPANISH}
- **Definición**: Fecha de transferencia propuesta para transfer instructions. Formato español.
- **Fuente**: Calculado
- **Tipo de dato**: String
- **Equivalente backend**: `LENDER_EXPENSES_DATE_SPANISH`

### #{CASH_RELEASE}
- **Definición**: Monto resultante de cash release posterior al cálculo del BB y solicitud de cash release por parte del borrower. Borrower Operation Currency.
- **Fuente**: Input
- **Tipo de dato**: Bigdecimal

### #{CASH_RELEASE_AS_TEXT_SPANISH}
- **Definición**: Monto resultante de cash release posterior al cálculo del BB y solicitud de cash release por parte del borrower. Borrower Operation Currency.
- **Fuente**: Input
- **Tipo de dato**: String
- **Equivalente backend**: `CREAR PARA CLARA (más detalles en definición)`

### #{NET_ADVANCE_AS_TEXT_ENGLISH}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency y escrito en palabras en inglés
- **Fuente**: Calculado
- **Equivalente backend**: `reconciliation.advance.local_amount`

### #{NET_ADVANCE_AS_TEXT_SPANISH}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency y escrito en palabras en español
- **Fuente**: Calculado
- **Equivalente backend**: `reconciliation.advance.local_amount`

### #{NET_ADVANCE_CASH_RELEASE_AMOUNT}
- **Definición**: Monto resultante de cash release + net advance posterior al cálculo del BB y solicitud de cash release y net advance por parte del borrower.  Borrower Operation Currency
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `reconciliation.advance.local_amount`

### #{NET_ADVANCE_CASH_RELEASE_NET_TEXTO}
- **Definición**: Release de cash en concepto de net advance, cash, neto de reservas por concepto de aumento OPB. Texto en español.
- **Fuente**: Calculado
- **Tipo de dato**: String

### #{NET_ADVANCE}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower.  Borrower Operation Currency
- **Fuente**: Input manual
- **Tipo de dato**: Bigdecimal

### #{NEW_OPB}
- **Definición**: variables.put(TemplateVariables.NEW_OPB, ""); DEBERÍA SER EL VALOR DEL NUEVO COLATERAL CEDIDO - es x advance rate o no? - Hablé con Fefo y es el RAW Collateral
- **Fuente**: Calculado

### #{OUTSTANDING_UPB_OF_ALL_LOANS_IN_LOCAL_CURRENCY}
- **Definición**: OPB en collateral currency sin contar el net advance en curso
- **Fuente**: Calculado

### #{NET_ADVANCE_DATE_ENGLISH}
- **Definición**: Fecha de generación del documento --> cuando paso a la pantalla de documentos.  no tiene que ver con la de descarga MM/DD/YYYY
- **Fuente**: Calculado

### #{NET_ADVANCE_DATE_SPANISH}
- **Definición**: Fecha de generación del documento --> cuando paso a la pantalla de documentos.  no tiene que ver con la de descarga DD/MM/YYYY
- **Fuente**: Calculado

### #{PROPOSED_DATE_FOR_DISBURSEMENT_ENGLISH}
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha USA.
- **Fuente**: Calculado

### #{PROPOSED_DATE_FOR_DISBURSEMENT_SPANISH}
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha LATAM
- **Fuente**: Calculado

### #{PROPOSED_DATE_FOR_NA_DISBURSEMENT_ENGLISH}
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha USA MM/DD/YYYY
- **Fuente**: Input del usuario
- **Tipo de dato**: String

### #{PROPOSED_DATE_FOR_NA_DISBURSEMENT_SPANISH}
- **Definición**: Fecha propuesta de pago/desembolso por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha DD/MM/YYYY
- **Fuente**: Input del usuario
- **Tipo de dato**: String

### #{PROPOSED_DATE_FOR_NA_DISBURSEMENT}
- **Definición**: Fecha propuesta de pago/desembolso de net advance unicamente. Formato mes en palabras/dia/año
ejemplo: february 28, 2023
- **Fuente**: Input del usuario
- **Tipo de dato**: String
- **Equivalente backend**: `TBD FIRMA`

### #{RECONCILIATION_DATE_ENGLISH}
- **Definición**: MMMM, d, YYYY - MMMM = month in words - creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement (mes/día/año)
- **Fuente**: Calculado
- **Tipo de dato**: String
- **Equivalente backend**: `fecha de reco que elige el usuario?`

### #{RECONCILIATION_DATE_SPANISH}
- **Definición**: d 'de' MMMM YYYY creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement
- **Fuente**: Calculado
- **Tipo de dato**: String
- **Equivalente backend**: `fecha de reco que elige el usuario?`

### #{RECONCILIATION_DATE}
- **Definición**: MM/DD/YYYY - creation date de la reconciliación --> asociado al upload del loan tape asociado a loan agreement / no necesariamente es la misma fecha la de upload del lt que la fecha de reco.
- **Fuente**: Calculado
- **Tipo de dato**: LocalDate
- **Equivalente backend**: `fecha de reco que elige el usuario?`

### #{SERVICING_COST_DATE_SPANISH}
- **Definición**: Fecha propuesta de pago/desembolso de servicing costs sin iva por parte del Lender al Fideicomiso o Borrower.  Formato de Fecha USA
- **Fuente**: Input
- **Equivalente backend**: `SERVICING_COST_DATE_SPANISH`

### #{ADMINISTRATOR_EXPENSE_INGRESOS}
- **Definición**: Pago en concepto de servicios por administrador a CxC. El input que alimenta este placeholder es:
- Fee payable from cuenta de ingresos
- **Fuente**: Input
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `CREAR PARA CLARA (más detalles en definición)`

### #{ADMINISTRATOR_EXPENSE_INGRESOS_TEXTO_MX}
- **Definición**: Pago en concepto de servicios por administrador a CxC. El input que alimenta este placeholder es:
- Fee payable from cuenta de ingresos
Escrito en texto en español. Agregar al final "pesos mexicanos M.N. XX/100" siendo XX los decimales / centavos.
- **Fuente**: Calculado
- **Tipo de dato**: String
- **Equivalente backend**: `CREAR PARA CLARA (más detalles en definición)`

### #{ADMINISTRATOR_EXPENSE_COBRANZA}
- **Definición**: Pago en concepto de servicios por administrador a CxC. El input que alimenta este placeholder es:
- Fee payable from cuenta cobranza
Escrito en texto en español. Agregar al final "pesos mexicanos M.N. XX/100" siendo XX los decimales / centavos.
- **Fuente**: Input
- **Tipo de dato**: Bigdecimal
- **Equivalente backend**: `CREAR PARA CLARA (más detalles en definición)`

### #{ADMINISTRATOR_EXPENSE_COBRANZA_TEXTO_MX}
- **Definición**: Pago en concepto de servicios por administrador a CxC. Escrito en texto en español.
- **Fuente**: Calculado
- **Tipo de dato**: String
- **Equivalente backend**: `CREAR PARA CLARA (más detalles en definición)`

### #{NET_ADVANCE_CASH_RELEASE_DATE_ENGLISH}
- **Definición**: Ex proposed date for disbursement. Nuevo input.
- **Fuente**: Input
- **Tipo de dato**: String

### #{NET_ADVANCE_CASH_RELEASE_DATE_SPANISH}
- **Definición**: Ex proposed date for disbursement. Nuevo input.
- **Fuente**: Input
- **Tipo de dato**: String

### #{TRANSFER_INSTRUCTION_DATE_ENGLISH}
- **Definición**: Fecha de transferencia propuesta para transfer instructions. Formato USA.
- **Fuente**: Input

### #{ADVANCE_RATE_CLIENT_FPI( "advance_rate_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_CLIENT_FPL("advance_rate_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_PROSPECT_FPI("advance_rate_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{ADVANCE_RATE_PROSPECT_NO_PAYMENT("advance_rate_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_CLIENT_FPI("total_eligible_gross_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_CLIENT_FPL("total_eligible_gross_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_PROSPECT_FPI("total_eligible_gross_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_PROSPECT_NO_PAYMENT("total_eligible_gross_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_GROSS_SUM("total_eligible_gross_prospect_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_CLIENT_FPI("total_eligible_net_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_CLIENT_FPL("total_eligible_net_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_PROSPECT_FPI("total_eligible_net_prospect_fpi"}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_PROSPECT_NO_PAYMENT("total_eligible_net_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_ELIGIBLE_NET_SUM("total_eligible_net_client_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_CLIENT_FPI("total_excluded_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_CLIENT_FPL("total_excluded_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_PROSPECT_FPI("total_excluded_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_PROSPECT_NO_PAYMENT("total_excluded_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_EXCLUDED_SUM("total_excluded_client_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_CLIENT_FPI("total_unpaid_principal_client_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_CLIENT_FPL("total_unpaid_principal_client_fpl")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_PROSPECT_FPI("total_unpaid_principal_prospect_fpi")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_PROSPECT_NO_PAYMENT("total_unpaid_principal_prospect_no_payment")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TOTAL_UNPAID_PRINCIPAL_SUM("total_unpaid_principal_sum")}
- **Definición**: Variables Intermedias - Cálculo Addi-Architect
- **Fuente**: Calculado

### #{TRANCHE_1_NET_COLLATERAL_BALANCE_LC}
- **Definición**: Suma de los montos de capital (Principal) pendientes de pago en los loans financiados con el 1er tramo del Facility
- **Fuente**: Calculado

### #{TRANCHE_2_NET_COLLATERAL_BALANCE_LC}
- **Definición**: Suma de los montos de capital (Principal) pendientes de pago en los loans financiados con el 2do tramo del Facility
- **Fuente**: Calculado

### #{FX_RATE_RECONCILIATION_DATE}
- **Definición**: Tasa de cambio oficial a la fecha del BB Reconciliation
- **Fuente**: Calculado

### #{OUTSTANDING_UPB_OF_ALL_LOANS_IN_USD}
- **Definición**: Suma de los Net Advances realizados hasta la fecha (en USD)
- **Fuente**: Calculado

### #{NET_ADVANCE_USD}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower en USD
- **Fuente**: Calculado

### #{NET_ADVANCE_USD_AS_TEXT_ENGLISH}
- **Definición**: Monto resultante de net advance posterior al cálculo del BB y solicitud de advance por parte del borrower en USD y escrito en palabras en inglés
- **Fuente**: Calculado

### #{OPB_AND_NET_ADVANCE_USD}
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD)
- **Fuente**: Calculado

### #{OPB_AND_NET_ADVANCE_USD_AS_TEXT_ENGLISH}
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD) y escrito en palabras en inglés
- **Fuente**: Calculado

### #{NEW_TOTAL_OPB_AS_TEXT_SPANISH}
- **Definición**: Suma de los Net Advances realizados hasta la fecha, incluyendo el Net Advance solicitado (en USD) y escrito en palabras en español
- **Fuente**: Calculado

### #{MATURITY_DATE_ENGLISH}
- **Definición**: Fecha de vencimiento del Facility (MMMM, d, YYYY - MMMM = month in words)
- **Fuente**: Calculado

### #{MATURITY_DATE_SPANISH}
- **Definición**: Fecha de vencimiento del Facility ("d 'de' MMMM YYYY" = mes en palabras)
- **Fuente**: Calculado

### FX Hedge position Maturity Date
- **Fuente**: Input: usuario front
- **Tipo de dato**: LocalDate

### FX Hedge position spot rate
- **Fuente**: Input: TRM

### FX hedge position disbursement spot rate
- **Fuente**: Input: usuario front

### FX hedge position forward rate
- **Fuente**: Input: usuario front

### Unrealized gains (losses)
- **Fuente**: Calculado

### Hedging Costs
- **Fuente**: Calculado

### Annualized hedging costs - Active Positions
- **Fuente**: Calculado
- **Tipo de dato**: Bigdecimal

### Estimated gains (losses)  - Active Positions
- **Definición**: Approximate settlement amount if the hedge were matured today
- **Fuente**: Calculado

