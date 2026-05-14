# 🎨 Arquitectura CSS Modular — FIFA World Cup 2026™

## Estructura

```
css/
├── design-tokens.css          # 🎨 Variables globales (colores, tipografía, espaciado)
├── reset.css                  # 🔄 Reset HTML/body, box-sizing
├── layout/
│   ├── base.css               # 📐 Patrones decorativos, z-index
│   └── container.css          # 📦 Contenedor principal .fwc-main
├── components/                # 🧩 Componentes reutilizables
│   ├── nav.css                # 🧭 Navegación
│   ├── ticker.css             # 📰 Marquee de noticias
│   ├── header.css             # 📄 Sección de bienvenida
│   ├── divider.css            # ➖ Separadores tricolor
│   ├── buttons.css            # 🔘 Botones (filtros, form)
│   ├── forms.css              # 📝 Inputs, autocomplete, forms
│   ├── tables.css             # 📊 Tabla de figuritas
│   └── countries.css          # 🌍 Botonera de 50 países
├── animations.css             # ✨ @keyframes globales
├── responsive.css             # 📱 Media queries centralizadas
├── a11y.css                   # ♿ Accesibilidad
└── index.css                  # 📋 Índice (importa todos)
```

## Importación

**En `index.html`:**
```html
<link rel="stylesheet" href="css/index.css" />
```

El archivo `css/index.css` importa todos los módulos en orden correcto.

## Modelos de Uso

### 1. Agregar un nuevo componente

Crear `css/components/nuevo.css`:
```css
.fwc-nuevo {
  /* styles aquí */
}
```

Importar en `css/index.css`:
```css
@import 'components/nuevo.css';
```

### 2. Agregar variables globales

Editar `css/design-tokens.css`:
```css
--fwc-nueva-variable: value;
```

Usar en cualquier módulo:
```css
.elemento {
  color: var(--fwc-nueva-variable);
}
```

### 3. Media queries específicas de un componente

**Opción A (recomendado):** Agregar a `css/responsive.css` en sección de mobile
**Opción B:** Incluir en el módulo del componente (ej: `css/components/nuevo.css`)

## Beneficios

✅ **Mantenimiento:** Cambios en un componente = editar 1 archivo  
✅ **Escalabilidad:** Agregar nuevos componentes sin tocar otros  
✅ **Reutilización:** Copiar módulos a otros proyectos FIFA  
✅ **Legibilidad:** Archivos pequeños (~50-150 líneas)  
✅ **Performance:** Minificación automática en build  

## Convenciones FIFA Design System

- **BEM naming:** `.fwc-component__element--modifier`
- **Sin `border-radius`:** Solo 0, 2px (mínimo), 50% (círculos)
- **Sombras offset:** Sin blur (ej: `2px 2px 0 rgba(...)`)
- **Colores:** 3 paletas por país (USA Blues, Canada Reds, México Greens)
- **Espaciado:** Unidad base 4px, FIFA = 48px

## Historial

- **812 líneas monolíticas → 15 archivos modulares** (17 commits)
- **28KB → bien organizado** para mantenimiento a largo plazo
- **Archivo histórico:** `styles.css` disponible para referencia

---

**Mantener la modularidad: un cambio = un archivo.**
