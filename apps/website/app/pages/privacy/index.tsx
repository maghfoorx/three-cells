import Markdown from "react-markdown";
import type { Route } from "../privacy/+types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy policy" },
    {
      name: "description",
      content:
        "This page explains how Three Cells collects and uses your data.",
    },
  ];
}

const markdown = `
## Introduction

At [three-cells.com](https://three-cells.com) and within the Three Cells mobile application (the "App"), we value and care about the privacy of our users. This document outlines the types of information collected and recorded by Three Cells and how we use it.

This Privacy Policy applies to visitors and users of our **website** and **mobile app**, specifically regarding the information that you share and/or we collect through our services. This policy does not apply to any information collected offline or via channels other than this website or app.

If you have any questions about our Privacy Policy, please contact us anytime at [hello@three-cells.com](mailto:hello@three-cells.com).

---

## Consent

By using our website or app, you consent to this Privacy Policy and agree to its terms.

---

## Information We Collect

Three Cells is a habit and productivity tracker. We collect only the data necessary to provide our service, such as:

- Entries you log (daily summaries, hours of focus, scores).
- Basic account details (e.g., email address) if you sign up.
- Authentication details if you sign in via Google (your email address).
- Subscription details (whether you purchased a weekly or lifetime subscription, but never your full payment information — Apple manages that).

We do **not** sell or share this data with any third parties. Your logged data is stored securely and used only to power features like streaks, insights, and reports.

If you contact us directly, we may receive additional information such as your name, email address, and the contents of your message.

---

## How We Use Your Information

We use the data we collect in several ways, including to:

- Provide, operate, and maintain our website and app.
- Personalize and improve the user experience.
- Understand how users interact with the app.
- Develop new features and improvements.
- Communicate with you for support, updates, or relevant notifications.
- Process and manage subscriptions.
- Detect and prevent fraudulent or unauthorized activity.

---

## Subscriptions & Payments

Our app offers **weekly** and **lifetime subscriptions** through the Apple App Store.

- Payments are processed securely by Apple via your Apple ID account.
- For weekly subscriptions, renewal occurs automatically unless you cancel at least 24 hours before the end of the current billing period.
- Lifetime subscriptions are a one-time payment, providing unlimited access for the lifetime of the App.
- You can manage or cancel your subscription at any time through your Apple ID account settings.
- We do not have access to or store your payment information.
- Refunds are handled directly by Apple under their App Store refund policies.

---

## Log Files

[three-cells.com](https://three-cells.com) follows standard procedures for using log files. These logs may include IP addresses, browser type, Internet Service Provider (ISP), timestamps, referring/exit pages, and clicks. None of this is linked to personally identifiable information. It is used for analyzing trends, administering the site, and improving app performance.

---

## Third-Party Services

We may use trusted third-party tools (such as Google Sign-In, analytics, or crash reporting) to improve our services. These providers may collect limited information in accordance with their own privacy policies.

Our Privacy Policy does not apply to external websites we may link to. We advise reviewing the respective privacy policies of those third parties.

You can also control how cookies are managed through your browser settings.

---

## Google and Apple Sign-In

If you choose to sign in using Google, we access your email address via Google Sign-In to create and manage your account securely. This data is used solely for authentication and account-related features.

If you choose to sign in using Apple, we access your email address via Apple Sign-In to create and manage your account securely. This data is used solely for authentication and account-related features.

---

## Data Security

We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet-based service can be guaranteed to be 100% secure.

---

## GDPR Data Protection Rights

We want to ensure you are fully aware of your data protection rights under the GDPR. Every user is entitled to:

- **The right to access** – Request copies of your personal data.
- **The right to rectification** – Request corrections or completion of inaccurate or incomplete data.
- **The right to erasure** – Request deletion of your personal data, under certain conditions.
- **The right to restrict processing** – Request limited use of your data, under certain conditions.
- **The right to object to processing** – Object to how we process your data, under certain conditions.
- **The right to data portability** – Request that we transfer your data to another service or directly to you.

To make any such request, please contact us. We will respond within one month.

---

## Children's Information

Protecting children's privacy is important to us. We do not knowingly collect personal identifiable information from children under 13. If you believe your child provided this kind of information on our site or app, please contact us immediately and we will promptly remove it from our records.

---

## Changes to This Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Updates will be posted on our website and within the App. If the changes are significant, we will provide additional notice (such as by email or in-app notification).

---

## Contact Us

If you have any questions or concerns about this Privacy Policy, please contact us:

**Email:** [hello@three-cells.com](mailto:hello@three-cells.com)
`;

export default function PrivacyPage() {
  return (
    <article className="prose max-w-prose">
      <h1>Privacy policy</h1>
      <Markdown>{markdown}</Markdown>
    </article>
  );
}
