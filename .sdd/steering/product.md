# Product Overview

Personal travel companion app for a 18-day trip to Ireland & United Kingdom (Aug–Sep 2026). It consolidates the full trip itinerary — cities, accommodations, and transports — into a beautiful, mobile-first web experience shared between 2 travelers.

Data is sourced from a Google Sheets spreadsheet, so the travelers can update it without touching the code.

## Core Capabilities

- **Itinerary timeline**: Chronological, expandable city cards showing dates, highlights, neighborhoods, and activities for each of the 6 destination cities.
- **Accommodations dashboard**: Hotel cards with confirmation status (confirmed / pending), check-in/out dates, prices, and booking links.
- **Transport log**: Ordered list of all 7 travel legs (flights, trains) with operators, durations, prices, and payment status.
- **Live data via Google Sheets**: Server-side fetch with 1-hour cache; no credentials exposed to the browser.
- **Mobile-first navigation**: Bottom tab bar on mobile (app-like UX), horizontal top nav on desktop.

## Target Use Cases

- Browse the full trip at a glance before and during travel.
- Check hotel details and booking confirmations on the go.
- Track transport legs chronologically (departure time, operator, duration).
- Share the link with co-travelers and family members who want to follow the journey.

## Value Proposition

A single, beautiful URL replaces scattered screenshots, PDFs, and spreadsheet tabs. The glassmorphism UI over a purple gradient makes it feel like a premium travel app, not a spreadsheet dump.

---
_Focus on patterns and purpose, not exhaustive feature lists_
