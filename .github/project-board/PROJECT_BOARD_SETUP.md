# Pilot Sprint – Official Demo Readiness

## Project Overview

**Project Name:** Pilot Sprint – Official Demo Readiness  
**Sprint Length:** 1 week  
**Repository:** RidwanAfolabi/sermon-translation-system-fyp  
**Status:** Core system is fully implemented and live-tested  
**Goal:** Prepare the system for an official pilot demo and controlled masjid deployment

## ⚠️ Scope Freeze Policy

**CRITICAL:** This is NOT a greenfield build. This is stabilization, polish, and demo readiness.

- ✅ **Scope is frozen**
- ✅ **No new features unless they directly prevent demo failure**
- ✅ **Any non-essential work must be explicitly deferred**
- ✅ **Focus on demo reliability, polish, and trust**

## Project Board Columns

The project uses the following columns (in order):

1. **Backlog** - Tasks identified but not yet prioritized for this sprint
2. **Ready** - Tasks ready to be picked up and must be done this sprint
3. **In Progress** - Tasks currently being worked on
4. **Review / Test** - Tasks completed and awaiting review or testing
5. **Blocked** - Tasks that cannot proceed due to dependencies or issues
6. **Done** - Tasks completed and verified
7. **Frozen (Post-Sprint)** - Tasks explicitly deferred to post-demo phase

## Labels

### Priority Labels
- `priority:must` - Critical for demo success, must be completed
- `priority:should` - Important but not critical, complete if time permits
- `priority:could` - Nice to have, defer if needed

### Type Labels
- `backend` - Backend API, database, core logic
- `frontend` - UI, UX, display interfaces
- `infra` - Infrastructure, deployment, configuration
- `ux` - User experience improvements
- `docs` - Documentation, guides, briefings
- `demo` - Demo-specific preparation

### Owner Labels
- `owner:A` - Student A (Core backend, ASR, alignment, reliability)
- `owner:B` - Student B (Frontend, UX, live display, admin workflows)
- `owner:C` - Student C (Documentation, analytics, stakeholder engagement)

### Status Labels
- `stability` - System reliability and error handling
- `polish` - UI/UX refinements and visual improvements
- `bug` - Bug fixes

## Team Structure

### Student A: Core Systems & Reliability
**Focus:** Backend, ASR, alignment, system reliability

### Student B: Frontend, UX & Demo Experience
**Focus:** Frontend interfaces, user experience, live display

### Student C: Documentation, Evaluation & Stakeholders
**Focus:** Documentation, analytics, stakeholder engagement, evaluation

## System Context

- **Backend:** FastAPI with PostgreSQL
- **Translation:** Offline MarianMT + optional Gemini API
- **ASR:** Faster-Whisper (GPU)
- **Alignment:** Rule-based live alignment with buffering and skip handling
- **Live Streaming:** WebSocket
- **Frontend:** React control room + live subtitle display
- **Audience:** Masjid committee, university leadership, pilot stakeholders
