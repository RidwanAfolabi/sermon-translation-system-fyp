# 🔒 Scope Freeze Policy - Pilot Sprint

## ⚠️ CRITICAL: READ THIS FIRST

**This is NOT a greenfield build. This is stabilization, polish, and demo readiness.**

---

## Sprint Constraints

| Constraint | Details |
|------------|---------|
| **Sprint Length** | 1 week only |
| **Scope Status** | **FROZEN** ❄️ |
| **New Features** | Prohibited unless they directly prevent demo failure |
| **Non-Essential Work** | Must be explicitly deferred to post-sprint |

---

## ✅ What IS In Scope

### Allowed Activities

1. **Bug Fixes**
   - Fixing broken functionality that impacts demo
   - Resolving error states that could cause demo failure
   - Addressing stability issues in core components

2. **Polish & Refinement**
   - UI/UX improvements to existing features
   - Visual design refinements
   - Performance optimizations

3. **Demo Preparation**
   - Documentation for stakeholders
   - Demo scripts and presentation materials
   - Lab simulation and testing
   - Analytics for post-demo evaluation

4. **Stability Enhancements**
   - Error handling improvements
   - Logging and monitoring enhancements
   - Graceful degradation for edge cases
   - Buffer and cache optimizations

---

## ❌ What IS NOT In Scope

### Prohibited Activities

1. **New Features**
   - Adding functionality that didn't exist before
   - Implementing "nice to have" capabilities
   - Exploring experimental approaches
   - **Exception:** Only if absolutely required to prevent demo failure

2. **Architecture Changes**
   - Major refactoring of existing code
   - Database schema changes (unless critical bug fix)
   - Technology stack changes
   - Migration to new frameworks or libraries

3. **Scope Creep**
   - "While we're at it" additions
   - Gold-plating existing features
   - Over-engineering solutions
   - Implementing future requirements early

4. **Research & Exploration**
   - Model retraining or fine-tuning
   - Alternative algorithm exploration
   - Performance benchmarking beyond demo needs
   - Integration with new external services

---

## 🚨 Demo Failure Criteria

A new feature is ONLY justified if its absence would cause:

1. **Complete System Breakdown**
   - System cannot start or crashes immediately
   - Critical path is completely broken
   - Demo cannot proceed at all

2. **Data Loss or Corruption**
   - Database integrity at risk
   - User data could be lost
   - System state becomes unrecoverable

3. **Security Vulnerability**
   - Exposed credentials or sensitive data
   - Critical security flaw discovered
   - Regulatory compliance issue

4. **Stakeholder Deal-Breaker**
   - Explicitly required by Vice Chancellor/Dean
   - Masjid committee non-negotiable requirement
   - University approval contingent on feature

---

## 📋 Decision Framework

When considering new work, ask:

```
┌─────────────────────────────────────────────┐
│ Is this fixing a broken existing feature?  │
└─────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
        YES                   NO
         │                     │
         ↓                     ↓
    ✅ APPROVED          Is this required for
                        demo to function?
                              │
                   ┌──────────┴──────────┐
                   │                     │
                  YES                   NO
                   │                     │
                   ↓                     ↓
              Can we work          ❌ DEFERRED
              around it?           to post-sprint
                   │
        ┌──────────┴──────────┐
        │                     │
       YES                   NO
        │                     │
        ↓                     ↓
   ❌ DEFERRED          ⚠️ ESCALATE
   (workaround)         to team lead
```

---

## 🎯 Sprint Focus Areas

### Priority Order

1. **Stability** - System must not crash or fail during demo
2. **Demo Readiness** - All materials and scripts prepared
3. **Polish** - UI looks professional and trustworthy
4. **Documentation** - Stakeholders understand the system
5. **Testing** - Lab simulation validates demo scenarios

### Success Metrics

- [ ] System completes full demo cycle without crashes
- [ ] All priority:must issues resolved
- [ ] Lab simulation feedback addressed
- [ ] Demo scripts rehearsed and timed
- [ ] Stakeholder materials finalized

---

## 🔄 Post-Sprint Work

The following are **explicitly deferred** until after the pilot demo:

1. **Model Retraining Pipeline**
   - Keep as documented scaffold only
   - Implement after pilot feedback collected

2. **Advanced Analytics**
   - Comprehensive dashboards
   - Real-time monitoring beyond basic metrics
   - Historical trend analysis

3. **Cloud Deployment**
   - Docker containerization
   - AWS/GCP deployment
   - CI/CD pipeline setup

4. **Feature Enhancements**
   - Multi-language support beyond Malay-English
   - Mobile app development
   - Advanced user management

5. **Performance Optimization**
   - Model quantization beyond current state
   - Database query optimization (unless causing demo issues)
   - Caching strategies beyond basic buffering

---

## 🛡️ Scope Protection Mechanism

### Team Responsibilities

**All Team Members:**
- Challenge scope creep immediately
- Use this document in PR reviews
- Escalate scope concerns to project lead

**Project Lead:**
- Final authority on scope decisions
- Document any scope additions with justification
- Communicate changes to all team members

### Code Review Checklist

Before approving any PR, reviewers must verify:

- [ ] Does this PR address an existing sprint issue?
- [ ] Is the change minimal and focused?
- [ ] Are new features justified by demo failure prevention?
- [ ] Could this wait until post-sprint?
- [ ] Is there a simpler workaround?

---

## 📞 Escalation Process

If you're unsure whether work is in scope:

1. **Stop** - Don't proceed with implementation
2. **Document** - Write 1-2 sentences explaining the proposed work
3. **Ask** - Present to team lead or team meeting
4. **Decide** - Get explicit approval or deferral
5. **Record** - Document decision and rationale

---

## 🎬 Remember

> **"Perfect is the enemy of done."**
> 
> **"Scope freeze isn't about saying no to good ideas - it's about saying 'not right now' to protect demo success."**
> 
> **"We're not building the final system. We're proving the concept works."**

---

## Acknowledgment

By working on this sprint, all team members acknowledge:

- ✅ I understand the scope freeze policy
- ✅ I will challenge scope creep when I see it
- ✅ I will focus on demo readiness over perfection
- ✅ I will defer non-essential work without guilt
- ✅ I commit to sprint success over individual preferences

---

**Last Updated:** January 11, 2026  
**Sprint Duration:** 1 week  
**Demo Date:** [To be scheduled]  
**Status:** ACTIVE 🔴
