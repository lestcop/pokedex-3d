<div align="center">

# Pokédex<span>.</span>

**Los 151 Pokémon de Kanto, reimaginados como un cuaderno de campo.**
Busca, compara sus estadísticas y, desde la computadora, sal a encontrarlos en un mundo 3D.

![React](https://img.shields.io/badge/React-19-141413?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-141413?style=flat-square&logo=typescript&logoColor=3178C6)
![Vite](https://img.shields.io/badge/Vite-141413?style=flat-square&logo=vite&logoColor=646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-141413?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![Three.js](https://img.shields.io/badge/Three.js-R3F-141413?style=flat-square&logo=threedotjs&logoColor=white)
![Status](https://img.shields.io/badge/estado-en%20desarrollo-d97757?style=flat-square)

</div>

---

## ✨ Qué es

Una Pokédex con estilo **editorial cálido**: papel crema, tinta oscura, un solo acento terracota y tipografía serif. Tiene dos experiencias:

| 📱 Móvil — Pokédex 2D | 🖥️ Computadora — Mundo 3D |
|---|---|
| Tarjetas por tipo, búsqueda y filtros | Mundo explorable con 3 zonas (bosque, agua, cueva) |
| Ficha con descripción, stats y habilidades | Modelos 3D de Pokémon con animación |
| Grito de cada Pokémon 🔊 | Controles WASD, cámara en tercera persona y colisiones |

## 🧩 Funcionalidades

- 🔍 Búsqueda por nombre o número
- 🏷️ Filtro por los 18 tipos, cada uno con su color
- 📖 Ficha con pestañas: **Info**, **Stats** y **Habilidades**
- 🌍 Mundo 3D con Pokémon salvajes en su hábitat (solo en computadora)
- 🎯 *Próximamente:* escanear y capturar Pokémon y guardar el progreso

## 🛠️ Stack

- **React + TypeScript + Vite**
- **Tailwind CSS v4** con tokens propios (`paper`, `ink`, `clay`…)
- **TanStack Query** para los datos y la caché
- **React Three Fiber + drei** para el mundo 3D
- Tipografías **Fraunces** e **Inter**

## 🚀 Correr en local

```bash
git clone https://github.com/lestcop/pokedex-3d.git
cd pokedex-3d
pnpm install
pnpm dev
```

## 🗺️ Hoja de ruta

- [x] Fase 1 · Pokédex 2D con datos de PokéAPI
- [x] Fase 2 · Ficha con visor 3D
- [x] Fase 3 · Mundo explorable, controles y colisiones
- [x] Rediseño editorial cálido
- [ ] Fase 4 · Escanear, capturar y guardar progreso (Zustand + Supabase)

## 🙏 Créditos

- Datos: [PokéAPI](https://pokeapi.co)
- Modelos 3D: [Pokémon 3D API](https://github.com/Pokemon-3D-api/assets)

## ⚖️ Aviso

Proyecto personal **sin fines de lucro**. Pokémon y sus nombres son marcas de Nintendo, Game Freak y Creatures. Este es un fan project sin afiliación oficial.

---

<div align="center">
Hecho con ☕ en Loja, Ecuador · <a href="https://github.com/lestcop">@lestcop</a>
</div>
