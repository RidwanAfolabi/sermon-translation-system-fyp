# Sprint Issues - Pilot Demo Readiness

## Overview
This document contains all issues for the 1-week pilot sprint. Each issue includes:
- Issue title
- Owner assignment
- Labels
- Acceptance criteria
- Initial column placement

---

## Student A: Core Systems & Reliability

### Issue A1: Graceful ASR Handling During Pauses
**Title:** Implement graceful handling when ASR drops or pauses mid-sermon  
**Owner:** Student A  
**Labels:** `owner:A`, `backend`, `priority:must`, `stability`  
**Initial Column:** Ready

**Description:**
Ensure the system handles gracefully when ASR drops or pauses during live sermon delivery without crashing or displaying incorrect subtitles.

**Acceptance Criteria:**
- [ ] System detects when ASR stream stops or pauses
- [ ] WebSocket connections remain stable during ASR gaps
- [ ] Subtitle display shows appropriate state (waiting/reconnecting)
- [ ] No subtitle duplication or misalignment after ASR resumes
- [ ] Error logging captures ASR interruptions with timestamps
- [ ] Tested with simulated ASR drops (5-10 second gaps)

**Technical Context:**
- Location: `ml_pipeline/speech_recognition/whisper_listener.py`
- Related: `backend/api/routes/live_routes.py` (WebSocket handling)

---

### Issue A2: Cache and Buffer Implementation for Alignment
**Title:** Implement/verify cache and buffering for alignment and subtitle delivery  
**Owner:** Student A  
**Labels:** `owner:A`, `backend`, `priority:must`, `stability`  
**Initial Column:** Ready

**Description:**
Verify and enhance caching/buffering mechanisms to ensure smooth subtitle delivery even during temporary alignment delays or processing spikes.

**Acceptance Criteria:**
- [ ] Segment cache properly stores recent alignment results
- [ ] Buffer handles out-of-order segments gracefully
- [ ] Cache eviction policy prevents memory overflow
- [ ] Buffering reduces WebSocket stuttering during heavy load
- [ ] Cache hit rate logged for monitoring
- [ ] Tested with rapid speech and long pauses

**Technical Context:**
- Location: `ml_pipeline/alignment_module/aligner.py`
- Related: `backend/api/utils/broadcast_manager.py`

---

### Issue A3: End-to-End Pipeline Safety Check
**Title:** Cross-check entire end-to-end pipeline for demo safety  
**Owner:** Student A  
**Labels:** `owner:A`, `backend`, `priority:must`, `stability`  
**Initial Column:** Ready

**Description:**
Perform comprehensive end-to-end testing of the entire pipeline (upload → vetting → live streaming) to identify and fix any potential demo-breaking issues.

**Acceptance Criteria:**
- [ ] Upload sermon → segments created correctly
- [ ] Vetting dashboard → changes persist to database
- [ ] Live streaming → subtitles display accurately
- [ ] WebSocket disconnect/reconnect handled gracefully
- [ ] All error states return informative messages
- [ ] Demo script scenarios tested successfully
- [ ] Document any known limitations or edge cases

**Technical Context:**
- Full system integration test
- All components: backend API, database, ASR, alignment, WebSocket

---

### Issue A4: Enhanced Logging System
**Title:** Ensure logs are correctly written with timestamps and segment IDs  
**Owner:** Student A  
**Labels:** `owner:A`, `backend`, `priority:should`, `stability`  
**Initial Column:** Ready

**Description:**
Verify and enhance logging across the system to capture essential information for debugging and post-demo analysis.

**Acceptance Criteria:**
- [ ] All logs include ISO 8601 timestamps
- [ ] Segment IDs logged for alignment events
- [ ] ASR transcription confidence scores captured
- [ ] Alignment match scores and thresholds logged
- [ ] WebSocket connection events tracked
- [ ] Log rotation configured to prevent disk overflow
- [ ] Log levels appropriate (DEBUG/INFO/WARNING/ERROR)
- [ ] Sample log review shows clear event traceability

**Technical Context:**
- Locations: All Python modules
- Configuration: Python logging module setup
- Consider: Structured logging (JSON) for analytics

---

### Issue A5: Model Retraining Scaffold Documentation
**Title:** Document model retraining as scaffold for future work  
**Owner:** Student A  
**Labels:** `owner:A`, `backend`, `priority:could`, `docs`  
**Initial Column:** Frozen (Post-Sprint)

**Description:**
Keep model retraining infrastructure as documented future work rather than implementing it for this sprint.

**Acceptance Criteria:**
- [ ] Document existing retraining code structure
- [ ] Add README in `ml_pipeline/retraining/` explaining purpose
- [ ] List required steps for future implementation
- [ ] Note current limitations and dependencies
- [ ] No active implementation during sprint
- [ ] Clearly marked as post-demo enhancement

**Technical Context:**
- Location: `ml_pipeline/retraining/fine_tune.py`
- Status: Scaffold only, not for pilot demo

---

## Student B: Frontend, UX & Demo Experience

### Issue B1: Bulk Approve Action
**Title:** Add bulk approve action for sermon/segment verification  
**Owner:** Student B  
**Labels:** `owner:B`, `frontend`, `priority:must`, `ux`  
**Initial Column:** Ready

**Description:**
Add functionality to approve multiple sermon segments at once in the vetting dashboard to streamline pre-service preparation.

**Acceptance Criteria:**
- [ ] Checkbox selection for multiple segments
- [ ] "Approve Selected" button with confirmation dialog
- [ ] Bulk approval updates database efficiently
- [ ] Loading state shown during bulk operation
- [ ] Success/error feedback displayed clearly
- [ ] Action logged with user identifier and timestamp
- [ ] Works for 50+ segments without performance issues
- [ ] Tested with various selection sizes (1, 10, 50+ segments)

**Technical Context:**
- Location: `frontend/vetting-dashboard/`
- API: PATCH `/sermon/segment/bulk` (may need to add)

---

### Issue B2: Subtitle Display Animation
**Title:** Add subtle typing/fade-in animation for live subtitle display  
**Owner:** Student B  
**Labels:** `owner:B`, `frontend`, `priority:should`, `polish`  
**Initial Column:** Ready

**Description:**
Enhance the live subtitle display with subtle, professional animations to improve visual quality and perceived smoothness.

**Acceptance Criteria:**
- [ ] Fade-in animation when new subtitle appears (0.3-0.5s)
- [ ] Smooth transition between subtitles
- [ ] Optional typing effect for character-by-character reveal
- [ ] Animation does not delay actual subtitle display
- [ ] Performance tested on target display hardware
- [ ] Animation can be disabled via config if needed
- [ ] Maintains readability during animations

**Technical Context:**
- Location: `frontend/subtitle-interface/`
- CSS animations or JavaScript transition libraries
- Consider: Reduced motion accessibility preferences

---

### Issue B3: Visual Design Polish
**Title:** Reduce "generic AI dashboard" feel; improve visual calmness  
**Owner:** Student B  
**Labels:** `owner:B`, `frontend`, `priority:should`, `polish`, `ux`  
**Initial Column:** Ready

**Description:**
Refine the UI design to look more professional and purpose-built for masjid use, reducing generic template aesthetics.

**Acceptance Criteria:**
- [ ] Refined color palette (consider Islamic design patterns)
- [ ] Consistent spacing and typography throughout
- [ ] Reduced visual clutter in admin dashboard
- [ ] Improved button and form styling
- [ ] Professional header/branding
- [ ] Calm, respectful visual tone suitable for religious context
- [ ] Before/after screenshots documented
- [ ] Feedback from at least 2 team members

**Technical Context:**
- Locations: All frontend interfaces
- Assets: Consider adding logo, custom fonts
- Reference: Islamic/mosque aesthetics, professional SaaS UIs

---

### Issue B4: Skipped Segment Display Fix
**Title:** Ensure skipped segments display correctly before next match  
**Owner:** Student B  
**Labels:** `owner:B`, `frontend`, `priority:must`, `bug`  
**Initial Column:** Ready

**Description:**
Fix any issues where skipped segments don't display correctly when ASR jumps ahead in the sermon script.

**Acceptance Criteria:**
- [ ] Skipped segments marked visually in real-time
- [ ] Next matched segment displays without showing skipped ones
- [ ] Segment order maintained in display
- [ ] Skip event logged for post-service analysis
- [ ] Tested with intentional skips in demo scenarios
- [ ] No duplicate subtitle display
- [ ] Clear visual indicator when segments are skipped (optional overlay)

**Technical Context:**
- Location: `frontend/subtitle-interface/`
- WebSocket message handling for skip events
- Alignment logic: `ml_pipeline/alignment_module/aligner.py`

---

### Issue B5: Demo UI Preparation
**Title:** Prepare UI for live lab simulation and demo replay  
**Owner:** Student B  
**Labels:** `owner:B`, `frontend`, `priority:must`, `demo`  
**Initial Column:** Ready

**Description:**
Ensure all frontend interfaces are optimized for demo presentation, lab simulation, and stakeholder viewing.

**Acceptance Criteria:**
- [ ] All interfaces load without console errors
- [ ] Responsive design works on demo display resolution
- [ ] Demo mode (if applicable) can be toggled
- [ ] Sample sermon data pre-loaded for quick demo
- [ ] Error states display user-friendly messages
- [ ] WebSocket reconnection UI tested
- [ ] All buttons and features clearly labeled
- [ ] Screenshots/screen recording tested and reviewed

**Technical Context:**
- Locations: All frontend interfaces
- Test on target demo hardware/projector
- Consider: Demo data seeding script

---

## Student C: Documentation, Evaluation & Stakeholders

### Issue C1: Masjid Briefing Documents
**Title:** Finalize masjid briefing documents (phases, equipment, responsibilities)  
**Owner:** Student C  
**Labels:** `owner:C`, `docs`, `priority:must`, `demo`  
**Initial Column:** Ready

**Description:**
Create comprehensive briefing documents for masjid committee explaining the system, deployment phases, equipment needs, and responsibilities.

**Acceptance Criteria:**
- [ ] System overview (non-technical language)
- [ ] Deployment phases timeline (pre-service, live, post-service)
- [ ] Equipment requirements list (microphone, display, network)
- [ ] Roles and responsibilities (imam, technician, administrator)
- [ ] Pre-service checklist for sermon preparation
- [ ] Troubleshooting guide for common issues
- [ ] Contact information for technical support
- [ ] PDF format, professionally formatted
- [ ] Reviewed by at least one stakeholder or team member

**Technical Context:**
- Location: `docs/masjid-briefing/`
- Format: Markdown + PDF export
- Audience: Non-technical masjid committee members

---

### Issue C2: Post-Service Analytics
**Title:** Add light post-service analytics (counts, latency; CSV OK)  
**Owner:** Student C  
**Labels:** `owner:C`, `backend`, `docs`, `priority:should`, `demo`  
**Initial Column:** Ready

**Description:**
Implement simple analytics to track system performance during sermons for post-service review and stakeholder reporting.

**Acceptance Criteria:**
- [ ] Segment count (total, matched, skipped, unmatched)
- [ ] Average alignment latency
- [ ] ASR confidence scores (min, max, average)
- [ ] WebSocket connection stability metrics
- [ ] CSV export functionality from admin dashboard
- [ ] Analytics viewable in simple dashboard or report
- [ ] Data collected automatically during live streaming
- [ ] Sample report generated from test sermon

**Technical Context:**
- Backend: New analytics endpoint or extend existing
- Frontend: Analytics view in admin dashboard
- Storage: PostgreSQL or CSV file export

---

### Issue C3: Demo Script Preparation
**Title:** Prepare demo script (5-minute and 10-minute versions)  
**Owner:** Student C  
**Labels:** `owner:C`, `docs`, `priority:must`, `demo`  
**Initial Column:** Ready

**Description:**
Create detailed demo scripts for 5-minute and 10-minute presentations to different stakeholder groups.

**Acceptance Criteria:**
- [ ] 5-minute version (elevator pitch for executives)
- [ ] 10-minute version (detailed walkthrough for committee)
- [ ] Introduction: Problem statement and motivation
- [ ] Demo flow: Upload → Vet → Live stream → Review
- [ ] Key features highlighted
- [ ] Talking points for each screen
- [ ] Backup plan if technical issues occur
- [ ] Q&A preparation (anticipated questions)
- [ ] Rehearsed with team at least once
- [ ] Timing verified with stopwatch

**Technical Context:**
- Location: `docs/demo/`
- Include: Screenshots, talking points, timing notes
- Practice with sample sermon data

---

### Issue C4: Stakeholder Engagement Plan
**Title:** Plan stakeholder engagement (VC, Dean, Masjid Committee)  
**Owner:** Student C  
**Labels:** `owner:C`, `docs`, `priority:should`, `demo`  
**Initial Column:** Ready

**Description:**
Develop engagement strategy and schedule for key stakeholders including Vice Chancellor, Dean, and Masjid Committee.

**Acceptance Criteria:**
- [ ] Stakeholder list with contact information
- [ ] Engagement approach tailored per stakeholder group
- [ ] Meeting request templates prepared
- [ ] Demo invitation emails drafted
- [ ] Feedback collection forms created
- [ ] Post-demo follow-up plan
- [ ] Timeline for engagement activities
- [ ] Risk mitigation for scheduling conflicts

**Technical Context:**
- Location: `docs/stakeholder-engagement/`
- Consider: Calendar invites, presentation materials
- Deliverable: Email templates, feedback forms

---

### Issue C5: Lab Simulation and Feedback Collection
**Title:** Organize lab simulation with Malay speakers and collect feedback  
**Owner:** Student C  
**Labels:** `owner:C`, `docs`, `priority:must`, `demo`  
**Initial Column:** Ready

**Description:**
Coordinate lab simulation session with Malay speakers to test the system in controlled environment and gather feedback before pilot.

**Acceptance Criteria:**
- [ ] Recruit 2-3 Malay speakers for simulation
- [ ] Prepare test sermon script (5-10 minutes)
- [ ] Schedule lab session in advance
- [ ] Setup recording/notes system for feedback
- [ ] Conduct simulation: upload → vet → live stream
- [ ] Collect feedback via survey or interview
- [ ] Document technical issues encountered
- [ ] Compile feedback report with recommendations
- [ ] Share findings with Students A & B
- [ ] Iterate on critical issues before demo

**Technical Context:**
- Location: Lab environment with demo setup
- Feedback: Accuracy, latency, usability, visual quality
- Output: Feedback report in `docs/evaluation/`

---

## Summary Table

| Issue | Title | Owner | Labels | Initial Column |
|-------|-------|-------|--------|----------------|
| A1 | Graceful ASR Handling | Student A | owner:A, backend, priority:must, stability | Ready |
| A2 | Cache and Buffering | Student A | owner:A, backend, priority:must, stability | Ready |
| A3 | End-to-End Safety Check | Student A | owner:A, backend, priority:must, stability | Ready |
| A4 | Enhanced Logging | Student A | owner:A, backend, priority:should, stability | Ready |
| A5 | Model Retraining Docs | Student A | owner:A, backend, priority:could, docs | Frozen (Post-Sprint) |
| B1 | Bulk Approve Action | Student B | owner:B, frontend, priority:must, ux | Ready |
| B2 | Subtitle Animation | Student B | owner:B, frontend, priority:should, polish | Ready |
| B3 | Visual Design Polish | Student B | owner:B, frontend, priority:should, polish, ux | Ready |
| B4 | Skipped Segment Fix | Student B | owner:B, frontend, priority:must, bug | Ready |
| B5 | Demo UI Preparation | Student B | owner:B, frontend, priority:must, demo | Ready |
| C1 | Masjid Briefing Docs | Student C | owner:C, docs, priority:must, demo | Ready |
| C2 | Post-Service Analytics | Student C | owner:C, backend, docs, priority:should, demo | Ready |
| C3 | Demo Script | Student C | owner:C, docs, priority:must, demo | Ready |
| C4 | Stakeholder Engagement | Student C | owner:C, docs, priority:should, demo | Ready |
| C5 | Lab Simulation | Student C | owner:C, docs, priority:must, demo | Ready |

## Priority Breakdown

### Must-Have (priority:must) - 9 issues
Critical for demo success:
- A1: Graceful ASR Handling
- A2: Cache and Buffering  
- A3: End-to-End Safety Check
- B1: Bulk Approve Action
- B4: Skipped Segment Fix
- B5: Demo UI Preparation
- C1: Masjid Briefing Docs
- C3: Demo Script
- C5: Lab Simulation

### Should-Have (priority:should) - 5 issues
Important but not critical:
- A4: Enhanced Logging
- B2: Subtitle Animation
- B3: Visual Design Polish
- C2: Post-Service Analytics
- C4: Stakeholder Engagement

### Could-Have/Deferred (priority:could) - 1 issue
Explicitly deferred to post-sprint:
- A5: Model Retraining Docs (Frozen)

## Sprint Capacity

- **Total Issues:** 15
- **Ready for Sprint:** 14
- **Frozen (Post-Sprint):** 1
- **1 Week Sprint:** ~2 issues per person per week (realistic for polish/stability work)

This is an aggressive but achievable sprint focusing on demo readiness rather than new development.
