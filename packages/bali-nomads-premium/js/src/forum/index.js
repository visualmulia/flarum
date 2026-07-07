import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import Button from 'flarum/common/components/Button';
import UserSettingsPage from 'flarum/forum/components/UserSettingsPage';
import FieldSet from 'flarum/common/components/FieldSet';
import Select from 'flarum/common/components/Select';
import CookForSocialsModal from './components/CookForSocialsModal';

app.initializers.add('visualmulia-bali-nomads-premium', () => {
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

  // 2. Self-Selected Specialization Badge for Members
  extend(UserSettingsPage.prototype, 'oninit', function() {
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

  extend(UserSettingsPage.prototype, 'settingsItems', function(items) {
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

  UserSettingsPage.prototype.saveRole = function(value) {
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
});
