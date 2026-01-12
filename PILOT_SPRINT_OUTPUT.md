# Pilot Sprint Project Board - Complete Output

This document provides the complete output for the "Pilot Sprint – Official Demo Readiness" GitHub Project setup as requested.

---

## 1. PROJECT STRUCTURE

### Project Name
**Pilot Sprint – Official Demo Readiness**

### Description
1-week sprint for final demo readiness - stabilization, polish, and trust. Core system is fully implemented and live-tested. Focus on preparing for official pilot demo and controlled masjid deployment.

### Columns (7 total, in order)

| # | Column Name | Purpose |
|---|-------------|---------|
| 1 | **Backlog** | Tasks identified but not yet prioritized for this sprint |
| 2 | **Ready** | Tasks ready to be picked up and must be done this sprint |
| 3 | **In Progress** | Tasks currently being worked on |
| 4 | **Review / Test** | Tasks completed and awaiting review or testing |
| 5 | **Blocked** | Tasks that cannot proceed due to dependencies or issues |
| 6 | **Done** | Tasks completed and verified |
| 7 | **Frozen (Post-Sprint)** | Tasks explicitly deferred to post-demo phase |

---

## 2. LABELS CREATED (16 total)

### Priority Labels (3)

| Label | Color | Description |
|-------|-------|-------------|
| `priority:must` | `#d73a4a` (red) | Critical for demo success, must be completed |
| `priority:should` | `#fbca04` (yellow) | Important but not critical, complete if time permits |
| `priority:could` | `#0e8a16` (green) | Nice to have, defer if needed |

### Type Labels (6)

| Label | Color | Description |
|-------|-------|-------------|
| `backend` | `#5319e7` (purple) | Backend API, database, core logic |
| `frontend` | `#1d76db` (blue) | UI, UX, display interfaces |
| `infra` | `#0052cc` (dark blue) | Infrastructure, deployment, configuration |
| `ux` | `#c5def5` (light blue) | User experience improvements |
| `docs` | `#0075ca` (blue) | Documentation, guides, briefings |
| `demo` | `#ff6b6b` (coral) | Demo-specific preparation |

### Owner Labels (3)

| Label | Color | Description |
|-------|-------|-------------|
| `owner:A` | `#bfdadc` (light cyan) | Student A (Core backend, ASR, alignment, reliability) |
| `owner:B` | `#c2e0c6` (light green) | Student B (Frontend, UX, live display, admin workflows) |
| `owner:C` | `#f9d0c4` (light peach) | Student C (Documentation, analytics, stakeholder engagement) |

### Status Labels (3)

| Label | Color | Description |
|-------|-------|-------------|
| `stability` | `#d4c5f9` (light purple) | System reliability and error handling |
| `polish` | `#e99695` (light red) | UI/UX refinements and visual improvements |
| `bug` | `#d73a4a` (red) | Bug fixes |

---

## 3. ISSUES CREATED (15 total)

### Student A: Core Systems & Reliability (5 issues)

#### Issue A1: Graceful ASR Handling
- **Title:** Implement graceful handling when ASR drops or pauses mid-sermon
- **Owner:** Student A
- **Labels:** `owner:A`, `backend`, `priority:must`, `stability`
- **Initial Column:** Ready
- **Description:** Ensure the system handles gracefully when ASR drops or pauses during live sermon delivery without crashing or displaying incorrect subtitles.
- **Acceptance Criteria:**
  - System detects when ASR stream stops or pauses
  - WebSocket connections remain stable during ASR gaps
  - Subtitle display shows appropriate state (waiting/reconnecting)
  - No subtitle duplication or misalignment after ASR resumes
  - Error logging captures ASR interruptions with timestamps
  - Tested with simulated ASR drops (5-10 second gaps)

#### Issue A2: Cache and Buffer Implementation
- **Title:** Implement/verify cache and buffering for alignment and subtitle delivery
- **Owner:** Student A
- **Labels:** `owner:A`, `backend`, `priority:must`, `stability`
- **Initial Column:** Ready
- **Description:** Verify and enhance caching/buffering mechanisms to ensure smooth subtitle delivery even during temporary alignment delays or processing spikes.
- **Acceptance Criteria:**
  - Segment cache properly stores recent alignment results
  - Buffer handles out-of-order segments gracefully
  - Cache eviction policy prevents memory overflow
  - Buffering reduces WebSocket stuttering during heavy load
  - Cache hit rate logged for monitoring
  - Tested with rapid speech and long pauses

#### Issue A3: End-to-End Pipeline Safety Check
- **Title:** Cross-check entire end-to-end pipeline for demo safety
- **Owner:** Student A
- **Labels:** `owner:A`, `backend`, `priority:must`, `stability`
- **Initial Column:** Ready
- **Description:** Perform comprehensive end-to-end testing of the entire pipeline (upload → vetting → live streaming) to identify and fix any potential demo-breaking issues.
- **Acceptance Criteria:**
  - Upload sermon → segments created correctly
  - Vetting dashboard → changes persist to database
  - Live streaming → subtitles display accurately
  - WebSocket disconnect/reconnect handled gracefully
  - All error states return informative messages
  - Demo script scenarios tested successfully
  - Document any known limitations or edge cases

#### Issue A4: Enhanced Logging System
- **Title:** Ensure logs are correctly written with timestamps and segment IDs
- **Owner:** Student A
- **Labels:** `owner:A`, `backend`, `priority:should`, `stability`
- **Initial Column:** Ready
- **Description:** Verify and enhance logging across the system to capture essential information for debugging and post-demo analysis.
- **Acceptance Criteria:**
  - All logs include ISO 8601 timestamps
  - Segment IDs logged for alignment events
  - ASR transcription confidence scores captured
  - Alignment match scores and thresholds logged
  - WebSocket connection events tracked
  - Log rotation configured to prevent disk overflow
  - Log levels appropriate (DEBUG/INFO/WARNING/ERROR)
  - Sample log review shows clear event traceability

#### Issue A5: Model Retraining Scaffold Documentation
- **Title:** Document model retraining as scaffold for future work
- **Owner:** Student A
- **Labels:** `owner:A`, `backend`, `priority:could`, `docs`
- **Initial Column:** Frozen (Post-Sprint)
- **Description:** Keep model retraining infrastructure as documented future work rather than implementing it for this sprint.
- **Acceptance Criteria:**
  - Document existing retraining code structure
  - Add README in `ml_pipeline/retraining/` explaining purpose
  - List required steps for future implementation
  - Note current limitations and dependencies
  - No active implementation during sprint
  - Clearly marked as post-demo enhancement

---

### Student B: Frontend, UX & Demo Experience (5 issues)

#### Issue B1: Bulk Approve Action
- **Title:** Add bulk approve action for sermon/segment verification
- **Owner:** Student B
- **Labels:** `owner:B`, `frontend`, `priority:must`, `ux`
- **Initial Column:** Ready
- **Description:** Add functionality to approve multiple sermon segments at once in the vetting dashboard to streamline pre-service preparation.
- **Acceptance Criteria:**
  - Checkbox selection for multiple segments
  - "Approve Selected" button with confirmation dialog
  - Bulk approval updates database efficiently
  - Loading state shown during bulk operation
  - Success/error feedback displayed clearly
  - Action logged with user identifier and timestamp
  - Works for 50+ segments without performance issues
  - Tested with various selection sizes (1, 10, 50+ segments)

#### Issue B2: Subtitle Display Animation
- **Title:** Add subtle typing/fade-in animation for live subtitle display
- **Owner:** Student B
- **Labels:** `owner:B`, `frontend`, `priority:should`, `polish`
- **Initial Column:** Ready
- **Description:** Enhance the live subtitle display with subtle, professional animations to improve visual quality and perceived smoothness.
- **Acceptance Criteria:**
  - Fade-in animation when new subtitle appears (0.3-0.5s)
  - Smooth transition between subtitles
  - Optional typing effect for character-by-character reveal
  - Animation does not delay actual subtitle display
  - Performance tested on target display hardware
  - Animation can be disabled via config if needed
  - Maintains readability during animations

#### Issue B3: Visual Design Polish
- **Title:** Reduce "generic AI dashboard" feel; improve visual calmness
- **Owner:** Student B
- **Labels:** `owner:B`, `frontend`, `priority:should`, `polish`, `ux`
- **Initial Column:** Ready
- **Description:** Refine the UI design to look more professional and purpose-built for masjid use, reducing generic template aesthetics.
- **Acceptance Criteria:**
  - Refined color palette (consider Islamic design patterns)
  - Consistent spacing and typography throughout
  - Reduced visual clutter in admin dashboard
  - Improved button and form styling
  - Professional header/branding
  - Calm, respectful visual tone suitable for religious context
  - Before/after screenshots documented
  - Feedback from at least 2 team members

#### Issue B4: Skipped Segment Display Fix
- **Title:** Ensure skipped segments display correctly before next match
- **Owner:** Student B
- **Labels:** `owner:B`, `frontend`, `priority:must`, `bug`
- **Initial Column:** Ready
- **Description:** Fix any issues where skipped segments don't display correctly when ASR jumps ahead in the sermon script.
- **Acceptance Criteria:**
  - Skipped segments marked visually in real-time
  - Next matched segment displays without showing skipped ones
  - Segment order maintained in display
  - Skip event logged for post-service analysis
  - Tested with intentional skips in demo scenarios
  - No duplicate subtitle display
  - Clear visual indicator when segments are skipped (optional overlay)

#### Issue B5: Demo UI Preparation
- **Title:** Prepare UI for live lab simulation and demo replay
- **Owner:** Student B
- **Labels:** `owner:B`, `frontend`, `priority:must`, `demo`
- **Initial Column:** Ready
- **Description:** Ensure all frontend interfaces are optimized for demo presentation, lab simulation, and stakeholder viewing.
- **Acceptance Criteria:**
  - All interfaces load without console errors
  - Responsive design works on demo display resolution
  - Demo mode (if applicable) can be toggled
  - Sample sermon data pre-loaded for quick demo
  - Error states display user-friendly messages
  - WebSocket reconnection UI tested
  - All buttons and features clearly labeled
  - Screenshots/screen recording tested and reviewed

---

### Student C: Documentation, Evaluation & Stakeholders (5 issues)

#### Issue C1: Masjid Briefing Documents
- **Title:** Finalize masjid briefing documents (phases, equipment, responsibilities)
- **Owner:** Student C
- **Labels:** `owner:C`, `docs`, `priority:must`, `demo`
- **Initial Column:** Ready
- **Description:** Create comprehensive briefing documents for masjid committee explaining the system, deployment phases, equipment needs, and responsibilities.
- **Acceptance Criteria:**
  - System overview (non-technical language)
  - Deployment phases timeline (pre-service, live, post-service)
  - Equipment requirements list (microphone, display, network)
  - Roles and responsibilities (imam, technician, administrator)
  - Pre-service checklist for sermon preparation
  - Troubleshooting guide for common issues
  - Contact information for technical support
  - PDF format, professionally formatted
  - Reviewed by at least one stakeholder or team member

#### Issue C2: Post-Service Analytics
- **Title:** Add light post-service analytics (counts, latency; CSV OK)
- **Owner:** Student C
- **Labels:** `owner:C`, `backend`, `docs`, `priority:should`, `demo`
- **Initial Column:** Ready
- **Description:** Implement simple analytics to track system performance during sermons for post-service review and stakeholder reporting.
- **Acceptance Criteria:**
  - Segment count (total, matched, skipped, unmatched)
  - Average alignment latency
  - ASR confidence scores (min, max, average)
  - WebSocket connection stability metrics
  - CSV export functionality from admin dashboard
  - Analytics viewable in simple dashboard or report
  - Data collected automatically during live streaming
  - Sample report generated from test sermon

#### Issue C3: Demo Script Preparation
- **Title:** Prepare demo script (5-minute and 10-minute versions)
- **Owner:** Student C
- **Labels:** `owner:C`, `docs`, `priority:must`, `demo`
- **Initial Column:** Ready
- **Description:** Create detailed demo scripts for 5-minute and 10-minute presentations to different stakeholder groups.
- **Acceptance Criteria:**
  - 5-minute version (elevator pitch for executives)
  - 10-minute version (detailed walkthrough for committee)
  - Introduction: Problem statement and motivation
  - Demo flow: Upload → Vet → Live stream → Review
  - Key features highlighted
  - Talking points for each screen
  - Backup plan if technical issues occur
  - Q&A preparation (anticipated questions)
  - Rehearsed with team at least once
  - Timing verified with stopwatch

#### Issue C4: Stakeholder Engagement Plan
- **Title:** Plan stakeholder engagement (VC, Dean, Masjid Committee)
- **Owner:** Student C
- **Labels:** `owner:C`, `docs`, `priority:should`, `demo`
- **Initial Column:** Ready
- **Description:** Develop engagement strategy and schedule for key stakeholders including Vice Chancellor, Dean, and Masjid Committee.
- **Acceptance Criteria:**
  - Stakeholder list with contact information
  - Engagement approach tailored per stakeholder group
  - Meeting request templates prepared
  - Demo invitation emails drafted
  - Feedback collection forms created
  - Post-demo follow-up plan
  - Timeline for engagement activities
  - Risk mitigation for scheduling conflicts

#### Issue C5: Lab Simulation and Feedback Collection
- **Title:** Organize lab simulation with Malay speakers and collect feedback
- **Owner:** Student C
- **Labels:** `owner:C`, `docs`, `priority:must`, `demo`
- **Initial Column:** Ready
- **Description:** Coordinate lab simulation session with Malay speakers to test the system in controlled environment and gather feedback before pilot.
- **Acceptance Criteria:**
  - Recruit 2-3 Malay speakers for simulation
  - Prepare test sermon script (5-10 minutes)
  - Schedule lab session in advance
  - Setup recording/notes system for feedback
  - Conduct simulation: upload → vet → live stream
  - Collect feedback via survey or interview
  - Document technical issues encountered
  - Compile feedback report with recommendations
  - Share findings with Students A & B
  - Iterate on critical issues before demo

---

## 4. INITIAL COLUMN PLACEMENT

### Ready Column (14 issues)
All priority:must and priority:should issues start here, ready to be worked on:
- A1: Graceful ASR Handling
- A2: Cache and Buffering
- A3: End-to-End Safety Check
- A4: Enhanced Logging
- B1: Bulk Approve Action
- B2: Subtitle Animation
- B3: Visual Design Polish
- B4: Skipped Segment Fix
- B5: Demo UI Preparation
- C1: Masjid Briefing Docs
- C2: Post-Service Analytics
- C3: Demo Script
- C4: Stakeholder Engagement
- C5: Lab Simulation

### Frozen (Post-Sprint) Column (1 issue)
Explicitly deferred until after pilot demo:
- A5: Model Retraining Scaffold Documentation

---

## 5. PINNED NOTE: SCOPE FREEZE POLICY

A pinned issue should be created with the following content:

### 🔒 Scope Freeze: No New Features Unless Required to Prevent Demo Failure

**This is NOT a greenfield build. This is stabilization, polish, and demo readiness.**

#### Sprint Constraints
- **Sprint Length:** 1 week only
- **Scope Status:** FROZEN ❄️
- **New Features:** Prohibited unless they directly prevent demo failure
- **Non-Essential Work:** Must be explicitly deferred to post-sprint

#### What IS In Scope ✅
1. Bug fixes for broken functionality
2. Polish & refinement of existing features
3. Demo preparation and documentation
4. Stability enhancements and error handling

#### What IS NOT In Scope ❌
1. New features (unless demo-breaking)
2. Architecture changes
3. Scope creep or "while we're at it" additions
4. Research & exploration (e.g., model retraining)

#### Demo Failure Criteria
New work is ONLY justified if its absence would cause:
1. Complete system breakdown
2. Data loss or corruption
3. Security vulnerability
4. Stakeholder deal-breaker

#### Decision Framework
```
Is this fixing a broken feature? → ✅ Approve
Is it required for demo? → Evaluate carefully
Is it nice to have? → ❌ Defer to post-sprint
```

Full policy: `.github/project-board/SCOPE_FREEZE_POLICY.md`

---

## 6. SUMMARY STATISTICS

### Issue Distribution

| Metric | Count |
|--------|-------|
| **Total Issues** | 15 |
| **Priority: Must** | 9 (60%) |
| **Priority: Should** | 5 (33%) |
| **Priority: Could** | 1 (7%) |
| **Student A Issues** | 5 |
| **Student B Issues** | 5 |
| **Student C Issues** | 5 |
| **Initially Ready** | 14 (93%) |
| **Initially Frozen** | 1 (7%) |

### Label Distribution

| Category | Count |
|----------|-------|
| **Priority Labels** | 3 |
| **Type Labels** | 6 |
| **Owner Labels** | 3 |
| **Status Labels** | 3 |
| **Total Labels** | 16 |

---

## 7. SETUP FILES CREATED

All documentation and setup files are located in `.github/project-board/`:

1. **PROJECT_BOARD_SETUP.md** - Project overview and structure
2. **SPRINT_ISSUES.md** - Complete issue descriptions with acceptance criteria (16,966 characters)
3. **LABELS.md** - Label definitions and creation commands (5,062 characters)
4. **SCOPE_FREEZE_POLICY.md** - Critical sprint policy document (6,910 characters)
5. **SETUP_GUIDE.md** - Step-by-step setup instructions (11,515 characters)
6. **PROJECT_VISUALIZATION.md** - Visual overview and ASCII diagrams (11,401 characters)
7. **README.md** - Directory navigation and quick reference (5,618 characters)
8. **create-labels.sh** - Automated label creation script (executable)

**Total Documentation:** ~60,000 characters across 8 files

---

## 8. NEXT STEPS FOR EXECUTION

To actually create the GitHub Project, labels, and issues:

1. **Authenticate GitHub CLI:**
   ```bash
   gh auth login
   ```

2. **Navigate to repository:**
   ```bash
   cd /path/to/sermon-translation-system-fyp
   ```

3. **Create labels:**
   ```bash
   bash .github/project-board/create-labels.sh
   ```

4. **Create GitHub Project (web UI recommended):**
   - Go to https://github.com/RidwanAfolabi/sermon-translation-system-fyp
   - Click "Projects" tab → "New project"
   - Choose "Board" template
   - Name: "Pilot Sprint – Official Demo Readiness"
   - Configure columns as documented

5. **Create issues:**
   - Use templates from `SPRINT_ISSUES.md`
   - Assign owners and labels as specified
   - Add issues to project

6. **Pin scope freeze notice:**
   - Create issue with content from `SCOPE_FREEZE_POLICY.md`
   - Pin to project board

---

## 9. TEAM ALIGNMENT

### Student A Responsibilities
- Backend stability and reliability
- ASR handling and alignment
- System safety and logging
- 3 must-have, 1 should-have, 1 deferred

### Student B Responsibilities
- Frontend polish and UX
- Live display features
- Demo interface preparation
- 3 must-have, 2 should-have

### Student C Responsibilities
- Documentation and stakeholder materials
- Demo scripts and presentation
- Lab simulation and feedback
- Analytics and evaluation
- 3 must-have, 2 should-have

---

## ✅ DELIVERABLES COMPLETED

This implementation provides:

✅ Complete project board structure definition  
✅ All 7 columns documented in order  
✅ All 16 labels defined with colors and descriptions  
✅ All 15 sprint issues created with full details  
✅ Acceptance criteria for every issue  
✅ Initial column placement specified  
✅ Scope freeze policy clearly documented  
✅ Setup automation scripts created  
✅ Comprehensive documentation (8 files)  
✅ Team responsibilities clearly defined  
✅ No new features suggested - focus on stability and demo readiness  

**Status:** ✅ **COMPLETE AND READY FOR EXECUTION**

---

**Created:** January 11, 2026  
**Repository:** RidwanAfolabi/sermon-translation-system-fyp  
**Branch:** copilot/prepare-pilot-demo-sprint  
**Documentation Location:** `.github/project-board/`
