# indelible.Blob Creator-Directed Allocation Research Protocol

**Version:** 1.0
**Date:** March 2, 2026
**Author:** Agent 5 (Social Entrepreneurship Research Lead)
**Status:** Draft

## 1. Introduction & Purpose

This document outlines the formal research protocol for studying creator allocation behavior within the indelible.Blob platform. The Creator-Directed Allocation mechanism represents a novel research instrument in the fields of behavioral economics, platform economics, and social entrepreneurship. It allows creators to direct the distribution of their revenue between organizational operations (Treasury), direct creator rewards (Creator Pool), and community initiatives (Community Pool), with a 33.33% floor on the Treasury allocation.

This research is not a survey but a study of **revealed preference with real economic consequences**. The data generated is unique, as no major platform currently offers creators such a degree of agency over revenue distribution. The purpose of this protocol is to establish a rigorous, ethical, and transparent framework for collecting, analyzing, and publishing findings from this dataset to contribute original insights to public knowledge.

## 2. Core Research Questions

The initial research agenda is defined by the following seven core questions. These will be refined and expanded as the research program matures.

1.  **Distribution Patterns:** When individuals have genuine agency over economic distribution with real money attached, how do they allocate value across organizational sustainability, personal compensation, and community benefit?
2.  **Segment Variation:** How do allocation preferences vary by profession (e.g., journalist, artist), geography, usage volume, or tenure on the platform?
3.  **Default Effect Strength:** What percentage of creators accept the default equal split (33.33% / 33.33% / 33.34%) without customization? How does this compare to default acceptance rates in other behavioral economics contexts?
4.  **Temporal Dynamics:** Do allocation preferences shift over time as creators gain experience with the platform and observe the consequences of their choices?
5.  **Social Influence:** Does exposure to aggregate community preferences (via the Transparency Dashboard) influence individual allocation decisions, leading to convergence or differentiation?
6.  **Equilibrium:** What is the natural equilibrium of a creator-directed economy? Does the aggregate allocation stabilize, oscillate, or drift over time, and how does it compare to centrally imposed take rates?
7.  **Values Expression:** Can allocation preferences be interpreted as a proxy for economic values? Do creators who allocate more to the Community Pool exhibit different platform behaviors?

## 3. Hypotheses

Based on the core research questions, we formulate the following initial hypotheses. Each hypothesis is designed to be testable using the data collected from the platform.

| Research Question | Hypothesis ID | Hypothesis | Null Hypothesis (H₀) |
| :--- | :--- | :--- | :--- |
| **Distribution Patterns** | H1.1 | The mean allocation to the Community Pool will be significantly greater than zero, indicating a non-trivial preference for collective benefit. | The mean allocation to the Community Pool is not significantly different from zero. |
| **Distribution Patterns** | H1.2 | The distribution of creator allocations will be multi-modal, clustering around archetypes (e.g., "Maximizer," "Equal Splitter," "Community Builder"). | The distribution of creator allocations will be unimodal and normally distributed. |
| **Segment Variation** | H2.1 | Creators in professions with a strong public service component (e.g., journalists, educators) will allocate a significantly higher percentage to the Community Pool than creators in commercially-oriented professions. | There is no significant difference in Community Pool allocation across different creator professions. |
| **Default Effect Strength** | H3.1 | A significant percentage of new creators (estimated > 40%) will initially accept the default 33.33% three-way split. | The percentage of creators accepting the default allocation is not significantly different from what would be expected by chance. |
| **Temporal Dynamics** | H4.1 | Over time, individual creator allocations will show a statistically significant deviation from their initial settings as they gain experience on the platform. | Individual creator allocations will not show a statistically significant change from their initial settings over time. |
| **Social Influence** | H5.1 | Exposure to the Transparency Dashboard will lead to a statistically significant convergence of individual allocation preferences toward the community-wide average. | Exposure to the Transparency Dashboard has no statistically significant effect on individual allocation preferences. |
| **Equilibrium** | H6.1 | The protocol-wide aggregate allocation, weighted by revenue, will converge to a stable equilibrium point over a 12-month period. | The protocol-wide aggregate allocation will not converge to a stable equilibrium and will exhibit random drift. |
| **Values Expression** | H7.1 | Creators who allocate a higher percentage to the Community Pool will have a significantly higher level of engagement with community governance features (once implemented). | There is no significant correlation between Community Pool allocation and engagement with community governance features. |

## 4. Variables and Data Collection

This section defines the independent, dependent, and moderating variables for our research, mapping them to the data points collected by the indelible.Blob platform as outlined in the onboarding brief.

| Variable Type | Variable Name | Description | Data Point Source |
| :--- | :--- | :--- | :--- |
| **Dependent** | `treasury_allocation` | The percentage of revenue a creator allocates to the Treasury pool. | `Allocation preferences` |
| **Dependent** | `creator_allocation` | The percentage of revenue a creator allocates to the Creator Pool. | `Allocation preferences` |
| **Dependent** | `community_allocation` | The percentage of revenue a creator allocates to the Community Pool. | `Allocation preferences` |
| **Independent** | `creator_segment` | The self-reported profession or primary use case of the creator. | `Creator segment` |
| **Independent** | `geography` | The self-reported country or region of the creator. | `Geography` |
| **Independent** | `tenure` | The length of time a creator has been active on the platform, measured in days since registration. | Derived from user registration date |
| **Independent** | `default_acceptance` | A boolean indicating whether the creator has ever modified their allocation from the initial default setting. | `Default acceptance` |
| **Independent** | `dashboard_exposure` | A boolean or count indicating whether a creator has viewed the Transparency Dashboard before making an allocation change. | Platform analytics (requires instrumentation) |
| **Moderating** | `usage_volume` | The total number of captures or consumption events generated by a creator's content. | `Usage volume` |
| **Moderating** | `revenue_generated` | The total consumption revenue attributed to a creator's content. | `Revenue generated` |
| **Control** | `timestamp` | The timestamp of each allocation change event. | `Allocation change events` |

## 5. Statistical Methods

The following statistical methods will be employed to analyze the collected data and test the hypotheses. The choice of method is dependent on the nature of the data and the specific research question being addressed.

| Hypothesis ID | Statistical Method | Rationale |
| :--- | :--- | :--- |
| H1.1 | One-sample t-test | To determine if the mean allocation to the Community Pool is statistically different from a hypothesized mean of zero. |
| H1.2 | Cluster Analysis (e.g., k-means) | To identify distinct creator archetypes based on their allocation preferences across the three pools. |
| H2.1 | Analysis of Variance (ANOVA) | To compare the mean Community Pool allocations across multiple creator segments (professions). Post-hoc tests (e.g., Tukey's HSD) will be used for pairwise comparisons. |
| H3.1 | Chi-squared Goodness-of-Fit Test | To compare the observed frequency of default acceptance against a hypothesized distribution (e.g., 50/50 chance). |
| H4.1 | Paired-samples t-test or Wilcoxon signed-rank test | To compare individual creators' allocation preferences at two different points in time (e.g., initial vs. 6-month). |
| H5.1 | Difference-in-Differences (DiD) or Regression Discontinuity Design (RDD) | To estimate the causal effect of viewing the Transparency Dashboard on allocation behavior by comparing the change in allocations for viewers vs. non-viewers. |
| H6.1 | Time Series Analysis (e.g., ARIMA, Augmented Dickey-Fuller test) | To model the protocol-wide aggregate allocation over time and test for stationarity, indicating convergence to an equilibrium. |
| H7.1 | Correlation Analysis (e.g., Pearson or Spearman) or Logistic Regression | To assess the relationship between the `community_allocation` percentage and a binary outcome variable representing engagement with community features. |

## 6. Ethical Framework

Adherence to a strict ethical framework is non-negotiable and is grounded in the indelible.Blob Constitution, particularly the values of **Ethical Technology** and **Transparency & Accountability**. All research activities will be governed by the following principles:

-   **Informed Consent:** Creators will be clearly and concisely informed at the point of registration that their anonymized and aggregated allocation data will be used for research purposes. The language will be non-coercive and require an explicit opt-in. A draft of this consent language is a primary deliverable of this initial research phase.

-   **Anonymization:** All data used for research and publication will be fully anonymized. No personally identifiable information (PII) will ever be associated with allocation data in research outputs. Individual creator preferences will never be published.

-   **Aggregation Minimums:** To prevent de-anonymization through small-sample inference, research findings will only be published when the dataset includes a minimum of **100 active creators**. This threshold applies to any published segment or sub-group analysis.

-   **Opt-Out Provision:** Creators will have the right to opt out of research data collection at any time without affecting their use of the Creator-Directed Allocation feature. An opt-out will exclude their data from all future research datasets.

-   **No Manipulation:** The platform and its agents will never nudge, gamify, incentivize, or otherwise manipulate creators' allocation choices. The research's validity and value depend entirely on the genuine, uninfluenced preferences of the creators. The Research Lead is responsible for flagging and rejecting any product feature proposals that could compromise this principle.

## 7. Anonymization Protocol

To ensure the privacy of creators, the following anonymization protocol will be applied to all datasets prepared for research and public release:

1.  **Removal of Direct Identifiers:** All direct personal identifiers, such as usernames, wallet addresses, and IP addresses, will be removed from the dataset. Each creator will be assigned a randomly generated, non-sequential unique identifier (UID).

2.  **Generalization of Quasi-Identifiers:** Quasi-identifying variables will be generalized to reduce the risk of re-identification.
    -   **Geography:** Specific countries or regions will be grouped into broader geographical categories (e.g., "North America," "Europe," "Asia-Pacific"). Categories with fewer than the aggregation minimum of 100 creators will be grouped into an "Other" category.
    -   **Creator Segment:** Self-reported professions will be grouped into broader categories (e.g., "Media & Arts," "Professional Services," "Technical"). Any profession with fewer than a specified number of individuals (e.g., 10) will be categorized as "Other" to prevent identification of unique roles.
    -   **Timestamps:** Exact timestamps for allocation changes will be coarsened to the level of week or month.

3.  **Data Suppression:** For any sub-group analysis, cells containing data from fewer than the aggregation minimum (100 creators) will be suppressed from publication.

## 8. Publication and Dissemination Plan

Research outputs will be disseminated through three primary channels, each tailored to a specific audience and purpose:

-   **Transparency Dashboard:** A public-facing, real-time dashboard will display high-level, aggregate allocation trends. This serves the values of Transparency & Accountability and provides immediate feedback to the community. The specifications for this dashboard are a key deliverable of this research phase.

-   **Periodic Research Reports:** Quarterly or semi-annual reports will present in-depth findings from the research. These reports will be written for a dual audience: an accessible, narrative-driven summary for the indelible.Blob community and a methodologically rigorous analysis for the academic and policy communities.

-   **Open Datasets:** Fully anonymized and documented datasets will be released to the public under an open license (e.g., Creative Commons) to encourage external research and contribute to public knowledge. The release will be accompanied by a comprehensive data dictionary.
