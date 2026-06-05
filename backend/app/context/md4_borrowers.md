# MD4 — Catálogo de Borrowers VAAS

> Fuente de verdad para identificar borrowers en queries. Crítico: cada tabla usa un identificador diferente.

---

## REGLA DE BÚSQUEDA POR TABLA

| Tabla | Campo a usar | Tipo |
|---|---|---|
| `payments` | `borrower_code` | string |
| `borrower_db_payments` | `borrower_code` | string |
| `funds_transfers` | `borrower_code` | string |
| `disbursements` | `borrower_code` | string |
| `disbursements_payments` | `borrower_code` | string |
| `conciliations` | `company_code` | string |
| `process_execution` | `borrower_code` | string |
| `payment_tape` | `company_id` | **entero** |

⚠️ **`payment_tape` usa `company_id` (entero).** Siempre resolver con JOIN:

```sql
FROM payment_tape pt
JOIN company_db.company c ON pt.company_id = c.id
WHERE c.code = 'FINKARGO_COLOMBIA'
-- Nunca hardcodear el ID numérico
```

---

## CATÁLOGO COMPLETO (172 borrowers activos)

| ID | Name | Code |
|---|---|---|
| 1 | Addi | `ADDI` |
| 2 | Goldman Sachs | `GOLDMAN_SACHS` |
| 5 | Adelantos | `PAYJOY` |
| 6 | Architect | `ARCHITECT` |
| 14 | Rapicredit | `RAPICREDIT` |
| 18 | CIM | `CIM` |
| 26 | Plataform | `PLATAFORM` |
| 27 | BIA | `BIA` |
| 29 | BBVA | `BBVA` |
| 31 | Crediorbe | `CREDIORBE` |
| 32 | Somos Internet | `SOMOS` |
| 33 | Welli | `WELLI` |
| 34 | First Principles Fund LP | `FPF` |
| 39 | Wimo | `WIMO` |
| 44 | Go-Bravo | `GOBRAVO` |
| 47 | BIA Energy | `BIA-deprecated` |
| 55 | Kippon | `KIPPON` |
| 56 | Cesion bnk | `CESIONBNK` |
| 63 | VPC | `VPC` |
| 65 | Credi7 | `CREDI7` |
| 67 | FinMaq | `FINMAQ` |
| 71 | DeltaCredit | `DELTACREDIT` |
| 72 | Bancolombia | `BANCOLOMBIA` |
| 73 | Coltefinanciera | `COLTEFINANCIERA` |
| 76 | Patrimonio Autónomo CREDICORP Fiduciaria SA | `PA_CREDICORP` |
| 77 | Patrimonio Autónomo Consumo CIM | `PA_CONSUMO_CIM` |
| 78 | Patrimonio Autónomo Microcrédito CIM | `PA_MICROCREDITO_CIM` |
| 79 | Patrimonio Autónomo Especial Davivienda | `PA_ESPECIAL_DAVIVIENDA` |
| 80 | Patrimonio Autónomo Especial Davivienda - Microcrédito | `PA_ESPECIAL_DAVIVIENDA_MICROCREDITO` |
| 81 | Patrimonio Autónomo Especial Bogotá | `PA_ESPECIAL_BOGOTA` |
| 82 | Patrimonio Autónomo Especial Bogotá - Microcrédito | `PA_ESPECIAL_BOGOTA_MICROCREDITO` |
| 83 | Patrimonio Autónomo Especial Dann Regional | `PA_ESPECIAL_DANN_REGIONAL` |
| 84 | Patrimonio Autónomo Especial Dann Regional - Microcrédito | `PA_ESPECIAL_DANN_REGIONAL_MICROCREDITO` |
| 85 | HayCash | `HAYCASH` |
| 86 | Sistecredito | `SISTECREDITO` |
| 96 | Liquitech | `LIQUITECH` |
| 110 | PAYJOY ASSET HOLDINGS LP | `PAYJOY_ASSET_FUND_HOLDINGS` |
| 114 | SURA FICs | `SURA` |
| 121 | Interactuar | `INTERACTUAR` |
| 122 | Fundacion Bancolombia | `FUNDACION_BANCOLOMBIA` |
| 126 | Fundación Bcolombia | `FUNDACIN_BCOLOMBIA` |
| 127 | IFC | `IFC` |
| 128 | Facturas y Negocios | `FACTURAS_Y_NEGOCIOS` |
| 129 | Inklusiva | `INKLUSIVA` |
| 131 | Nera Capital | `NERA_CAPITAL` |
| 132 | Hilco_Credix | `HILCO_CREDIX` |
| 133 | Funder´s App | `FUNDERS_APP` |
| 136 | Funder App | `FUNDER_APP` |
| 138 | FA (Funders App) | `FA_FUNDERS_APP` |
| 139 | FA_Percent | `FA_PERCENT` |
| 140 | Citibank Colombia S.A. | `CITI` |
| 141 | Lender_Credix_Hilco | `LENDER_CREDIX_HILCO` |
| 142 | Hilco_Nissan | `HILCO_NISSAN` |
| 143 | JPM_Hilco | `JPM_HILCO` |
| 145 | Banco Coomeva 2 | `BANCO_COOMEVA_2` |
| 146 | Banco Davivienda | `BANCO_DAVIVIENDA` |
| 148 | BANCOLDEX | `BANCOLDEX` |
| 149 | Hilco_Vanrenta | `HILCO_VANRENTA` |
| 150 | Lender_Vanrenta_Hilco | `LENDER_VANRENTA_HILCO` |
| 151 | Niko | `NIKO` |
| 152 | J.P. Morgan Hilco | `JP_MORGAN_HILCO` |
| 153 | BANCO SANTANDER | `BANCO_SANTANDER` |
| 154 | Addi BNPN | `ADDI_BNPN` |
| 155 | KREDIT | `KREDIT` |
| 156 | J.P. Morgan | `JP_MORGAN` |
| 158 | SURA FICS 2 | `FICS_2` |
| 159 | SURA FICS 3 | `FICS_3` |
| 160 | Vemo | `VEMO` |
| 161 | BEEL | `BEEL` |
| 162 | Prueba 1  | `PRUEBA_1` |
| 163 | Apex | `APEX` |
| 164 | Alloy | `ALLOY` |
| 165 | Exitus | `EXITUS` |
| 166 | EXITUS BURSA | `EXITUS_BURSA` |
| 167 | Hilco_Engen | `HILCO_ENGEN` |
| 168 | Hilco_OCN | `HILCO_OCN` |
| 169 | Hilco_Hifin | `HILCO_HIFIN` |
| 170 | Lender_Hifin_Hilco | `LENDER_HIFIN_HILCO` |
| 171 | Lender_OCN_Hilco | `LENDER_OCN_HILCO` |
| 172 | Lender_Engen_Hilco | `LENDER_ENGEN_HILCO` |
| 174 | Hilco_Capem | `HILCO_CAPEM` |
| 175 | Hilco_CreditoFacil | `HILCO_CREDITOFACIL` |
| 176 | Hilco_Firmacar | `HILCO_FIRMACAR` |
| 178 | Hilco_VemoElectric | `HILCO_VEMOELECTRIC` |
| 179 | Administradora de Activos Terracota S.A. de C.V. | `HILCO_FEES` |
| 180 | Hilco_Actinver | `HILCO_ACTINVER` |
| 181 | Hilco_Covalto | `HILCO_COVALTO` |
| 182 | Lender_Hilco_Invex | `LENDER_HILCO_INVEX` |
| 183 | Lender_CapemBursa_Hilco | `LENDER_CAPEMBURSA_HILCO` |
| 184 | Lender_CreditoFacil_Hilco | `LENDER_CREDITOFACIL_HILCO` |
| 185 | Lender_Firmacar_Hilco | `LENDER_FIRMACAR_HILCO` |
| 186 | Lender_VanrentaFondeo_Hilco | `LENDER_VANRENTAFONDEO_HILCO` |
| 187 | Lender_ExitusMaestro_Hilco | `LENDER_EXITUSMAESTRO_HILCO` |
| 188 | Lender_VemoMaestro_Hilco | `LENDER_VEMOMAESTRO_HILCO` |
| 189 | Lender_VemoMaestro5902_Hilco | `LENDER_VEMOMAESTRO5902_HILCO` |
| 190 | Lender_VemoMaestro1401_Hilco | `LENDER_VEMOMAESTRO1401_HILCO` |
| 191 | Lender_VemoMaestro5926_Hilco | `LENDER_VEMOMAESTRO5926_HILCO` |
| 192 | Lender_ExitusBursa_International | `LENDER_EXITUSBURSA_INTERNATIONAL` |
| 193 | Lender multiva exitus | `LENDER_MULTIVA_EXITUS` |
| 194 | Suenos | `SUENOS` |
| 195 | coograncolombiana | `COOGRANCOLOMBIANA` |
| 196 | Melon Cash | `MELON_CASH` |
| 198 | Melon Cash (Lender) | `MELON_CASH_LENDER` |
| 199 | Finamco | `FINAMCO` |
| 200 | Hilco_Fuentebuena | `HILCO_FUENTEBUENA` |
| 201 | Test Liquitech | `TEST_LIQUITECH` |
| 204 | Lender_Vanrenta6425_Hilco | `LENDER_VANRENTA6425_HILCO` |
| 205 | Lender_Vanrenta5366_Hilco | `LENDER_VANRENTA5366_HILCO` |
| 206 | Lender_Vanrenta6386_Hilco | `LENDER_VANRENTA6386_HILCO` |
| 207 | Lender_Vanrenta6392_Hilco | `LENDER_VANRENTA6392_HILCO` |
| 208 | Finanzauto | `FINANZAUTO` |
| 209 | Lenders_Finanzauto | `LENDERS_FINANZAUTO` |
| 210 | Lender_Vanrenta6352_Hilco | `LENDER_VANRENTA6352_HILCO` |
| 211 | Kandeo | `KANDEO` |
| 212 | Presta Vale | `PRESTA_VALE` |
| 213 | Grupo Solve | `GRUPO_SOLVE` |
| 214 | Engen | `ENGEN` |
| 215 | Engen_mesa_de_control | `ENGEN_MESA_DE_CONTROL` |
| 217 | Mesa_de_control_engen | `MESA_DE_CONTROL_ENGEN` |
| 218 | Prueba_lender_1 | `PRUEBA_LENDER_1` |
| 219 | CESIONBNKI-Kandeo | `CESIONBNKI_KANDEO` |
| 220 | CESIONBNKII_KANDEO | `CESIONBNKII_KANDEO` |
| 221 | cesionbnkIII-kandeo | `CESIONBNKIII_KANDEO` |
| 222 | Equity Link | `EQUITY_LINK` |
| 223 | Lender_Fuentebuena_Hilco | `LENDER_FUENTEBUENA_HILCO` |
| 224 | Lender_apex | `LENDER_APEX` |
| 225 | Lender_Apex_Hilco | `LENDER_APEX_HILCO` |
| 226 | Rentek | `RENTEK` |
| 227 | Hilco_Tip | `HILCO_TIP` |
| 228 | Lender_Tip_Hilco | `LENDER_TIP_HILCO` |
| 229 | Neuberger | `NEUBERGER` |
| 230 | Hilco_BAYPORT | `HILCO_BAYPORT` |
| 231 | Movve | `MOVVE` |
| 232 | Finkargo Colombia | `FINKARGO_COLOMBIA` |
| 233 | Hilco_ArrendamientoProductivo | `HILCO_ARRENDAMIENTOPRODUCTIVO` |
| 234 | Lender_ArrendamientoProd11957_Hilco | `LENDER_ARRENDAMIENTOPROD11957_HILCO` |
| 235 | Lender_ArrendamientoProd6156_Hilco | `LENDER_ARRENDAMIENTOPROD6156_HILCO` |
| 236 | Hilco_JollyHaul | `HILCO_JOLLYHAUL` |
| 237 | Lender_JollyHaulF1172_Hilco | `LENDER_JOLLYHAULF1172_HILCO` |
| 238 | Lender_JollyHaulF1320_Hilco | `LENDER_JOLLYHAULF1320_HILCO` |
| 239 | Lender_JollyHaulF1416_Hilco | `LENDER_JOLLYHAULF1416_HILCO` |
| 240 | Lender_JollyHaulF4552_Hilco | `LENDER_JOLLYHAULF4552_HILCO` |
| 241 | Symbiotic | `SYMBIOTIC` |
| 242 | Hilco_MasLeasing | `HILCO_MASLEASING` |
| 243 | Hilco_Fortaleza | `HILCO_FORTALEZA` |
| 244 | Lender_Hifin5664_Hilco | `LENDER_HIFIN5664_HILCO` |
| 245 | Lender_Hifin4485_Hilco | `LENDER_HIFIN4485_HILCO` |
| 246 | Lender_Fortaleza3104230_Hilco | `LENDER_FORTALEZA3104230_HILCO` |
| 247 | NIKOUSDWORKAROUND | `NIKOUSDWORKAROUND` |
| 248 | ADN | `ADN` |
| 249 | ADNUSDWORKAROUND | `ADNUSDWORKAROUND` |
| 250 | Lender_FirmacarF4915_Hilco | `LENDER_FIRMACARF4915_HILCO` |
| 251 | Lender_FirmacarF4433_Hilco | `LENDER_FIRMACARF4433_HILCO` |
| 252 | Lender_FirmacarF01243_Hilco | `LENDER_FIRMACARF01243_HILCO` |
| 253 | Lender_FirmacarF5893_Hilco | `LENDER_FIRMACARF5893_HILCO` |
| 254 | Lender_FirmacarF6290_Hilco | `LENDER_FIRMACARF6290_HILCO` |
| 255 | Lender_FirmacarF8774_Hilco | `LENDER_FIRMACARF8774_HILCO` |
| 256 | Lender_Firmacar851-03018_Hilco | `LENDER_FIRMACAR851_03018_HILCO` |
| 257 | Lender_MasLeasingF1793_Hilco | `LENDER_MASLEASINGF1793_HILCO` |
| 258 | Lender_MasLeasingF2081_Hilco | `LENDER_MASLEASINGF2081_HILCO` |
| 259 | Lender_MasLeasingF10762_Hilco | `LENDER_MASLEASINGF10762_HILCO` |
| 260 | Lender_MasLeasingF10762_2023_Hilco | `LENDER_MASLEASINGF10762_2023_HILCO` |
| 261 | Lender_MasLeasingF11060_Hilco | `LENDER_MASLEASINGF11060_HILCO` |
| 262 | Lender_MasLeasingF4477_Hilco | `LENDER_MASLEASINGF4477_HILCO` |
| 263 | Lender_MasLeasingF12153_Hilco | `LENDER_MASLEASINGF12153_HILCO` |
| 264 | Finamco_lender | `FINAMCO_LENDER` |
| 265 | FONDO ALIANZA FACTORING 6 MESES | `FONDO_ALIANZA_FACTORING_6_MESES` |
| 266 | FONDO ABIERTO CON PACTO DE PERMANENCIA CXC | `FONDO_ABIERTO_CON_PACTO_DE_PERMANENCIA_CXC` |
| 267 | WOM | `WOM` |
| 268 | Goldman Sachs (Atlas) | `GOLDMAN_SACHS_ATLAS` |
| 269 | BuildrFi | `BUILDRFI` |
| 270 | Pier Asset Management | `PIER_ASSET_MANAGEMENT` |

---

## LOOKUP — Nombre natural → Code

> Cuando el usuario mencione un borrower por nombre, traducir al code.

| Si el usuario dice... | Usar code |
|---|---|
| "Addi" | `ADDI` |
| "Goldman Sachs" | `GOLDMAN_SACHS` |
| "Adelantos" | `PAYJOY` |
| "Architect" | `ARCHITECT` |
| "Rapicredit" | `RAPICREDIT` |
| "CIM" | `CIM` |
| "Plataform" | `PLATAFORM` |
| "BIA" | `BIA` |
| "BBVA" | `BBVA` |
| "Crediorbe" | `CREDIORBE` |
| "Somos Internet" | `SOMOS` |
| "Welli" | `WELLI` |
| "First Principles Fund LP" | `FPF` |
| "Wimo" | `WIMO` |
| "Go-Bravo" | `GOBRAVO` |
| "BIA Energy" | `BIA-deprecated` |
| "Kippon" | `KIPPON` |
| "Cesion bnk" | `CESIONBNK` |
| "VPC" | `VPC` |
| "Credi7" | `CREDI7` |
| "FinMaq" | `FINMAQ` |
| "DeltaCredit" | `DELTACREDIT` |
| "Bancolombia" | `BANCOLOMBIA` |
| "Coltefinanciera" | `COLTEFINANCIERA` |
| "Patrimonio Autónomo CREDICORP Fiduciaria SA" | `PA_CREDICORP` |
| "Patrimonio Autónomo Consumo CIM" | `PA_CONSUMO_CIM` |
| "Patrimonio Autónomo Microcrédito CIM" | `PA_MICROCREDITO_CIM` |
| "Patrimonio Autónomo Especial Davivienda" | `PA_ESPECIAL_DAVIVIENDA` |
| "Patrimonio Autónomo Especial Davivienda - Microcrédito" | `PA_ESPECIAL_DAVIVIENDA_MICROCREDITO` |
| "Patrimonio Autónomo Especial Bogotá" | `PA_ESPECIAL_BOGOTA` |
| "Patrimonio Autónomo Especial Bogotá - Microcrédito" | `PA_ESPECIAL_BOGOTA_MICROCREDITO` |
| "Patrimonio Autónomo Especial Dann Regional" | `PA_ESPECIAL_DANN_REGIONAL` |
| "Patrimonio Autónomo Especial Dann Regional - Microcrédito" | `PA_ESPECIAL_DANN_REGIONAL_MICROCREDITO` |
| "HayCash" | `HAYCASH` |
| "Sistecredito" | `SISTECREDITO` |
| "Liquitech" | `LIQUITECH` |
| "PAYJOY ASSET HOLDINGS LP" | `PAYJOY_ASSET_FUND_HOLDINGS` |
| "SURA FICs" | `SURA` |
| "Interactuar" | `INTERACTUAR` |
| "Fundacion Bancolombia" | `FUNDACION_BANCOLOMBIA` |
| "Fundación Bcolombia" | `FUNDACIN_BCOLOMBIA` |
| "IFC" | `IFC` |
| "Facturas y Negocios" | `FACTURAS_Y_NEGOCIOS` |
| "Inklusiva" | `INKLUSIVA` |
| "Nera Capital" | `NERA_CAPITAL` |
| "Hilco_Credix" | `HILCO_CREDIX` |
| "Funder´s App" | `FUNDERS_APP` |
| "Funder App" | `FUNDER_APP` |
| "FA (Funders App)" | `FA_FUNDERS_APP` |
| "FA_Percent" | `FA_PERCENT` |
| "Citibank Colombia S.A." | `CITI` |
| "Lender_Credix_Hilco" | `LENDER_CREDIX_HILCO` |
| "Hilco_Nissan" | `HILCO_NISSAN` |
| "JPM_Hilco" | `JPM_HILCO` |
| "Banco Coomeva 2" | `BANCO_COOMEVA_2` |
| "Banco Davivienda" | `BANCO_DAVIVIENDA` |
| "BANCOLDEX" | `BANCOLDEX` |
| "Hilco_Vanrenta" | `HILCO_VANRENTA` |
| "Lender_Vanrenta_Hilco" | `LENDER_VANRENTA_HILCO` |
| "Niko" | `NIKO` |
| "J.P. Morgan Hilco" | `JP_MORGAN_HILCO` |
| "BANCO SANTANDER" | `BANCO_SANTANDER` |
| "Addi BNPN" | `ADDI_BNPN` |
| "KREDIT" | `KREDIT` |
| "J.P. Morgan" | `JP_MORGAN` |
| "SURA FICS 2" | `FICS_2` |
| "SURA FICS 3" | `FICS_3` |
| "Vemo" | `VEMO` |
| "BEEL" | `BEEL` |
| "Prueba 1 " | `PRUEBA_1` |
| "Apex" | `APEX` |
| "Alloy" | `ALLOY` |
| "Exitus" | `EXITUS` |
| "EXITUS BURSA" | `EXITUS_BURSA` |
| "Hilco_Engen" | `HILCO_ENGEN` |
| "Hilco_OCN" | `HILCO_OCN` |
| "Hilco_Hifin" | `HILCO_HIFIN` |
| "Lender_Hifin_Hilco" | `LENDER_HIFIN_HILCO` |
| "Lender_OCN_Hilco" | `LENDER_OCN_HILCO` |
| "Lender_Engen_Hilco" | `LENDER_ENGEN_HILCO` |
| "Hilco_Capem" | `HILCO_CAPEM` |
| "Hilco_CreditoFacil" | `HILCO_CREDITOFACIL` |
| "Hilco_Firmacar" | `HILCO_FIRMACAR` |
| "Hilco_VemoElectric" | `HILCO_VEMOELECTRIC` |
| "Administradora de Activos Terracota S.A. de C.V." | `HILCO_FEES` |
| "Hilco_Actinver" | `HILCO_ACTINVER` |
| "Hilco_Covalto" | `HILCO_COVALTO` |
| "Lender_Hilco_Invex" | `LENDER_HILCO_INVEX` |
| "Lender_CapemBursa_Hilco" | `LENDER_CAPEMBURSA_HILCO` |
| "Lender_CreditoFacil_Hilco" | `LENDER_CREDITOFACIL_HILCO` |
| "Lender_Firmacar_Hilco" | `LENDER_FIRMACAR_HILCO` |
| "Lender_VanrentaFondeo_Hilco" | `LENDER_VANRENTAFONDEO_HILCO` |
| "Lender_ExitusMaestro_Hilco" | `LENDER_EXITUSMAESTRO_HILCO` |
| "Lender_VemoMaestro_Hilco" | `LENDER_VEMOMAESTRO_HILCO` |
| "Lender_VemoMaestro5902_Hilco" | `LENDER_VEMOMAESTRO5902_HILCO` |
| "Lender_VemoMaestro1401_Hilco" | `LENDER_VEMOMAESTRO1401_HILCO` |
| "Lender_VemoMaestro5926_Hilco" | `LENDER_VEMOMAESTRO5926_HILCO` |
| "Lender_ExitusBursa_International" | `LENDER_EXITUSBURSA_INTERNATIONAL` |
| "Lender multiva exitus" | `LENDER_MULTIVA_EXITUS` |
| "Suenos" | `SUENOS` |
| "coograncolombiana" | `COOGRANCOLOMBIANA` |
| "Melon Cash" | `MELON_CASH` |
| "Melon Cash (Lender)" | `MELON_CASH_LENDER` |
| "Finamco" | `FINAMCO` |
| "Hilco_Fuentebuena" | `HILCO_FUENTEBUENA` |
| "Test Liquitech" | `TEST_LIQUITECH` |
| "Lender_Vanrenta6425_Hilco" | `LENDER_VANRENTA6425_HILCO` |
| "Lender_Vanrenta5366_Hilco" | `LENDER_VANRENTA5366_HILCO` |
| "Lender_Vanrenta6386_Hilco" | `LENDER_VANRENTA6386_HILCO` |
| "Lender_Vanrenta6392_Hilco" | `LENDER_VANRENTA6392_HILCO` |
| "Finanzauto" | `FINANZAUTO` |
| "Lenders_Finanzauto" | `LENDERS_FINANZAUTO` |
| "Lender_Vanrenta6352_Hilco" | `LENDER_VANRENTA6352_HILCO` |
| "Kandeo" | `KANDEO` |
| "Presta Vale" | `PRESTA_VALE` |
| "Grupo Solve" | `GRUPO_SOLVE` |
| "Engen" | `ENGEN` |
| "Engen_mesa_de_control" | `ENGEN_MESA_DE_CONTROL` |
| "Mesa_de_control_engen" | `MESA_DE_CONTROL_ENGEN` |
| "Prueba_lender_1" | `PRUEBA_LENDER_1` |
| "CESIONBNKI-Kandeo" | `CESIONBNKI_KANDEO` |
| "CESIONBNKII_KANDEO" | `CESIONBNKII_KANDEO` |
| "cesionbnkIII-kandeo" | `CESIONBNKIII_KANDEO` |
| "Equity Link" | `EQUITY_LINK` |
| "Lender_Fuentebuena_Hilco" | `LENDER_FUENTEBUENA_HILCO` |
| "Lender_apex" | `LENDER_APEX` |
| "Lender_Apex_Hilco" | `LENDER_APEX_HILCO` |
| "Rentek" | `RENTEK` |
| "Hilco_Tip" | `HILCO_TIP` |
| "Lender_Tip_Hilco" | `LENDER_TIP_HILCO` |
| "Neuberger" | `NEUBERGER` |
| "Hilco_BAYPORT" | `HILCO_BAYPORT` |
| "Movve" | `MOVVE` |
| "Finkargo Colombia" | `FINKARGO_COLOMBIA` |
| "Hilco_ArrendamientoProductivo" | `HILCO_ARRENDAMIENTOPRODUCTIVO` |
| "Lender_ArrendamientoProd11957_Hilco" | `LENDER_ARRENDAMIENTOPROD11957_HILCO` |
| "Lender_ArrendamientoProd6156_Hilco" | `LENDER_ARRENDAMIENTOPROD6156_HILCO` |
| "Hilco_JollyHaul" | `HILCO_JOLLYHAUL` |
| "Lender_JollyHaulF1172_Hilco" | `LENDER_JOLLYHAULF1172_HILCO` |
| "Lender_JollyHaulF1320_Hilco" | `LENDER_JOLLYHAULF1320_HILCO` |
| "Lender_JollyHaulF1416_Hilco" | `LENDER_JOLLYHAULF1416_HILCO` |
| "Lender_JollyHaulF4552_Hilco" | `LENDER_JOLLYHAULF4552_HILCO` |
| "Symbiotic" | `SYMBIOTIC` |
| "Hilco_MasLeasing" | `HILCO_MASLEASING` |
| "Hilco_Fortaleza" | `HILCO_FORTALEZA` |
| "Lender_Hifin5664_Hilco" | `LENDER_HIFIN5664_HILCO` |
| "Lender_Hifin4485_Hilco" | `LENDER_HIFIN4485_HILCO` |
| "Lender_Fortaleza3104230_Hilco" | `LENDER_FORTALEZA3104230_HILCO` |
| "NIKOUSDWORKAROUND" | `NIKOUSDWORKAROUND` |
| "ADN" | `ADN` |
| "ADNUSDWORKAROUND" | `ADNUSDWORKAROUND` |
| "Lender_FirmacarF4915_Hilco" | `LENDER_FIRMACARF4915_HILCO` |
| "Lender_FirmacarF4433_Hilco" | `LENDER_FIRMACARF4433_HILCO` |
| "Lender_FirmacarF01243_Hilco" | `LENDER_FIRMACARF01243_HILCO` |
| "Lender_FirmacarF5893_Hilco" | `LENDER_FIRMACARF5893_HILCO` |
| "Lender_FirmacarF6290_Hilco" | `LENDER_FIRMACARF6290_HILCO` |
| "Lender_FirmacarF8774_Hilco" | `LENDER_FIRMACARF8774_HILCO` |
| "Lender_Firmacar851-03018_Hilco" | `LENDER_FIRMACAR851_03018_HILCO` |
| "Lender_MasLeasingF1793_Hilco" | `LENDER_MASLEASINGF1793_HILCO` |
| "Lender_MasLeasingF2081_Hilco" | `LENDER_MASLEASINGF2081_HILCO` |
| "Lender_MasLeasingF10762_Hilco" | `LENDER_MASLEASINGF10762_HILCO` |
| "Lender_MasLeasingF10762_2023_Hilco" | `LENDER_MASLEASINGF10762_2023_HILCO` |
| "Lender_MasLeasingF11060_Hilco" | `LENDER_MASLEASINGF11060_HILCO` |
| "Lender_MasLeasingF4477_Hilco" | `LENDER_MASLEASINGF4477_HILCO` |
| "Lender_MasLeasingF12153_Hilco" | `LENDER_MASLEASINGF12153_HILCO` |
| "Finamco_lender" | `FINAMCO_LENDER` |
| "FONDO ALIANZA FACTORING 6 MESES" | `FONDO_ALIANZA_FACTORING_6_MESES` |
| "FONDO ABIERTO CON PACTO DE PERMANENCIA CXC" | `FONDO_ABIERTO_CON_PACTO_DE_PERMANENCIA_CXC` |
| "WOM" | `WOM` |
| "Goldman Sachs (Atlas)" | `GOLDMAN_SACHS_ATLAS` |
| "BuildrFi" | `BUILDRFI` |
| "Pier Asset Management" | `PIER_ASSET_MANAGEMENT` |

---

## NOTA

Borrowers sin `code` son registros de prueba o inactivos — no tienen data operacional.
