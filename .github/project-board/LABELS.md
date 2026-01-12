# GitHub Labels Configuration

This file defines all labels to be created for the Pilot Sprint project.

## How to Create These Labels

You can create these labels using the GitHub CLI:

```bash
# Priority labels
gh label create "priority:must" --description "Critical for demo success, must be completed" --color "d73a4a"
gh label create "priority:should" --description "Important but not critical, complete if time permits" --color "fbca04"
gh label create "priority:could" --description "Nice to have, defer if needed" --color "0e8a16"

# Type labels
gh label create "backend" --description "Backend API, database, core logic" --color "5319e7"
gh label create "frontend" --description "UI, UX, display interfaces" --color "1d76db"
gh label create "infra" --description "Infrastructure, deployment, configuration" --color "0052cc"
gh label create "ux" --description "User experience improvements" --color "c5def5"
gh label create "docs" --description "Documentation, guides, briefings" --color "0075ca"
gh label create "demo" --description "Demo-specific preparation" --color "ff6b6b"

# Owner labels
gh label create "owner:A" --description "Student A (Core backend, ASR, alignment, reliability)" --color "bfdadc"
gh label create "owner:B" --description "Student B (Frontend, UX, live display, admin workflows)" --color "c2e0c6"
gh label create "owner:C" --description "Student C (Documentation, analytics, stakeholder engagement)" --color "f9d0c4"

# Status labels
gh label create "stability" --description "System reliability and error handling" --color "d4c5f9"
gh label create "polish" --description "UI/UX refinements and visual improvements" --color "e99695"
gh label create "bug" --description "Bug fixes" --color "d73a4a"
```

## Label Definitions

### Priority Labels

| Label | Color | Description |
|-------|-------|-------------|
| `priority:must` | ![#d73a4a](https://via.placeholder.com/15/d73a4a/000000?text=+) `#d73a4a` (red) | Critical for demo success, must be completed |
| `priority:should` | ![#fbca04](https://via.placeholder.com/15/fbca04/000000?text=+) `#fbca04` (yellow) | Important but not critical, complete if time permits |
| `priority:could` | ![#0e8a16](https://via.placeholder.com/15/0e8a16/000000?text=+) `#0e8a16` (green) | Nice to have, defer if needed |

### Type Labels

| Label | Color | Description |
|-------|-------|-------------|
| `backend` | ![#5319e7](https://via.placeholder.com/15/5319e7/000000?text=+) `#5319e7` (purple) | Backend API, database, core logic |
| `frontend` | ![#1d76db](https://via.placeholder.com/15/1d76db/000000?text=+) `#1d76db` (blue) | UI, UX, display interfaces |
| `infra` | ![#0052cc](https://via.placeholder.com/15/0052cc/000000?text=+) `#0052cc` (dark blue) | Infrastructure, deployment, configuration |
| `ux` | ![#c5def5](https://via.placeholder.com/15/c5def5/000000?text=+) `#c5def5` (light blue) | User experience improvements |
| `docs` | ![#0075ca](https://via.placeholder.com/15/0075ca/000000?text=+) `#0075ca` (blue) | Documentation, guides, briefings |
| `demo` | ![#ff6b6b](https://via.placeholder.com/15/ff6b6b/000000?text=+) `#ff6b6b` (coral) | Demo-specific preparation |

### Owner Labels

| Label | Color | Description |
|-------|-------|-------------|
| `owner:A` | ![#bfdadc](https://via.placeholder.com/15/bfdadc/000000?text=+) `#bfdadc` (light cyan) | Student A (Core backend, ASR, alignment, reliability) |
| `owner:B` | ![#c2e0c6](https://via.placeholder.com/15/c2e0c6/000000?text=+) `#c2e0c6` (light green) | Student B (Frontend, UX, live display, admin workflows) |
| `owner:C` | ![#f9d0c4](https://via.placeholder.com/15/f9d0c4/000000?text=+) `#f9d0c4` (light peach) | Student C (Documentation, analytics, stakeholder engagement) |

### Status Labels

| Label | Color | Description |
|-------|-------|-------------|
| `stability` | ![#d4c5f9](https://via.placeholder.com/15/d4c5f9/000000?text=+) `#d4c5f9` (light purple) | System reliability and error handling |
| `polish` | ![#e99695](https://via.placeholder.com/15/e99695/000000?text=+) `#e99695` (light red) | UI/UX refinements and visual improvements |
| `bug` | ![#d73a4a](https://via.placeholder.com/15/d73a4a/000000?text=+) `#d73a4a` (red) | Bug fixes |

## Label Usage Guidelines

1. **Every issue must have:**
   - Exactly one priority label (`priority:must`, `priority:should`, or `priority:could`)
   - Exactly one owner label (`owner:A`, `owner:B`, or `owner:C`)
   - At least one type label (`backend`, `frontend`, `infra`, `ux`, `docs`, `demo`)

2. **Optional labels:**
   - Status labels (`stability`, `polish`, `bug`) can be added as needed

3. **Label combinations:**
   - An issue can have multiple type labels if it spans concerns (e.g., `backend` + `docs`)
   - Only one priority and one owner per issue for clarity

## Automation Suggestions

Consider setting up GitHub Actions to:
- Auto-assign issues based on `owner:*` labels
- Move issues to appropriate project columns based on labels
- Alert when `priority:must` issues are blocked
- Generate sprint reports based on label statistics
