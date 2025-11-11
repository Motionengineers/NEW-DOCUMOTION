# Apple Human Interface Guidelines Implementation

## Overview

This application has been redesigned to follow Apple's Human Interface Guidelines (HIG), featuring:

- **Dynamic System Colors**: Automatically adapts to light and dark modes
- **Semantic Colors**: Uses system colors (systemBlue, labelColor, systemBackground, etc.)
- **Clean, Minimalist Design**: Focus on white space and high contrast
- **Apple Brand Colors**: Science Blue (#0066CC) for primary interactive elements

## Color System

### Light Mode

- **System Background**: Pure white (#ffffff)
- **Secondary Background**: Light gray (#f5f5f7)
- **Labels**: Black with opacity variations for hierarchy
- **Separators**: Subtle gray with opacity

### Dark Mode

- **System Background**: Pure black (#000000)
- **Secondary Background**: Dark gray (#1c1c1e)
- **Labels**: White with opacity variations
- **Separators**: Subtle light gray with opacity

### Accent Colors

- **Primary (Science Blue)**: #0066CC (light mode) / #5ac8fa (dark mode)
- **System Colors**: Blue, Green, Indigo, Orange, Pink, Purple, Red, Teal, Yellow

## Components

### Buttons

- **Primary**: Science Blue background with white text
- **Secondary**: Subtle background with border
- **Hover States**: Smooth opacity and color transitions
- **Active States**: Subtle scale transform

### Cards

- **Glass Effect**: Subtle backdrop blur with transparency
- **Borders**: Minimal separators using system separator color
- **Shadows**: Apple-style soft shadows

### Typography

- **Font**: SF Pro Display / SF Pro Text (system fonts)
- **Font Smoothing**: Antialiased rendering
- **Hierarchy**: Label, secondary-label, tertiary-label for text hierarchy

### Forms

- **Inputs**: Clean borders with focus rings using Science Blue
- **Focus States**: 2px outline in system blue
- **Placeholders**: Subtle opacity using placeholder-text color

## Theme System

The theme automatically:

1. Detects system preference on first load
2. Allows manual toggle via navbar button
3. Persists user preference in localStorage
4. Updates in real-time without page refresh

## Design Principles

1. **Clarity**: High contrast, readable text
2. **Deference**: UI doesn't compete with content
3. **Depth**: Subtle layering with shadows and blur
4. **Consistency**: Standardized spacing and sizing
5. **Accessibility**: WCAG AA compliant color contrasts

## Usage

Components automatically use semantic colors via CSS variables:

- `var(--system-blue)`: Primary accent color
- `var(--label)`: Primary text color
- `var(--secondary-label)`: Secondary text color
- `var(--system-background)`: Main background
- `var(--separator)`: Border/separator color

## Browser Support

- Modern browsers with CSS custom properties support
- Backdrop filter support for glass effects
- Automatic fallbacks for unsupported features
