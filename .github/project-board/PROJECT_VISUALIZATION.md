# Pilot Sprint Project Board - Visual Overview

## 🎯 Project: Pilot Sprint – Official Demo Readiness

**Duration:** 1 week  
**Team:** 3 students (A, B, C)  
**Status:** ❄️ SCOPE FROZEN

---

## 📊 Project Board Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PILOT SPRINT – OFFICIAL DEMO READINESS                    │
│         1-week sprint for final demo readiness and controlled deployment     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬────────────┬────────────┬──────────┬────────┬───────────┐
│ Backlog  │  Ready   │In Progress │Review/Test │ Blocked  │  Done  │  Frozen   │
│          │          │            │            │          │        │(Post-Spri)│
├──────────┼──────────┼────────────┼────────────┼──────────┼────────┼───────────┤
│          │ A1 🔴   │            │            │          │        │  A5 🟢   │
│          │ A2 🔴   │            │            │          │        │           │
│          │ A3 🔴   │            │            │          │        │           │
│          │ A4 🟡   │            │            │          │        │           │
│          │ B1 🔴   │            │            │          │        │           │
│          │ B2 🟡   │            │            │          │        │           │
│          │ B3 🟡   │            │            │          │        │           │
│          │ B4 🔴   │            │            │          │        │           │
│          │ B5 🔴   │            │            │          │        │           │
│          │ C1 🔴   │            │            │          │        │           │
│          │ C2 🟡   │            │            │          │        │           │
│          │ C3 🔴   │            │            │          │        │           │
│          │ C4 🟡   │            │            │          │        │           │
│          │ C5 🔴   │            │            │          │        │           │
└──────────┴──────────┴────────────┴────────────┴──────────┴────────┴───────────┘

Legend:
🔴 priority:must   🟡 priority:should   🟢 priority:could/deferred
```

---

## 🏷️ Labels Taxonomy

### Priority Labels (3)
```
🔴 priority:must     - Critical for demo success, MUST be completed
🟡 priority:should   - Important but not critical, complete if time permits
🟢 priority:could    - Nice to have, defer if needed
```

### Type Labels (6)
```
🟣 backend    - Backend API, database, core logic
🔵 frontend   - UI, UX, display interfaces
🔷 infra      - Infrastructure, deployment, configuration
💠 ux         - User experience improvements
📘 docs       - Documentation, guides, briefings
🎬 demo       - Demo-specific preparation
```

### Owner Labels (3)
```
👤 owner:A    - Student A (Core backend, ASR, alignment, reliability)
👤 owner:B    - Student B (Frontend, UX, live display, admin workflows)
👤 owner:C    - Student C (Documentation, analytics, stakeholder engagement)
```

### Status Labels (3)
```
🛡️ stability  - System reliability and error handling
✨ polish     - UI/UX refinements and visual improvements
🐛 bug        - Bug fixes
```

---

## 👥 Team Distribution

### Student A: Core Systems & Reliability (5 issues)
```
┌─────────────────────────────────────────────────┐
│ A1 🔴 Graceful ASR Handling          [Ready]   │
│ A2 🔴 Cache and Buffering            [Ready]   │
│ A3 🔴 End-to-End Safety Check        [Ready]   │
│ A4 🟡 Enhanced Logging               [Ready]   │
│ A5 🟢 Model Retraining Docs          [Frozen]  │
└─────────────────────────────────────────────────┘
Focus: Backend stability and reliability
```

### Student B: Frontend, UX & Demo Experience (5 issues)
```
┌─────────────────────────────────────────────────┐
│ B1 🔴 Bulk Approve Action            [Ready]   │
│ B2 🟡 Subtitle Animation             [Ready]   │
│ B3 🟡 Visual Design Polish           [Ready]   │
│ B4 🔴 Skipped Segment Fix            [Ready]   │
│ B5 🔴 Demo UI Preparation            [Ready]   │
└─────────────────────────────────────────────────┘
Focus: User experience and demo readiness
```

### Student C: Documentation, Evaluation & Stakeholders (5 issues)
```
┌─────────────────────────────────────────────────┐
│ C1 🔴 Masjid Briefing Docs           [Ready]   │
│ C2 🟡 Post-Service Analytics         [Ready]   │
│ C3 🔴 Demo Script                    [Ready]   │
│ C4 🟡 Stakeholder Engagement         [Ready]   │
│ C5 🔴 Lab Simulation                 [Ready]   │
└─────────────────────────────────────────────────┘
Focus: Documentation and stakeholder engagement
```

---

## 📈 Sprint Metrics

### Issue Count by Priority
```
Priority        Count    Percentage    Status
────────────────────────────────────────────────
priority:must     9       60%         🔴 Critical
priority:should   5       33%         🟡 Important
priority:could    1        7%         🟢 Deferred
────────────────────────────────────────────────
Total            15      100%
```

### Issue Count by Type
```
Type         Count    Issues
──────────────────────────────────────
backend        4      A1, A2, A3, A4
frontend       5      B1, B2, B3, B4, B5
docs           8      A5, C1, C2, C3, C4, C5
demo           5      B5, C1, C2, C3, C5
ux             2      B1, B3
stability      4      A1, A2, A3, A4
polish         2      B2, B3
bug            1      B4
```

### Initial Column Distribution
```
Column                Issues    Percentage
─────────────────────────────────────────
Backlog                 0         0%
Ready                  14        93%
In Progress             0         0%
Review / Test           0         0%
Blocked                 0         0%
Done                    0         0%
Frozen (Post-Sprint)    1         7%
─────────────────────────────────────────
Total                  15       100%
```

---

## 🎯 Sprint Workflow

```
┌──────────────┐
│   BACKLOG    │  Tasks identified but not prioritized
└──────┬───────┘
       │
       ↓
┌──────────────┐
│    READY     │  Prioritized, ready to be picked up (14 issues start here)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ IN PROGRESS  │  Currently being worked on
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ REVIEW/TEST  │  Completed, awaiting review or testing
└──────┬───────┘
       │
       ├────────────────┐
       ↓                ↓
┌──────────────┐  ┌──────────────┐
│   BLOCKED    │  │     DONE     │  Completed and verified
└──────────────┘  └──────────────┘
                         │
                         ↓
                  ┌──────────────┐
                  │    FROZEN    │  Explicitly deferred (1 issue starts here)
                  └──────────────┘
```

---

## 🎬 Demo Success Criteria

Sprint is successful when:

```
✅ System Stability
   ├─ No crashes during full demo cycle
   ├─ Graceful handling of ASR drops
   ├─ Stable WebSocket connections
   └─ Proper error logging

✅ Demo Readiness
   ├─ Demo scripts prepared (5-min and 10-min)
   ├─ UI polished and professional
   ├─ Masjid briefing documents finalized
   └─ Lab simulation completed with feedback

✅ Core Functionality
   ├─ Upload → Vet → Live stream pipeline works
   ├─ Subtitle display accurate and smooth
   ├─ Skipped segments handled correctly
   └─ Bulk approval feature working

✅ Stakeholder Preparation
   ├─ Engagement plan documented
   ├─ Analytics ready for post-demo review
   └─ Team confident in delivery
```

---

## 📅 Suggested Timeline

```
Day 1-2: FOUNDATION
├─ Create project board and labels
├─ Assign issues to team members
├─ Begin priority:must issues
└─ Team alignment meeting

Day 3-4: CORE DEVELOPMENT
├─ Focus on backend stability (A1-A3)
├─ Implement frontend features (B1, B4)
├─ Draft documentation (C1, C3)
└─ Daily standup check-ins

Day 5: INTEGRATION & TESTING
├─ End-to-end pipeline testing (A3)
├─ Lab simulation (C5)
├─ Collect feedback
└─ Address critical bugs

Day 6: POLISH & REFINEMENT
├─ UI/UX improvements (B2, B3)
├─ Enhanced logging (A4)
├─ Analytics setup (C2)
└─ Stakeholder engagement prep (C4)

Day 7: FINAL PREPARATION
├─ Demo rehearsal with full team
├─ Documentation review
├─ Final bug fixes
└─ Go/No-Go decision
```

---

## ⚠️ Critical Constraints

### Scope Freeze Policy
```
❌ NO new features unless required to prevent demo failure
❌ NO architecture changes
❌ NO scope creep or gold-plating
❌ NO "while we're at it" additions

✅ Bug fixes for existing functionality
✅ Polish and refinement of current features
✅ Demo preparation and documentation
✅ Stability and error handling improvements
```

### Decision Framework
```
┌─────────────────────────────────────┐
│ Is this fixing a broken feature?    │
└───────────┬─────────────────────────┘
            │
    ┌───────┴────────┐
    │ YES            │ NO
    ↓                ↓
✅ APPROVE     Is it required for demo?
                     │
              ┌──────┴──────┐
              │ YES         │ NO
              ↓             ↓
        Can we work      ❌ DEFER
        around it?      to post-sprint
              │
       ┌──────┴──────┐
       │ YES         │ NO
       ↓             ↓
   ❌ DEFER      ⚠️ ESCALATE
   (workaround)   to team lead
```

---

## 🔍 Issue Details Summary

### Must-Have Issues (9) 🔴

| ID | Title | Owner | Type | Focus |
|----|-------|-------|------|-------|
| A1 | Graceful ASR Handling | A | backend, stability | System doesn't crash on ASR drops |
| A2 | Cache and Buffering | A | backend, stability | Smooth subtitle delivery |
| A3 | End-to-End Safety | A | backend, stability | Full pipeline tested |
| B1 | Bulk Approve Action | B | frontend, ux | Streamline vetting workflow |
| B4 | Skipped Segment Fix | B | frontend, bug | Display skipped segments correctly |
| B5 | Demo UI Preparation | B | frontend, demo | All UIs demo-ready |
| C1 | Masjid Briefing Docs | C | docs, demo | Committee understands system |
| C3 | Demo Script | C | docs, demo | 5-min and 10-min versions |
| C5 | Lab Simulation | C | docs, demo | Test with Malay speakers |

### Should-Have Issues (5) 🟡

| ID | Title | Owner | Type | Focus |
|----|-------|-------|------|-------|
| A4 | Enhanced Logging | A | backend, stability | Better debugging and analytics |
| B2 | Subtitle Animation | B | frontend, polish | Professional fade-in effects |
| B3 | Visual Design Polish | B | frontend, polish, ux | Less generic, more masjid-appropriate |
| C2 | Post-Service Analytics | C | backend, docs, demo | Track system performance |
| C4 | Stakeholder Engagement | C | docs, demo | VC, Dean, Committee outreach |

### Deferred Issues (1) 🟢

| ID | Title | Owner | Type | Status |
|----|-------|-------|------|--------|
| A5 | Model Retraining Docs | A | backend, docs | Frozen - Post-Sprint |

---

## 📞 Resources

- **Project Board Docs:** `.github/project-board/`
- **Scope Freeze Policy:** `.github/project-board/SCOPE_FREEZE_POLICY.md`
- **Sprint Issues:** `.github/project-board/SPRINT_ISSUES.md`
- **Setup Guide:** `.github/project-board/SETUP_GUIDE.md`
- **Labels Reference:** `.github/project-board/LABELS.md`

---

## 🎯 Sprint Motto

> **"We're not building the final system. We're proving the concept works."**
> 
> **"Perfect is the enemy of done."**
> 
> **"Focus on demo readiness, not perfection."**

---

**Last Updated:** January 11, 2026  
**Sprint Status:** 🔴 ACTIVE  
**Scope:** ❄️ FROZEN  
**Team:** Ready ✅  
**Goal:** Demo Success 🎯
