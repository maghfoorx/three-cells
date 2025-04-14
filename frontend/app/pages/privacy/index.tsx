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

At [three-cells.com](https://three-cells.com), we value and care about the privacy of our users. This document outlines the types of information collected and recorded by [three-cells.com](https://three-cells.com) and how we use it.

This Privacy Policy applies to visitors of our website and app, specifically regarding the information that they share and/or we collect through our services. This policy is not applicable to any information collected offline or via channels other than this website or app.

If you have any questions about our Privacy Policy, feel free to contact us anytime at [hello@three-cells.com](mailto:hello@three-cells.com).

## Consent

By using our website or app, you hereby consent to our Privacy Policy and agree to its terms.

## Information We Collect

Three Cells is a habit and productivity tracker. We collect only the data necessary to provide our service, such as:

- Entries you log (daily summaries, hours of focus, scores).
- Basic account details (e.g., email address) if you sign up.

We do not sell or share this data with any third parties. Your logged data is stored securely and used only to power features like streaks, insights, and reports.

If you contact us directly, we may receive additional information such as your name, email address, and the contents of your message.

## Utilisation of Your Information

We use the data we gather in several ways, including to:

- Provide, operate, and maintain our website and app.
- Personalize and improve the user experience.
- Understand how users interact with the app.
- Develop new features and improvements.
- Communicate with you for support, updates, or marketing.
- Detect and prevent fraudulent activity.

## Log Files

[three-cells.com](https://three-cells.com) follows standard procedures for using log files. These logs include IP addresses, browser type, Internet Service Provider (ISP), timestamps, referring/exit pages, and possibly clicks. None of this is linked to personally identifiable information. It is used for analyzing trends and improving our site performance.

## Advertising Partners Privacy Policies

At this time, Three Cells does not display any third-party ads or use advertising networks.

If this changes in the future, we will update this policy accordingly.

## Third Party Privacy Policies

[three-cells.com](https://three-cells.com)'s Privacy Policy does not apply to external websites we may link to. We advise reviewing the respective privacy policies of those third parties.

You can also control how cookies are managed through your browser settings.

## Google Sign-In

If you choose to sign in using Google, we access your email address via Google Sign-In to create and manage your account securely. This data is used solely for authentication and account-related features.

## GDPR Data Protection Rights

We want to ensure you are fully aware of your data protection rights under the GDPR. Every user is entitled to:

- **The right to access** – Request copies of your personal data.
- **The right to rectification** – Request corrections or completion of inaccurate or incomplete data.
- **The right to erasure** – Request deletion of your personal data, under certain conditions.
- **The right to restrict processing** – Request limited use of your data, under certain conditions.
- **The right to object to processing** – Object to how we process your data, under certain conditions.
- **The right to data portability** – Request that we transfer your data to another service or directly to you.

To make any such request, please contact us. We will respond within one month.

## Children's Information

Protecting children's privacy is important to us. We do not knowingly collect personal identifiable information from children under 13. If you believe your child provided this kind of information on our site, contact us immediately and we’ll promptly remove it from our records.
`;

export default function PrivacyPage() {
  return (
    <article className="prose max-w-prose">
      <h1>Privacy policy</h1>
      <Markdown>{markdown}</Markdown>
    </article>
  );
}
