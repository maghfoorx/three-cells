import Markdown from "react-markdown";
import type { Route } from "../terms/+types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms of service" },
    {
      name: "description",
      content:
        "This page explains the terms and conditions for using Three Cells.",
    },
  ];
}

const markdown = `
These terms and conditions (the "Terms and Conditions") govern the use of [https://three-cells.com](https://three-cells.com) (the "Site"). This Site is owned and operated by Three Cells.

By using this Site, you indicate that you have read and understand these Terms and Conditions and agree to abide by them at all times.

## Intellectual Property

All content published and made available on our Site is the property of Three Cells and the Site's creators. This includes, but is not limited to images, text, logos, documents, downloadable files and anything that contributes to the composition of our Site.

## Age Restrictions

The minimum age to use our Site is 18 years old. By using this Site, users agree that they are over 18 years old. We do not assume any legal responsibility for false statements about age.

## Acceptable Use

As a user of our Site, you agree to use our Site legally, not to use our Site for illegal purposes, and not to:

1. Violate the intellectual property rights of the Site owners or any third party to the Site; or
2. Act in any way that could be considered fraudulent.

If we believe you are using our Site illegally or in a manner that violates these Terms and Conditions, we reserve the right to limit, suspend or terminate your access to our Site. We also reserve the right to take any legal steps necessary to prevent you from accessing our Site.

## Accounts

When you create an account on our Site, you agree to the following:

1. You are solely responsible for your account and the security and privacy of your account, including passwords or sensitive information attached to that account; and
2. All personal information you provide to us through your account is up to date, accurate, and truthful and that you will update your personal information if it changes.

We reserve the right to suspend or terminate your account if you are using our Site illegally or if you violate these Terms and Conditions.

## Services

These Terms and Conditions govern your use of the services available on our Site.

The following services are available on our Site:

- A productivity tracking tool that allows users to log and reflect on daily activities, focus time, and overall productivity scores.

These Terms and Conditions apply to all services that are displayed on our Site at the time you access it. All information, descriptions, or images that we provide about our services are as accurate as possible. However, we are not legally bound by such information, descriptions, or images as we cannot guarantee the accuracy of all services we provide. You agree to use our services at your own risk.

We reserve the right to modify or discontinue any services whenever it becomes necessary.

## Consumer Protection Law

Where the *Sale of Goods Act 1979*, the *Consumer Rights Act 2015*, or any other consumer protection legislation in your jurisdiction applies and cannot be excluded, these Terms and Conditions will not limit your legal rights and remedies under that legislation. These Terms and Conditions will be read subject to the mandatory provisions of that legislation. If there is a conflict between these Terms and Conditions and that legislation, the mandatory provisions of the legislation will apply.

## Limitation of Liability

[three-cells.com](https://three-cells.com) and our directors, officers, agents, employees, subsidiaries, and affiliates will not be liable for any actions, claims, losses, damages, liabilities and expenses including legal fees from your use of the Site.

## Indemnity

Except where prohibited by law, by using this Site you indemnify and hold harmless [three-cells.com](https://three-cells.com) and our directors, officers, agents, employees, subsidiaries, and affiliates from any actions, claims, losses, damages, liabilities and expenses including legal fees arising out of your use of our Site or your violation of these Terms and Conditions.

## Applicable Law

These Terms and Conditions are governed by the laws of the Country of England.

## Severability

If at any time any of the provisions set forth in these Terms and Conditions are found to be inconsistent or invalid under applicable laws, those provisions will be deemed void and will be removed from these Terms and Conditions. All other provisions will not be affected by the removal and the rest of these Terms and Conditions will still be considered valid.

## Changes

These Terms and Conditions may be amended from time to time in order to maintain compliance with the law and to reflect any changes to the way we operate our Site and the way we expect users to behave on our Site. We will notify users by email of changes to these Terms and Conditions or post a notice on our Site.

## Contact Details

Please contact us if you have any questions or concerns. Our contact details are as follows:

Email: [hello@three-cells.com](mailto:hello@three-cells.com)
`;

export default function TermsPage() {
  return (
    <article className="prose max-w-prose">
      <h1>Terms of service</h1>
      <Markdown>{markdown}</Markdown>
    </article>
  );
}
