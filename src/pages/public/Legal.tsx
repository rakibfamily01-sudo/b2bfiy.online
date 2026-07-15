import React from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';

export default function Legal() {
  const { currentPath } = useApp();
  const isPrivacy = currentPath === '/privacy-policy';

  return (
    <Layout title={isPrivacy ? "Privacy Policy" : "Terms & Conditions"}>
      <section className="py-16 md:py-24 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase rounded-full mb-4">
            Legal
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mb-4">
            {isPrivacy ? "Privacy Policy & Disclosures" : "Terms & Conditions of Service"}
          </h1>
          <p className="text-brand-secondary text-xs font-medium">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-3xl mx-auto prose prose-sm text-brand-secondary leading-relaxed">
          {isPrivacy ? (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-brand-dark mb-2">1. Information We Collect</h3>
              <p className="text-xs md:text-sm">
                We collect personal information that you voluntarily submit to us when requesting a Free Digital Audit or contacting our representatives. This information includes your name, email address, WhatsApp telephone number, business brand, and social media handles.
              </p>

              <h3 className="text-xl font-bold text-brand-dark mb-2">2. How We Use Collected Data</h3>
              <p className="text-xs md:text-sm">
                We use your business parameters to compile the digital presence report requested by you. We use WhatsApp and email coordinates to deliver the corresponding audit PDF sheets and coordinate your follow-up bookings.
              </p>

              <h3 className="text-xl font-bold text-brand-dark mb-2">3. Storage Security & Disclosures</h3>
              <p className="text-xs md:text-sm">
                We store lead parameters inside our isolated secure relational databases. We do not sell, leak, or lease client credentials to external third-party agencies or advertising servers. All file shares remain 100% private.
              </p>

              <h3 className="text-xl font-bold text-brand-dark mb-2">4. Client Control & Deletions</h3>
              <p className="text-xs md:text-sm">
                Clients retain absolute control. At any point, you can email or WhatsApp us requesting the deletion of your previous audits, files, contact logs, or email coordinates from our agency CRM dashboard.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-brand-dark mb-2">1. Agreement of Terms</h3>
              <p className="text-xs md:text-sm">
                By browsing the B2bfiy agency portal, ordering custom graphic, code, or video bundles, or subscribing to our monthly SMM campaigns, you agree to comply with and be bound by these legal terms.
              </p>

              <h3 className="text-xl font-bold text-brand-dark mb-2">2. Subscription Payments & Cycles</h3>
              <p className="text-xs md:text-sm">
                Monthly SMM plans are billed in advance over standard recurring cycle dates. Clients can cancel their subscriptions with a minimum of 5 working days before their subsequent cycle renewals.
              </p>

              <h3 className="text-xl font-bold text-brand-dark mb-2">3. Intellectual Property Rights</h3>
              <p className="text-xs md:text-sm">
                Upon final delivery and clearance of corresponding invoice payments, all ownership rights, Figma drafts, Photoshop sources, compiled codes, and video clips transfer entirely to the client for unrestricted corporate or marketing use.
              </p>

              <h3 className="text-xl font-bold text-brand-dark mb-2">4. Disclaimers</h3>
              <p className="text-xs md:text-sm">
                While B2bfiy designs represent the highest professional standard, we do not guarantee exact percentage conversions or revenue figures as traffic and market fluctuations are dependent on third-party channels (Meta, Google, TikTok).
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
