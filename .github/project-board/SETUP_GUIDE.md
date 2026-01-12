# GitHub Project Setup Guide

This guide walks you through creating the "Pilot Sprint – Official Demo Readiness" GitHub Project (Projects v2, not Classic).

---

## Step 1: Create the Project

### Using GitHub Web Interface

1. Navigate to your repository: `https://github.com/RidwanAfolabi/sermon-translation-system-fyp`
2. Click on the **"Projects"** tab
3. Click **"New project"** (green button)
4. Choose **"Board"** template
5. Name: **"Pilot Sprint – Official Demo Readiness"**
6. Description: **"1-week sprint for final demo readiness - stabilization, polish, and trust"**
7. Click **"Create"**

### Using GitHub CLI

```bash
# Authenticate if needed
gh auth login

# Create project
gh project create \
  --owner RidwanAfolabi \
  --title "Pilot Sprint – Official Demo Readiness" \
  --format Board
```

---

## Step 2: Configure Project Columns

### Default columns to modify:
- Rename "Todo" → **"Backlog"**
- Keep "In Progress"
- Rename "Done" → **"Review / Test"**

### Add new columns:
1. **"Ready"** (after Backlog, before In Progress)
2. **"Blocked"** (after Review / Test)
3. **"Done"** (after Blocked)
4. **"Frozen (Post-Sprint)"** (last column)

### Final column order:
1. Backlog
2. Ready
3. In Progress
4. Review / Test
5. Blocked
6. Done
7. Frozen (Post-Sprint)

### How to add columns (Web UI):
1. Click **"+"** button on the right side of columns
2. Enter column name
3. Drag to reorder

---

## Step 3: Create Labels

Run this script from your repository root:

```bash
cd /path/to/sermon-translation-system-fyp

# Priority labels
gh label create "priority:must" \
  --description "Critical for demo success, must be completed" \
  --color "d73a4a"

gh label create "priority:should" \
  --description "Important but not critical, complete if time permits" \
  --color "fbca04"

gh label create "priority:could" \
  --description "Nice to have, defer if needed" \
  --color "0e8a16"

# Type labels
gh label create "backend" \
  --description "Backend API, database, core logic" \
  --color "5319e7"

gh label create "frontend" \
  --description "UI, UX, display interfaces" \
  --color "1d76db"

gh label create "infra" \
  --description "Infrastructure, deployment, configuration" \
  --color "0052cc"

gh label create "ux" \
  --description "User experience improvements" \
  --color "c5def5"

gh label create "docs" \
  --description "Documentation, guides, briefings" \
  --color "0075ca"

gh label create "demo" \
  --description "Demo-specific preparation" \
  --color "ff6b6b"

# Owner labels
gh label create "owner:A" \
  --description "Student A (Core backend, ASR, alignment, reliability)" \
  --color "bfdadc"

gh label create "owner:B" \
  --description "Student B (Frontend, UX, live display, admin workflows)" \
  --color "c2e0c6"

gh label create "owner:C" \
  --description "Student C (Documentation, analytics, stakeholder engagement)" \
  --color "f9d0c4"

# Status labels
gh label create "stability" \
  --description "System reliability and error handling" \
  --color "d4c5f9"

gh label create "polish" \
  --description "UI/UX refinements and visual improvements" \
  --color "e99695"

gh label create "bug" \
  --description "Bug fixes" \
  --color "d73a4a"
```

**Alternative:** Copy the commands from `.github/project-board/LABELS.md`

---

## Step 4: Create Issues

Use the detailed issue descriptions from `.github/project-board/SPRINT_ISSUES.md`

### Quick Create Script

Save this as `.github/project-board/create-issues.sh`:

```bash
#!/bin/bash

# Student A Issues
gh issue create \
  --title "Implement graceful handling when ASR drops or pauses mid-sermon" \
  --label "owner:A,backend,priority:must,stability" \
  --assignee "StudentA-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue A1"

gh issue create \
  --title "Implement/verify cache and buffering for alignment and subtitle delivery" \
  --label "owner:A,backend,priority:must,stability" \
  --assignee "StudentA-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue A2"

gh issue create \
  --title "Cross-check entire end-to-end pipeline for demo safety" \
  --label "owner:A,backend,priority:must,stability" \
  --assignee "StudentA-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue A3"

gh issue create \
  --title "Ensure logs are correctly written with timestamps and segment IDs" \
  --label "owner:A,backend,priority:should,stability" \
  --assignee "StudentA-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue A4"

gh issue create \
  --title "Document model retraining as scaffold for future work" \
  --label "owner:A,backend,priority:could,docs" \
  --assignee "StudentA-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue A5"

# Student B Issues
gh issue create \
  --title "Add bulk approve action for sermon/segment verification" \
  --label "owner:B,frontend,priority:must,ux" \
  --assignee "StudentB-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue B1"

gh issue create \
  --title "Add subtle typing/fade-in animation for live subtitle display" \
  --label "owner:B,frontend,priority:should,polish" \
  --assignee "StudentB-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue B2"

gh issue create \
  --title "Reduce 'generic AI dashboard' feel; improve visual calmness" \
  --label "owner:B,frontend,priority:should,polish,ux" \
  --assignee "StudentB-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue B3"

gh issue create \
  --title "Ensure skipped segments display correctly before next match" \
  --label "owner:B,frontend,priority:must,bug" \
  --assignee "StudentB-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue B4"

gh issue create \
  --title "Prepare UI for live lab simulation and demo replay" \
  --label "owner:B,frontend,priority:must,demo" \
  --assignee "StudentB-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue B5"

# Student C Issues
gh issue create \
  --title "Finalize masjid briefing documents (phases, equipment, responsibilities)" \
  --label "owner:C,docs,priority:must,demo" \
  --assignee "StudentC-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue C1"

gh issue create \
  --title "Add light post-service analytics (counts, latency; CSV OK)" \
  --label "owner:C,backend,docs,priority:should,demo" \
  --assignee "StudentC-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue C2"

gh issue create \
  --title "Prepare demo script (5-minute and 10-minute versions)" \
  --label "owner:C,docs,priority:must,demo" \
  --assignee "StudentC-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue C3"

gh issue create \
  --title "Plan stakeholder engagement (VC, Dean, Masjid Committee)" \
  --label "owner:C,docs,priority:should,demo" \
  --assignee "StudentC-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue C4"

gh issue create \
  --title "Organize lab simulation with Malay speakers and collect feedback" \
  --label "owner:C,docs,priority:must,demo" \
  --assignee "StudentC-Username" \
  --body "See .github/project-board/SPRINT_ISSUES.md - Issue C5"
```

**Note:** Replace `StudentA-Username`, `StudentB-Username`, `StudentC-Username` with actual GitHub usernames.

---

## Step 5: Add Issues to Project

### Automatically (recommended):

1. Go to Project Settings
2. Under "Workflows", enable:
   - **"Auto-add to project"** → Select "Issues" → Save
   - This will automatically add new issues to the project

### Manually:

1. Open the project board
2. Click **"+ Add item"**
3. Search for issue by number or title
4. Click to add

---

## Step 6: Organize Issues into Columns

### Initial Placement

**Ready Column (14 issues):**
- All issues A1-A4 (Student A)
- All issues B1-B5 (Student B)
- All issues C1-C5 (Student C)

**Frozen (Post-Sprint) Column (1 issue):**
- Issue A5: Model Retraining Docs

### How to move issues:
- Drag and drop between columns
- Or use the dropdown menu on each card

---

## Step 7: Pin Scope Freeze Notice

Create a pinned issue:

```bash
gh issue create \
  --title "🔒 Scope Freeze: No new features unless required to prevent demo failure" \
  --label "priority:must" \
  --body "$(cat .github/project-board/SCOPE_FREEZE_POLICY.md)" \
  --pin
```

Or manually:
1. Create an issue with title: "🔒 Scope Freeze Policy"
2. Copy content from `.github/project-board/SCOPE_FREEZE_POLICY.md`
3. Pin the issue (click "Pin issue" in the sidebar)

---

## Step 8: Configure Project Settings

### Project Description
Add to project description:
```
1-week sprint for final demo readiness. Focus: stability, polish, and trust.
⚠️ SCOPE FREEZE ACTIVE - No new features unless required to prevent demo failure.
```

### Project README
Add a README to the project with:
- Link to SCOPE_FREEZE_POLICY.md
- Link to SPRINT_ISSUES.md
- Team structure
- Sprint timeline

### Custom Fields (Optional)

Add custom fields to track:
- **Complexity** (Single Select): Small, Medium, Large
- **Sprint Day** (Number): 1-7
- **Blocked Reason** (Text): Why is this blocked?

---

## Step 9: Set Up Automation (Optional)

### GitHub Actions Workflow

Create `.github/workflows/project-automation.yml`:

```yaml
name: Project Automation

on:
  issues:
    types: [opened, labeled, closed]
  pull_request:
    types: [opened, closed]

jobs:
  auto-assign:
    runs-on: ubuntu-latest
    steps:
      - name: Auto-assign based on labels
        uses: actions/github-script@v6
        with:
          script: |
            if (context.payload.label.name === 'owner:A') {
              github.rest.issues.addAssignees({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                assignees: ['StudentA-Username']
              });
            }
            # Add similar blocks for owner:B and owner:C
```

---

## Step 10: Verify Setup

Checklist:
- [ ] Project created with correct name
- [ ] 7 columns in correct order
- [ ] 16 labels created (3 priority, 6 type, 3 owner, 3 status)
- [ ] 15 sprint issues created
- [ ] Issues have correct labels and owners
- [ ] 14 issues in "Ready" column
- [ ] 1 issue in "Frozen (Post-Sprint)" column
- [ ] Scope freeze policy pinned
- [ ] Project description updated

---

## Quick Start Commands

Run all setup commands at once:

```bash
# Navigate to repo
cd /path/to/sermon-translation-system-fyp

# Create labels
bash .github/project-board/create-labels.sh

# Create issues (after updating usernames)
bash .github/project-board/create-issues.sh

# Verify
gh issue list --label "priority:must"
gh issue list --label "priority:should"
gh issue list --label "priority:could"
```

---

## Troubleshooting

### Labels already exist
If labels exist, use `gh label edit` instead of `create`:
```bash
gh label edit "priority:must" --description "..." --color "..."
```

### Can't create project via CLI
Projects v2 may require web interface. Use the web UI steps above.

### Issues not appearing in project
Check project automation settings and manually add if needed.

---

## Next Steps

After setup:
1. Review all issues with team
2. Assign team members to their respective issues
3. Schedule daily standup meetings
4. Set sprint start/end dates
5. Begin work on "Ready" column issues

---

**Setup Time Estimate:** 30-45 minutes  
**Maintained By:** Project Lead  
**Last Updated:** January 11, 2026
