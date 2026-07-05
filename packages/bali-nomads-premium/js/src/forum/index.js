import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

// -------------------------------------------------------------
// 1. NDA Agreement Modal
// -------------------------------------------------------------
class NdaModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.accepted = false;
    this.loading = false;
    this.discussion = this.attrs.discussion;
  }

  className() {
    return 'NdaModal Modal--small';
  }

  title() {
    return app.translator.trans('bali-nomads-premium.forum.nda_locked_title');
  }

  content() {
    return (
      <div class="Modal-body">
        <div class="nda-content-box">
          <h4>CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT</h4>
          <p>By accessing the documents and information within this discussion, you agree to keep all financial details, pitcher identities, projections, and operational data strictly confidential. You may not distribute, reproduce, or share any sensitive data with third parties without the express written consent of the business owner.</p>
          <p>This agreement is legally binding. Any breach of confidentiality may result in immediate termination of membership and potential legal action under Indonesian and international commercial law.</p>
        </div>
        <label class="nda-checkbox-label">
          <input
            type="checkbox"
            checked={this.accepted}
            onchange={(e) => {
              this.accepted = e.target.checked;
            }}
          />
          I have read and agree to be bound by the terms of this Non-Disclosure Agreement (NDA).
        </label>
        <div class="Modal-footer">
          {Button.component(
            {
              className: 'Button Button--primary',
              type: 'submit',
              loading: this.loading,
              disabled: !this.accepted,
            },
            'Agree & View Sensitive Content'
          )}
        </div>
      </div>
    );
  }

  onsubmit(e) {
    e.preventDefault();
    this.loading = true;

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/nda-consent',
      body: { discussionId: this.discussion.id() }
    }).then(() => {
      this.loading = false;
      this.discussion.pushData({
        attributes: { hasAgreedNda: true }
      });
      this.hide();
      window.location.reload();
    }).catch(() => {
      this.loading = false;
      m.redraw();
    });
  }
}

// -------------------------------------------------------------
// 2. KYC Submission Component
// -------------------------------------------------------------
class KycSettingsSection {
  oninit() {
    this.docType = 'passport';
    this.docNumber = '';
    this.file = null;
    this.loading = false;
    this.error = '';
  }

  view() {
    const user = app.session.user;
    if (!user) return null;

    const status = user.attribute('kycStatus') || 'unverified';
    const tier = user.attribute('kycTier') || 'none';

    return (
      <fieldset class="Settings-kyc">
        <legend>Identity Verification (KYC)</legend>
        
        {status === 'verified' && (
          <div class="Alert Alert--success">
            <i class="fas fa-check-circle"></i> Verification Approved: You are verified as a <strong>{tier.toUpperCase()}</strong>.
          </div>
        )}
        
        {status === 'pending' && (
          <div class="Alert Alert--warning">
            <i class="fas fa-clock"></i> Verification Pending: Your documents are currently being reviewed by administrators.
          </div>
        )}
        
        {status === 'unverified' && (
          <div class="KycForm-container">
            <p class="helpText">To unlock premium tags like "The Vault" and "Business for Sale", you must submit your identity verification.</p>
            
            <div class="Form-group">
              <label>Select Target Badge</label>
              <select class="FormControl" onchange={(e) => this.tier = e.target.value}>
                <option value="">Select...</option>
                <option value="investor">Verified Investor</option>
                <option value="consultant">Vetted Consultant</option>
              </select>
            </div>
            
            <div class="Form-group">
              <label>Document Type</label>
              <select class="FormControl" onchange={(e) => this.docType = e.target.value}>
                <option value="passport">Passport</option>
                <option value="id_card">National ID Card</option>
              </select>
            </div>
            
            <div class="Form-group">
              <label>Document / Passport Number</label>
              <input 
                type="text" 
                class="FormControl" 
                placeholder="e.g. A1234567" 
                oninput={(e) => this.docNumber = e.target.value} 
              />
            </div>
            
            <div class="Form-group">
              <label>Upload Document Copy (PDF, JPG, PNG)</label>
              <input 
                type="file" 
                class="FormControl"
                onchange={(e) => this.file = e.target.files[0]} 
              />
            </div>
            
            {this.error && <div class="Alert Alert--danger">{this.error}</div>}
            
            {Button.component(
              {
                className: 'Button Button--primary',
                loading: this.loading,
                disabled: !this.tier || !this.docNumber || !this.file,
                onclick: this.onsubmit.bind(this)
              },
              'Submit Verification Details'
            )}
          </div>
        )}
      </fieldset>
    );
  }

  onsubmit(e) {
    e.preventDefault();
    this.loading = true;
    this.error = '';

    const formData = new FormData();
    formData.append('kycTier', this.tier);
    formData.append('kycDocumentType', this.docType);
    formData.append('kycDocumentNumber', this.docNumber);
    formData.append('document', this.file);

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/kyc/submit',
      body: formData,
      serialize: raw => raw
    }).then(() => {
      this.loading = false;
      app.session.user.pushData({
        attributes: { kycStatus: 'pending', kycTier: this.tier }
      });
      m.redraw();
    }).catch((err) => {
      this.loading = false;
      this.error = err.response && err.response.error ? err.response.error : 'Submission failed. Please try again.';
      m.redraw();
    });
  }
}

// Helper to render badge
const getKycBadge = (user) => {
  if (!user) return null;
  const status = user.attribute('kycStatus');
  const tier = user.attribute('kycTier');

  if (status === 'verified') {
    if (tier === 'investor') {
      return (
        <span class="KycBadge KycBadge--investor" title={app.translator.trans('bali-nomads-premium.forum.kyc_badge_investor')}>
          <i class="fas fa-check-circle"></i> Investor
        </span>
      );
    } else if (tier === 'consultant') {
      return (
        <span class="KycBadge KycBadge--consultant" title={app.translator.trans('bali-nomads-premium.forum.kyc_badge_consultant')}>
          <i class="fas fa-user-shield"></i> Consultant
        </span>
      );
    }
  }
  return null;
};

// Initialize Flarum Extensions
app.initializers.add('visualmulia-bali-nomads-premium', () => {
  const CommentPost = app.forum.postComponents.comment;
  const UserCard = app.forum.components.UserCard;
  const DiscussionPage = app.forum.components.DiscussionPage;
  const SettingsPage = app.forum.components.SettingsPage;

  // 3. User Badge UI Integration
  extend(CommentPost.prototype, 'headerItems', function (items) {
    const user = this.attrs.post.user();
    const badge = getKycBadge(user);
    if (badge) {
      items.add('kyc-badge', badge, 100);
    }
  });

  extend(UserCard.prototype, 'infoItems', function (items) {
    const user = this.attrs.user;
    const badge = getKycBadge(user);
    if (badge) {
      items.add('kyc-badge', badge, 100);
    }
  });

  // 4. NDA Popup Logic on Discussion Page
  extend(DiscussionPage.prototype, 'oncreate', function () {
    const discussion = this.discussion;
    if (discussion && discussion.attribute('requiresNda') && !discussion.attribute('hasAgreedNda')) {
      app.modal.show(NdaModal, { discussion });
    }

    // Capture button clicks on redacted post NDA buttons
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('sign-nda-btn')) {
        app.modal.show(NdaModal, { discussion });
      }
    });
  });

  // 5. KYC Settings Form Integration
  extend(SettingsPage.prototype, 'settingsItems', function (items) {
    items.add('kyc-verification', <KycSettingsSection />, 80);
  });
});
