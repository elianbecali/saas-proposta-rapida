---
name: proposta-rapida-stack
description: Tech stack, key decisions, and constraints for the Proposta Rápida SaaS project
type: project
---

Uses Shadcn v4 with @base-ui/react — Button does NOT support `asChild`. Use `buttonVariants()` + `<Link>` for link-buttons instead.

**Why:** Shadcn v4 switched from Radix UI to @base-ui/react which has a different API. `asChild` is a Radix pattern.
**How to apply:** Whenever rendering a Button that navigates, use `<Link className={buttonVariants({...})}>` instead of `<Button asChild><Link>`.

DropdownMenuTrigger uses `render` prop instead of `asChild` in this version.
