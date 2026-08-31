# 🚖 Taxi Fleet Management & Driver Payments Dashboard

Un panel de administración full-stack diseñado para centralizar la gestión operativa de una flota de taxis: registro de pagos diarios por conductor, control de deudas, seguimiento de mantenimiento y alertas automáticas de vencimiento de documentos.

---

## 🎯 Problema & Solución

- **El Problema:** La gestión manual en hojas de cálculo dificulta auditar los ingresos diarios, rastrear saldos pendientes y prever el vencimiento de pólizas de seguro o inspecciones vehiculares, generando riesgos operativos y pérdida de ingresos.
- **La Solución:** Una plataforma web en tiempo real que consolida métricas de recaudación mensual y diaria, automatiza el cálculo de alertas preventivas y simplifica la gestión del flujo de caja.

---

## ✨ Características Principales

- **Monitoreo de Pagos:** Métricas de recaudación mensual, ingresos del día y listado de transacciones recientes con formato de moneda local y relación directa con conductores.
- **Alertas de Documentación:** Sistema que calcula días restantes o vencidos para pólizas de seguro, placas/marchamos y revisiones técnicas por vehículo.
- **Control de Deudas:** Registro y seguimiento de acuerdos de pago por conductor con cálculo de saldos pendientes.
- **Visualización de Datos:** Gráfico interactivo para la tendencia de recaudación semanal.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide React, Recharts.
- **Backend & Base de Datos:** Supabase (PostgreSQL, Row Level Security).
- **Herramientas & Despliegue:** TypeScript, ESLint, Vercel.

---

## 🏗️ Decisiones de Arquitectura & Rendimiento

- **Server Components:** Recuperación de datos directo en el servidor para reducir el JavaScript enviado al navegador y acelerar la carga inicial.
- **Consultas Paralelas (`Promise.all`):** Optimización del tiempo de respuesta del servidor mediante la ejecución concurrente de múltiples consultas a la base de datos.
- **Normalización de Datos:** Transformación y filtrado de estructuras complejas en el servidor antes de enviarlas a los componentes de la interfaz.

---

## 🚀 Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Grima21/driver-payments-dashboard.git
   cd driver-payments-dashboard
   ```
