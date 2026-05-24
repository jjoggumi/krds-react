# UI_COMPONENT_RULES
- ROLE: Figma to React UI component via `@figma-desktop`.
- WORKFLOW:
  1. Read Figma element.
  2. Reflect component properties and define as props.
  3. Map styles to Tailwind design tokens.
  4. Make it responsive & accessible.
- TECH: TypeScript (`interface` for Props).
- PROPS: MUST support `className` & `style`. Merge classes with `clsx` (and `tailwind-merge`).
- CONSTRAINTS: Component ONLY. No page layout. Use Named Export.



