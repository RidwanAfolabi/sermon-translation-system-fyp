# Pilot Sprint Project Board

Welcome to the **Pilot Sprint – Official Demo Readiness** project board documentation.

## 📁 Contents

This directory contains all configuration, documentation, and setup guides for the 1-week pilot sprint.

| File | Description |
|------|-------------|
| **PROJECT_BOARD_SETUP.md** | Overview of project structure, columns, labels, and team roles |
| **SPRINT_ISSUES.md** | Detailed list of all 15 sprint issues with acceptance criteria |
| **LABELS.md** | Label definitions and creation commands |
| **SCOPE_FREEZE_POLICY.md** | Critical policy document - no new features unless demo-breaking |
| **SETUP_GUIDE.md** | Step-by-step instructions to create the GitHub Project |
| **README.md** | This file - navigation and quick reference |

---

## 🚀 Quick Start

### For Project Lead / Administrator

1. **Read** `SCOPE_FREEZE_POLICY.md` first ⚠️
2. **Follow** `SETUP_GUIDE.md` to create the GitHub Project
3. **Review** `SPRINT_ISSUES.md` with the team
4. **Assign** issues to team members
5. **Pin** the scope freeze policy as a project issue

### For Team Members

1. **Read** `SCOPE_FREEZE_POLICY.md` - understand sprint constraints
2. **Review** your assigned issues in `SPRINT_ISSUES.md`
3. **Clarify** acceptance criteria with project lead if needed
4. **Focus** on demo readiness, not perfection

---

## 📊 Sprint Overview

| Aspect | Details |
|--------|---------|
| **Sprint Name** | Pilot Sprint – Official Demo Readiness |
| **Duration** | 1 week |
| **Total Issues** | 15 (14 active + 1 frozen) |
| **Team Size** | 3 students (A, B, C) |
| **Focus** | Stability, polish, demo preparation |
| **Scope** | **FROZEN** ❄️ |

---

## 🏗️ Project Structure

### Columns (7)
1. Backlog
2. Ready
3. In Progress
4. Review / Test
5. Blocked
6. Done
7. Frozen (Post-Sprint)

### Labels (16)
- **Priority:** must, should, could
- **Type:** backend, frontend, infra, ux, docs, demo
- **Owner:** A, B, C
- **Status:** stability, polish, bug

---

## 👥 Team Responsibilities

### Student A: Core Systems & Reliability
- Graceful ASR handling
- Cache and buffering
- End-to-end safety checks
- Enhanced logging
- Model retraining docs (frozen)

### Student B: Frontend, UX & Demo Experience
- Bulk approve action
- Subtitle animations
- Visual design polish
- Skipped segment display fix
- Demo UI preparation

### Student C: Documentation, Evaluation & Stakeholders
- Masjid briefing documents
- Post-service analytics
- Demo scripts (5-min and 10-min)
- Stakeholder engagement plan
- Lab simulation organization

---

## 🎯 Priority Breakdown

### Must-Have (9 issues) 🔴
Critical for demo success - **MUST** be completed.

### Should-Have (5 issues) 🟡
Important but not critical - complete if time permits.

### Could-Have / Deferred (1 issue) 🟢
Explicitly deferred to post-sprint.

---

## 📋 Issue Summary

| ID | Title | Owner | Priority | Column |
|----|-------|-------|----------|--------|
| A1 | Graceful ASR Handling | A | must | Ready |
| A2 | Cache and Buffering | A | must | Ready |
| A3 | End-to-End Safety Check | A | must | Ready |
| A4 | Enhanced Logging | A | should | Ready |
| A5 | Model Retraining Docs | A | could | Frozen |
| B1 | Bulk Approve Action | B | must | Ready |
| B2 | Subtitle Animation | B | should | Ready |
| B3 | Visual Design Polish | B | should | Ready |
| B4 | Skipped Segment Fix | B | must | Ready |
| B5 | Demo UI Preparation | B | must | Ready |
| C1 | Masjid Briefing Docs | C | must | Ready |
| C2 | Post-Service Analytics | C | should | Ready |
| C3 | Demo Script | C | must | Ready |
| C4 | Stakeholder Engagement | C | should | Ready |
| C5 | Lab Simulation | C | must | Ready |

---

## ⚠️ Critical Reminders

### Scope Freeze 🔒
- **NO new features** unless required to prevent demo failure
- Focus on stability and polish
- Defer non-essential work

### Demo Success Criteria ✅
- System completes full demo cycle without crashes
- All priority:must issues resolved
- Lab simulation feedback addressed
- Demo scripts rehearsed and timed
- Stakeholder materials finalized

### Decision Framework 🤔
```
Is it fixing a broken feature? → ✅ Approve
Is it required for demo? → Evaluate
Is it nice to have? → ❌ Defer
```

---

## 🔗 Related Documentation

- [Main README](../../README.md) - System overview
- [System Design](../../docs/system_design_overview.md) - Architecture details
- [API Reference](../../docs/api_reference.md) - API endpoints
- [Contribution Guidelines](../../docs/contribution_guidelines.md) - Code standards

---

## 📞 Contact

**Project Lead:** Ridwan Afolabi  
📧 [ridwan.afolabi@student.aiu.edu.my](mailto:ridwan.afolabi@student.aiu.edu.my)  
🔗 [GitHub](https://github.com/RidwanAfolabi)

---

## 📅 Timeline

| Day | Focus | Key Deliverables |
|-----|-------|------------------|
| Day 1 | Setup & Planning | Labels created, issues assigned, team aligned |
| Day 2-3 | Core Development | Priority:must issues in progress |
| Day 4-5 | Testing & Polish | Lab simulation, feedback collection |
| Day 6 | Integration | End-to-end testing, bug fixes |
| Day 7 | Demo Prep | Final rehearsal, documentation review |

---

## 🏁 Sprint Success

Sprint is successful when:
- ✅ All 9 priority:must issues completed and tested
- ✅ Lab simulation conducted with positive feedback
- ✅ Demo scripts rehearsed and timed accurately
- ✅ System stable and demo-ready
- ✅ Stakeholder materials finalized
- ✅ Team confident in demo delivery

---

> **"We're not building the final system. We're proving the concept works."**

---

**Last Updated:** January 11, 2026  
**Sprint Status:** 🔴 ACTIVE  
**Scope Status:** ❄️ FROZEN
