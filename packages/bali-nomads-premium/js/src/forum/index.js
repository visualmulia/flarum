import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import Button from 'flarum/common/components/Button';
import FieldSet from 'flarum/common/components/FieldSet';
import Select from 'flarum/common/components/Select';
import CookForSocialsModal from './components/CookForSocialsModal';

app.initializers.add('visualmulia-bali-nomads-premium', () => {
  try {
    // Translate "Start a Discussion" button to "Mulai Diskusi" dynamically
    if (app.translator && app.translator.translations) {
      app.translator.translations['core.forum.index.start_discussion_button'] = 'Mulai Diskusi';
    }

    // Retrieve Flarum core components safely from app.components
    const components = app.components || {};
    const SettingsPage = components.SettingsPage;
    const WelcomeHero = components.WelcomeHero;
    const GlobalSearch = components.GlobalSearch;

    // 1. Social Curation Dashboard for Admins
    extend(DiscussionControls, 'moderationControls', function(items, discussion) {
      if (app.session.user && app.session.user.isAdmin()) {
        items.add('cook-for-socials', (
          <Button
            icon="fas fa-tools"
            onclick={() => app.modal.show(CookForSocialsModal, { discussion })}
          >
            🔧 Cook for Socials
          </Button>
        ));
      }
    });

    // 2. Self-Selected Specialization Badge for Members (Settings Page integration)
    if (SettingsPage) {
      extend(SettingsPage.prototype, 'oninit', function() {
        this.selectedRole = '';
        app.request({
          method: 'GET',
          url: app.forum.attribute('apiUrl') + '/user-role'
        }).then(response => {
          if (response && response.data) {
            this.selectedRole = String(response.data.roleId || '');
            m.redraw();
          }
        });
      });

      extend(SettingsPage.prototype, 'settingsItems', function(items) {
        items.add('select-specialization', (
          <FieldSet className="Settings-specialization" label="Pilih Spesialisasi Peran Anda" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
            <div className="helpText" style="margin-bottom: 0.75rem; font-size: 0.9rem; color: #5f6862; font-weight: 500;">
              Pilih spesialisasi Anda untuk menampilkan badge profesional resmi di samping profil Anda di forum Widatama.
            </div>
            {Select.component({
              options: {
                '': 'Belum memilih / Hapus badge',
                '4': 'Developer (Software Engineer / Tech Builder)',
                '5': 'Marketer (Growth Hacker / Digital Marketer)',
                '6': 'Creator (Content Creator / Digital Designer)'
              },
              value: this.selectedRole || '',
              onchange: (value) => {
                this.selectedRole = value;
                this.saveRole(value);
              }
            })}
          </FieldSet>
        ), 50); // High priority order placement
      });

      SettingsPage.prototype.saveRole = function(value) {
        app.alerts.dismiss(this.roleAlert);
        app.request({
          method: 'POST',
          url: app.forum.attribute('apiUrl') + '/user-role',
          body: {
            roleId: value
          }
        }).then(response => {
          app.alerts.show(this.roleAlert = { type: 'success' }, 'Spesialisasi peran berhasil diperbarui!');
          // Force reload the page after 1 second so the avatar/header badge displays the change immediately
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }).catch(err => {
          app.alerts.show(this.roleAlert = { type: 'error' }, 'Gagal memperbarui peran.');
        });
      };
    }

    // 3. Overhaul WelcomeHero to clean Giffgaff style with centered Big Search component
    if (WelcomeHero && GlobalSearch) {
      override(WelcomeHero.prototype, 'view', function(original) {
        if (this.hidden) return null;

        return (
          <header className="Hero WelcomeHero GiffgaffHero">
            <div className="container">
              <Button
                icon="fas fa-times"
                className="Hero-close Button Button--link"
                onclick={() => this.hide()}
              />
              <div className="containerNarrow Hero-content">
                <h1 className="Hero-title">Selamat Datang di Widatama Bootcamp</h1>
                <p className="Hero-subtitle">Wadah Inovasi Digital Anak Muda</p>
                <div className="Hero-search-wrapper">
                  <GlobalSearch state={app.search.state} />
                </div>
              </div>
            </div>
          </header>
        );
      });
    }
  } catch (error) {
    console.error('VisualMulia Premium Extension Init Error:', error);
  }
});
