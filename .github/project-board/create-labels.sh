#!/bin/bash
# Script to create all labels for Pilot Sprint project board

set -e  # Exit on error

echo "Creating GitHub labels for Pilot Sprint..."
echo ""

# Priority labels
echo "Creating Priority labels..."
gh label create "priority:must" \
  --description "Critical for demo success, must be completed" \
  --color "d73a4a" \
  --force

gh label create "priority:should" \
  --description "Important but not critical, complete if time permits" \
  --color "fbca04" \
  --force

gh label create "priority:could" \
  --description "Nice to have, defer if needed" \
  --color "0e8a16" \
  --force

echo "✓ Priority labels created"
echo ""

# Type labels
echo "Creating Type labels..."
gh label create "backend" \
  --description "Backend API, database, core logic" \
  --color "5319e7" \
  --force

gh label create "frontend" \
  --description "UI, UX, display interfaces" \
  --color "1d76db" \
  --force

gh label create "infra" \
  --description "Infrastructure, deployment, configuration" \
  --color "0052cc" \
  --force

gh label create "ux" \
  --description "User experience improvements" \
  --color "c5def5" \
  --force

gh label create "docs" \
  --description "Documentation, guides, briefings" \
  --color "0075ca" \
  --force

gh label create "demo" \
  --description "Demo-specific preparation" \
  --color "ff6b6b" \
  --force

echo "✓ Type labels created"
echo ""

# Owner labels
echo "Creating Owner labels..."
gh label create "owner:A" \
  --description "Student A (Core backend, ASR, alignment, reliability)" \
  --color "bfdadc" \
  --force

gh label create "owner:B" \
  --description "Student B (Frontend, UX, live display, admin workflows)" \
  --color "c2e0c6" \
  --force

gh label create "owner:C" \
  --description "Student C (Documentation, analytics, stakeholder engagement)" \
  --color "f9d0c4" \
  --force

echo "✓ Owner labels created"
echo ""

# Status labels
echo "Creating Status labels..."
gh label create "stability" \
  --description "System reliability and error handling" \
  --color "d4c5f9" \
  --force

gh label create "polish" \
  --description "UI/UX refinements and visual improvements" \
  --color "e99695" \
  --force

gh label create "bug" \
  --description "Bug fixes" \
  --color "d73a4a" \
  --force

echo "✓ Status labels created"
echo ""

echo "=========================================="
echo "✅ All labels created successfully!"
echo "=========================================="
echo ""
echo "Total labels created: 16"
echo "  - Priority: 3"
echo "  - Type: 6"
echo "  - Owner: 3"
echo "  - Status: 3"
echo ""
echo "Next step: Run create-issues.sh to create sprint issues"
