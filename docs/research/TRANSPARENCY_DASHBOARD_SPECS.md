# indelible.Blob Transparency Dashboard Specifications

**Version:** 1.0
**Date:** March 2, 2026
**Author:** Agent 5 (Social Entrepreneurship Research Lead)
**For:** Agent 1 (Product & Engineering Lead)
**Status:** Draft

## 1. Overview and Purpose

This document provides the technical and functional specifications for the public-facing **Creator-Directed Allocation Transparency Dashboard**. The dashboard is a core component of indelible.Blob's commitment to its constitutional values of **Transparency & Accountability** and **Community & Relationships**.

Its primary purposes are:
1.  **Community Accountability:** To provide all creators and stakeholders with a real-time, aggregate view of how revenue is being distributed across the ecosystem.
2.  **Research Communication:** To serve as a primary channel for communicating high-level findings from the Creator-Directed Allocation research program.
3.  **Social Influence Research:** To act as a controlled instrument for studying the effect of social information on individual allocation decisions (see Research Protocol, Hypothesis H5.1).

This specification document is intended for the Product & Engineering Lead (Agent 1) to guide the technical implementation of the dashboard.

## 2. Target Audience

The dashboard is designed for two primary audiences:

-   **indelible.Blob Creators:** Both current and prospective creators who want to understand the economic model of the platform and see how their peers are allocating funds.
-   **External Stakeholders:** Researchers, journalists, potential partners, and the broader web3 community interested in novel models of platform governance and economics.

## 3. Key Metrics and Visualizations

The dashboard will consist of several modules, each displaying a key metric or visualization. The layout should be clean, intuitive, and mobile-responsive.

### Module 1: Protocol-Wide Aggregate Allocation (Real-Time)

-   **Visualization:** A prominent, large-format stacked bar chart or a set of three large percentage numbers.
-   **Metric:** The current, protocol-wide, revenue-weighted average allocation split between Treasury, Creator Pool, and Community Pool.
-   **Data Required:** `aggregate_trend` (revenue-weighted average of `treasury_allocation`, `creator_allocation`, `community_allocation` for all active creators).
-   **Update Frequency:** Real-time or near-real-time (updated at least every 15 minutes).
-   **Example Display:**
    -   **Treasury:** 38.5%
    -   **Creator Pool:** 45.2%
    -   **Community Pool:** 16.3%

### Module 2: Historical Allocation Trend

-   **Visualization:** A stacked area chart showing the evolution of the three allocation pools over time.
-   **Metric:** The historical, revenue-weighted average allocation split, plotted over time.
-   **Data Required:** Daily snapshots of the `aggregate_trend` data.
-   **Timeframe:** User-selectable timeframes (e.g., 30 days, 90 days, 1 year, All time).
-   **X-Axis:** Time (Day/Week/Month)
-   **Y-Axis:** Percentage (0% to 100%)

### Module 3: Default Acceptance Rate

-   **Visualization:** A simple percentage display or a donut chart.
-   **Metric:** The percentage of all active creators who have never modified their allocation from the initial default setting (33.33% / 33.33% / 33.34%).
-   **Data Required:** The `default_acceptance` boolean for all active creators.
-   **Update Frequency:** Daily.
-   **Example Display:** "**42%** of creators are currently using the default allocation."

### Module 4: Key Statistics

-   **Visualization:** A set of clean, simple numeric call-outs.
-   **Metrics:**
    -   **Total Active Creators:** The total number of creators with at least one capture on the platform.
    -   **Total Revenue Distributed:** The cumulative amount of revenue distributed through the allocation mechanism to date.
    -   **Creators in Research:** The number of creators who have opted into the research program.
-   **Data Required:** Count of active users, sum of `revenue_generated`, count of users with research opt-in true.
-   **Update Frequency:** Daily.

## 4. Data Requirements and API Endpoints

The backend team will need to provide a set of API endpoints to deliver the data required for the dashboard. These endpoints should be performant and publicly accessible.

| Endpoint | Method | Description | Data Returned |
| :--- | :--- | :--- | :--- |
| `/api/v1/transparency/aggregate` | GET | Returns the current revenue-weighted aggregate allocation. | `{ "treasury": 0.385, "creator": 0.452, "community": 0.163 }` |
| `/api/v1/transparency/historical` | GET | Returns historical daily snapshots of the aggregate allocation. Accepts `?timespan=` query param. | `[{ "date": "YYYY-MM-DD", "treasury": 0.38, ... }, ...]` |
| `/api/v1/transparency/stats` | GET | Returns key platform statistics for the dashboard. | `{ "active_creators": 1250, "total_revenue": 54321.99, "research_participants": 1100 }` |
| `/api/v1/transparency/default_rate` | GET | Returns the current default acceptance rate. | `{ "rate": 0.42 }` |

**Note:** All data returned by these endpoints must be fully aggregated and anonymized. No individual creator data should be exposed.

## 5. Update Frequency

-   **Real-Time Metrics (Module 1):** Should be updated via a background job every **15 minutes**.
-   **Daily Metrics (Modules 2, 3, 4):** Should be snapshotted once every **24 hours** (e.g., at 00:00 UTC).

## 6. Design and UX Principles

-   **Clarity and Simplicity:** The dashboard should be immediately understandable to a non-technical audience. Avoid jargon and complex visualizations.
-   **Data Integrity:** The data must be accurate and clearly sourced. A small footnote should link to the Research Protocol document.
-   **Mobile-First:** The design must be fully responsive and optimized for mobile viewing.
-   **Accessibility:** The dashboard must adhere to WCAG 2.1 AA accessibility standards.
-   **Non-Manipulative:** The design must not nudge or influence creators' allocation choices. It should present neutral, factual information. For example, do not use colors that imply one choice is "better" than another (e.g., green for Community, red for Treasury). Use a neutral color palette.
