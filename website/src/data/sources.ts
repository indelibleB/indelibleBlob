export interface Source {
    id: number;
    claim: string;
    source: string;
    title: string;
    url: string;
    year: number;
    note: string;
}

export const sources: Source[] = [
    {
        id: 1,
        claim: "People struggle to identify AI-generated content (approximately 51% accuracy)",
        source: "ACM Communications",
        title: "As Good as a Coin Toss: Human Detection of AI-Generated Content",
        url: "https://cacm.acm.org/research/as-good-as-a-coin-toss-human-detection-of-ai-generated-content/",
        year: 2025,
        note: "Study found people distinguish between AI-generated and human-authored content only 51% of the time—essentially a coin toss."
    },
    {
        id: 2,
        claim: "70% of researchers have failed to reproduce another scientist's experiments",
        source: "Nature",
        title: "1,500 scientists lift the lid on reproducibility",
        url: "https://www.nature.com/articles/533452a",
        year: 2016,
        note: "Landmark survey found that more than 70% of researchers have tried and failed to reproduce another scientist's experiments."
    },
    {
        id: 3,
        claim: "The global economic cost of misinformation is estimated at $78 billion annually",
        source: "Springer / University of Baltimore",
        title: "The Economic Cost of Bad Actors on the Internet",
        url: "https://link.springer.com/chapter/10.1007/978-981-95-3361-9_4",
        year: 2025,
        note: "Research indicates the global cost of misinformation and disinformation has reached approximately $78 billion per year."
    },
    {
        id: 4,
        claim: "Digital fraud costs companies globally",
        source: "TransUnion",
        title: "Fraud Costs Businesses Nearly 8% of Their Equivalent Revenue",
        url: "https://newsroom.transunion.com/h2-2025-global-fraud-report/",
        year: 2025,
        note: "Digital fraud cost companies $534bn in losses globally, with U.S. companies losing 9.8% of equivalent revenue"
    },
    {
        id: 5,
        claim: "Deepfake fraud financial impact approaching $1 billion",
        source: "Surfshark Research",
        title: "Deepfake fraud caused financial losses nearing $900 million",
        url: "https://surfshark.com/research/chart/deepfake-fraud-losses",
        year: 2025,
        note: "In the first half of 2025 alone, deepfake losses amounted to $410 million"
    },
    {
        id: 6,
        claim: "Global media market size: $2.9 trillion",
        source: "PwC",
        title: "Global Entertainment & Media Outlook 2025–2029",
        url: "https://www.pwc.com/gx/en/issues/business-model-reinvention/outlook/insights-and-perspectives.html",
        year: 2024,
        note: "Global E&M revenues reached $2.9 trillion in 2024"
    },
    {
        id: 7,
        claim: "Legal insurance market size",
        source: "Statista",
        title: "Legal Insurance - Worldwide Market Forecast",
        url: "https://www.statista.com/outlook/fmo/insurances/non-life-insurances/legal-insurance/worldwide",
        year: 2025,
        note: "Legal Insurance market projected to reach $77.54bn in 2025"
    },
    {
        id: 8,
        claim: "Creative industries: Photography market $105.2 billion",
        source: "Verified Market Reports",
        title: "Photography Industry Statistics: Key Facts and Trends",
        url: "https://greatbigphotographyworld.com/photography-statistics/",
        year: 2023,
        note: "Global photography market size valued at $105.2 billion in 2023"
    },
    {
        id: 9,
        claim: "Video production market growth",
        source: "Grand View Research",
        title: "Video Production Market Size, Share & Growth Report, 2030",
        url: "https://www.grandviewresearch.com/industry-analysis/video-production-market-report",
        year: 2022,
        note: "Global video production market estimated at $70.40 billion in 2022, projected to reach $746.88 billion by 2030"
    },
    {
        id: 10,
        claim: "Global construction market: $11.39 trillion to $16.11 trillion by 2030",
        source: "Deloitte",
        title: "Global Powers of Construction Report",
        url: "https://www.deloitte.com/global/en/about/press-room/deloitte-global-powers-of-construction-report.html",
        year: 2024,
        note: "Global construction market projected to grow from $11.39 trillion in 2024 to $16.11 trillion by 2030"
    },
    {
        id: 11,
        claim: "Visual Effects (VFX) market size",
        source: "Precedence Research",
        title: "Visual Effects (VFX) Market Size and Forecast 2025 to 2034",
        url: "https://www.precedenceresearch.com/visual-effects-market",
        year: 2024,
        note: "Global VFX market valued at $10.60 billion in 2024, projected to reach $20.29 billion by 2034"
    },
    {
        id: 12,
        claim: "Enterprise spending on battling misinformation",
        source: "Gartner",
        title: "Enterprise Spending on Battling Misinformation and Disinformation",
        url: "https://www.gartner.com/en/newsroom/press-releases/2025-10-21-gartner-predicts-enterprise-spending-on-battling-misinformation-and-disinformation-will-surpass-30-billion-dollars-by-2028",
        year: 2025,
        note: "By 2028, enterprise spending on battling misinformation will surpass $30 billion"
    },
    {
        id: 13,
        claim: "Walrus Protocol: Decentralized Storage Efficiency",
        source: "Mysten Labs",
        title: "Walrus: A Decentralized Blob Store using Sui for Coordination",
        url: "https://docs.wal.app/",
        year: 2024,
        note: "Walrus nodes provide specialized blob storage that separates storage costs from execution gas, reducing long-term archival costs by ~99% compared to on-chain storage."
    },
    {
        id: 14,
        claim: "Sui Blockchain: Parallel Execution Throughput",
        source: "Sui Foundation",
        title: "Sui: Mass Adoption Technology",
        url: "https://docs.sui.io/",
        year: 2024,
        note: "Sui's object-centric model and parallel execution allow for 297,000 transactions per second (TPS) with sub-second latency, essential for real-time verification."
    },
    {
        id: 15,
        claim: "Solana Seeker: Hardware-Backed Trust (TEEPIN)",
        source: "Solana Mobile",
        title: "Trusted Execution Environment Platform Infrastructure Network (TEEPIN)",
        url: "https://solanamobile.com/",
        year: 2026,
        note: "The Seeker device utilizes TEEPIN to provide 'Hardware Backed Trust', where the Trusted Execution Environment delivers tamper-resistant proofs of state for on-chain verification of content origin."
    }
];
