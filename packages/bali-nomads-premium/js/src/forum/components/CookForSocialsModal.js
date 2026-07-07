import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

export default class CookForSocialsModal extends Modal {
  className() {
    return 'CookForSocialsModal Modal--large';
  }

  title() {
    return '🔧 Social Media Curation Dashboard';
  }

  oninit(vnode) {
    super.oninit(vnode);
    this.discussion = this.attrs.discussion;
    this.loading = false;
    this.twitterText = '';
    this.threadsText = '';
    this.facebookText = '';
    this.error = null;
  }

  content() {
    return (
      <div className="Modal-body" style="font-family: var(--font-body);">
        <div className="Form-group">
          <p className="helpText" style="font-size: 0.95rem; font-weight: 500; color: #5f6862; margin-bottom: 1.5rem;">
            Konversikan postingan forum <strong>{this.discussion.title()}</strong> ke format media sosial menggunakan kekuatan kecerdasan buatan (Gemini 2.5 Flash).
          </p>
        </div>

        {this.loading ? (
          <div className="CookForSocials-loading" style="padding: 4rem 0; text-align: center;">
            <LoadingIndicator />
            <p style="margin-top: 1.5rem; color: #1e3f20; font-weight: 800; font-size: 1.1rem;">Sedang meracik konten media sosial...</p>
          </div>
        ) : this.twitterText ? (
          <div className="CookForSocials-results" style="display: flex; flex-direction: column; gap: 2rem; width: 100%;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; width: 100%;">

              {/* Column 1: Twitter */}
              <div className="curation-col" style="display: flex; flex-direction: column; gap: 0.75rem; background: #fcfbf9; padding: 1.5rem; border: 2px solid #191919; border-radius: 16px; box-shadow: 4px 4px 0px 0px #191919;">
                <h4 style="font-weight: 900; color: #1e3f20; font-family: var(--font-title); font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid #191919; padding-bottom: 0.5rem;">
                  <i className="fab fa-twitter"></i> X / Twitter (Thread)
                </h4>
                <textarea
                  className="FormControl"
                  rows="12"
                  value={this.twitterText}
                  oninput={(e) => this.twitterText = e.target.value}
                  style="font-family: var(--font-body); font-weight: 700; line-height: 1.5; border: 2px solid #191919; border-radius: 8px; background-color: #f6f4f0; color: #191919; padding: 0.75rem; outline: none;"
                />
                <Button
                  className="Button Button--primary"
                  onclick={() => this.copyToClipboard(this.twitterText, 'Twitter')}
                  style="background-color: #1e3f20; color: #fcfbf9; border: 2px solid #191919; border-radius: 9999px; box-shadow: 3px 3px 0px 0px #191919; font-weight: 800; width: 100%; transition: all 0.2s;"
                >
                  <i className="fas fa-copy"></i> Copy X Thread
                </Button>
              </div>

              {/* Column 2: Threads */}
              <div className="curation-col" style="display: flex; flex-direction: column; gap: 0.75rem; background: #fcfbf9; padding: 1.5rem; border: 2px solid #191919; border-radius: 16px; box-shadow: 4px 4px 0px 0px #191919;">
                <h4 style="font-weight: 900; color: #1e3f20; font-family: var(--font-title); font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid #191919; padding-bottom: 0.5rem;">
                  <i className="fab fa-instagram"></i> Meta Threads (Storytelling)
                </h4>
                <textarea
                  className="FormControl"
                  rows="12"
                  value={this.threadsText}
                  oninput={(e) => this.threadsText = e.target.value}
                  style="font-family: var(--font-body); font-weight: 700; line-height: 1.5; border: 2px solid #191919; border-radius: 8px; background-color: #f6f4f0; color: #191919; padding: 0.75rem; outline: none;"
                />
                <Button
                  className="Button Button--primary"
                  onclick={() => this.copyToClipboard(this.threadsText, 'Threads')}
                  style="background-color: #1e3f20; color: #fcfbf9; border: 2px solid #191919; border-radius: 9999px; box-shadow: 3px 3px 0px 0px #191919; font-weight: 800; width: 100%; transition: all 0.2s;"
                >
                  <i className="fas fa-copy"></i> Copy Threads Text
                </Button>
              </div>

              {/* Column 3: Facebook */}
              <div className="curation-col" style="display: flex; flex-direction: column; gap: 0.75rem; background: #fcfbf9; padding: 1.5rem; border: 2px solid #191919; border-radius: 16px; box-shadow: 4px 4px 0px 0px #191919;">
                <h4 style="font-weight: 900; color: #1e3f20; font-family: var(--font-title); font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid #191919; padding-bottom: 0.5rem;">
                  <i className="fab fa-facebook"></i> Facebook (Structured)
                </h4>
                <textarea
                  className="FormControl"
                  rows="12"
                  value={this.facebookText}
                  oninput={(e) => this.facebookText = e.target.value}
                  style="font-family: var(--font-body); font-weight: 700; line-height: 1.5; border: 2px solid #191919; border-radius: 8px; background-color: #f6f4f0; color: #191919; padding: 0.75rem; outline: none;"
                />
                <Button
                  className="Button Button--primary"
                  onclick={() => this.copyToClipboard(this.facebookText, 'Facebook')}
                  style="background-color: #1e3f20; color: #fcfbf9; border: 2px solid #191919; border-radius: 9999px; box-shadow: 3px 3px 0px 0px #191919; font-weight: 800; width: 100%; transition: all 0.2s;"
                >
                  <i className="fas fa-copy"></i> Copy FB Post
                </Button>
              </div>

            </div>

            <div style="text-align: center; margin-top: 1.5rem;">
              <Button
                className="Button"
                onclick={() => this.generateContent()}
                style="border: 2px solid #191919; border-radius: 9999px; box-shadow: 4px 4px 0px 0px #191919; font-weight: 800; background-color: #c5a880; color: #191919; padding: 0.5rem 2rem; transition: all 0.2s;"
              >
                <i className="fas fa-sync-alt"></i> Racik Ulang Semua
              </Button>
            </div>
          </div>
        ) : (
          <div style="text-align: center; padding: 2rem 0;">
            {this.error && (
              <div className="Alert Alert--danger" style="margin-bottom: 1.5rem; border: 2px solid #191919; border-radius: 8px; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #b72a2a; background-color: #fce8e6;">
                {this.error}
              </div>
            )}
            <Button
              className="Button Button--primary"
              onclick={() => this.generateContent()}
              style="background-color: #1e3f20; color: #fcfbf9; border: 2px solid #191919; border-radius: 9999px; box-shadow: 4px 4px 0px 0px #191919; font-weight: 800; padding: 0.75rem 2.5rem; font-size: 1.1rem; transition: all 0.2s;"
            >
              🚀 Mulai Racik Konten Sosmed
            </Button>
          </div>
        )}
      </div>
    );
  }

  generateContent() {
    this.loading = true;
    this.error = null;
    m.redraw();

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/cook-socials',
      body: {
        discussionId: this.discussion.id()
      }
    }).then(response => {
      this.loading = false;
      if (response && response.data) {
        this.twitterText = response.data.twitter;
        this.threadsText = response.data.threads;
        this.facebookText = response.data.facebook;
      } else {
        this.error = 'Respon server tidak valid.';
      }
      m.redraw();
    }).catch(err => {
      this.loading = false;
      this.error = err.response && err.response.error ? err.response.error : 'Gagal menghubungi server.';
      m.redraw();
    });
  }

  copyToClipboard(text, platform) {
    navigator.clipboard.writeText(text).then(() => {
      app.alerts.show({ type: 'success' }, platform + ' content copied to clipboard!');
    }).catch(err => {
      app.alerts.show({ type: 'error' }, 'Failed to copy to clipboard.');
    });
  }
}
