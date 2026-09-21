<div align="center">

# 🖥️ NexoPC — Frontend

### E-commerce headless de hardware y ensamblaje de PC gamer

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Apollo Client](https://img.shields.io/badge/Apollo-3.x-311C87?style=for-the-badge&logo=apollo-graphql)](https://www.apollographql.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-brown?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Universidad Privada del Norte** · Curso: E-Business y Analítica Web · Trujillo, Perú · 2026

</div>

---

## 📖 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Paso a Paso](#-instalación-paso-a-paso)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Flujo de Trabajo con Git](#-flujo-de-trabajo-con-git)
- [Convenciones de Código](#-convenciones-de-código)
- [Testing y Debugging](#-testing-y-debugging)
- [Solución de Problemas](#-solución-de-problemas)
- [Roadmap del Proyecto](#-roadmap-del-proyecto)
- [Equipo y Contacto](#-equipo-y-contacto)

---

## 🎯 Descripción General

**NexoPC Frontend** es la aplicación web del proyecto NexoPC, un e-commerce especializado en la **venta de componentes de PC** y el **ensamblaje de configuraciones personalizadas** para gamers, streamers, creadores de contenido y profesionales.

### ¿Qué hace único a NexoPC?

| Diferencial | Descripción |
|-------------|-------------|
| 🔧 **Configurador inteligente** | Valida compatibilidad entre componentes (socket, tipo RAM, TDP, dimensiones) en tiempo real. |
| 🎥 **Certificado en video** | Cada PC ensamblada se entrega con un video de pruebas de estrés grabado. |
| 📋 **SLA de postventa visible** | Plazos de garantía, entrega y canal de reclamo visibles antes de comprar. |
| 💳 **Pagos locales** | Integración con Culqi (Yape, Plin, tarjetas, BNPL). |

### Arquitectura Headless

Este frontend consume datos de un **backend WordPress + WooCommerce** a través de una **API GraphQL**. No está acoplado a un CMS tradicional, lo que permite:

- ✅ Máxima velocidad de carga (SSR/SSG con Next.js).
- ✅ SEO optimizado para cada producto.
- ✅ Experiencia de usuario tipo SPA.
- ✅ Escalabilidad independiente del backend.

---

## ✨ Características Principales

### ✅ Implementadas

- [x] **Home page** con hero, productos destacados y llamados a la acción.
- [x] **Catálogo de productos** (`/tienda`) con grid responsive.
- [x] **Ficha de producto** (`/producto/[slug]`) con imágenes, precio, stock y descripción.
- [x] **Carrito de compras** persistente (localStorage vía Zustand).
- [x] **Header y Footer** con navegación y contador de carrito en tiempo real.
- [x] **Conexión GraphQL** con WordPress vía Apollo Client.
- [x] **Diseño oscuro** con identidad visual de marca (naranja/negro).

### 🚧 En desarrollo

- [ ] **Configurador de PC** con validación de compatibilidad en tiempo real.
- [ ] **Checkout con Culqi** (sandbox y producción).
- [ ] **Creación de pedidos** en WooCommerce vía REST API.
- [ ] **Página de confirmación** post-compra.

### 📋 Próximas funcionalidades

- [ ] **Autenticación de usuarios** (JWT).
- [ ] **Historial de pedidos** (`/mi-cuenta`).
- [ ] **Búsqueda de productos** con filtros.
- [ ] **Chatbot de atención** (Tidio/Chatra).
- [ ] **Blog SEO** con artículos educativos.
- [ ] **Sistema de reseñas** de productos.

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.3.5 | Framework React con App Router y Turbopack |
| **React** | 19.x | Librería de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Framework de estilos utility-first |
| **Apollo Client** | 3.x | Cliente GraphQL |
| **Zustand** | 5.x | Gestión de estado global (carrito, configurador) |
| **React Culqi** | 1.x | Integración con la pasarela de pagos peruana |

### Backend (repositorio separado)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **WordPress** | 7.1.1 | CMS base |
| **WooCommerce** | 11.1.1 | Motor de e-commerce |
| **WPGraphQL** | 2.23.0 | API GraphQL |
| **WooGraphQL** | 0.21.2 | Extensión WooCommerce para GraphQL |
| **JWT Authentication** | 1.5.0 | Autenticación de usuarios |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| **VS Code** | Editor recomendado |
| **Antigravity IDE** | IDE alternativo con IA integrada |
| **Git + GitHub** | Control de versiones |
| **LocalWP** | Servidor local del backend |
| **npm** | Gestor de paquetes |

---

## 🏗️ Arquitectura del Sistema
